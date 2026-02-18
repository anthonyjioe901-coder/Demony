// Admin routes - Full administrative control
var express = require('express');
var db = require('../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var emailService = require('../services/email');
var { validateIdParam, toObjectId, buildUserIdFilter } = require('../utils/objectId');
var notificationService = require('../services/notifications.js');
var TYPES = notificationService.NOTIFICATION_TYPES;
var router = express.Router();

// HIGH-06: Validate :id and :updateId params on all routes that use them
router.param('id', validateIdParam);
router.param('updateId', validateIdParam);

// Escape regex special chars to prevent ReDoS attacks from user-supplied search input
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Admin audit logging - records all sensitive admin actions
async function logAdminAction(adminUserId, action, details) {
  try {
    var database = await db.getDb();
    await database.collection('admin_audit_log').insertOne({
      adminUserId: adminUserId,
      action: action,
      details: details || {},
      timestamp: new Date(),
      ip: details._ip || null
    });
  } catch (err) {
    console.error('Failed to log admin action:', err.message);
  }
}

// Middleware to check admin role
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Apply auth + admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// ==================== DASHBOARD STATS ====================

router.get('/stats', async function(req, res) {
  try {
    var database = await db.getDb();
    
    // Run all independent stats queries in parallel (was 9 sequential queries)
    var results = await Promise.all([
      database.collection('users').countDocuments(),
      database.collection('users').countDocuments({ isVerified: true }),
      database.collection('users').countDocuments({ 'kyc.status': 'submitted' }),
      database.collection('projects').countDocuments(),
      database.collection('projects').countDocuments({ status: 'pending_review' }),
      database.collection('projects').countDocuments({ status: 'active' }),
      database.collection('investments').countDocuments(),
      database.collection('investments').aggregate([
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ]).toArray(),
      database.collection('withdrawals').countDocuments({ status: 'pending' }),
      database.collection('withdrawals').aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ]).toArray()
    ]);
    
    var totalUsers = results[0];
    var verifiedUsers = results[1];
    var pendingKyc = results[2];
    var totalProjects = results[3];
    var pendingProjects = results[4];
    var activeProjects = results[5];
    var totalInvestments = results[6];
    var investmentStats = results[7];
    var pendingWithdrawals = results[8];
    var withdrawalStats = results[9];
    
    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        pendingKyc: pendingKyc
      },
      projects: {
        total: totalProjects,
        pending: pendingProjects,
        active: activeProjects
      },
      investments: {
        total: totalInvestments,
        totalAmount: investmentStats[0] ? investmentStats[0].totalAmount : 0
      },
      withdrawals: {
        pending: pendingWithdrawals,
        pendingAmount: withdrawalStats[0] ? withdrawalStats[0].totalAmount : 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== INVESTMENT MANAGEMENT ====================

// Get all investments (with user details)
router.get('/investments', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 50;
    var skip = (page - 1) * limit;
    var status = req.query.status;
    var projectId = req.query.projectId;
    var userId = req.query.userId;
    var from = req.query.from;
    var to = req.query.to;
    
    var filter = {};
    if (status) filter.status = status;
    if (projectId) filter.projectId = projectId;
    if (userId) Object.assign(filter, buildUserIdFilter(userId));
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    
    var database = await db.getDb();
    var investments = await database.collection('investments')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('investments').countDocuments(filter);
    
    var userIds = investments
      .map(function(inv) { return inv.userId ? inv.userId.toString() : null; })
      .filter(Boolean);
    
    var userObjectIds = userIds
      .filter(function(id) { return ObjectId.isValid(id); })
      .map(function(id) { return new ObjectId(id); });
    
    var users = userObjectIds.length > 0
      ? await database.collection('users')
          .find({ _id: { $in: userObjectIds } }, { projection: { password: 0 } })
          .toArray()
      : [];
    
    var userMap = {};
    users.forEach(function(u) {
      userMap[u._id.toString()] = {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role
      };
    });
    
    investments = investments.map(function(inv) {
      var invUserId = inv.userId ? inv.userId.toString() : null;
      return {
        ...inv,
        id: inv._id.toString(),
        user: invUserId ? (userMap[invUserId] || null) : null
      };
    });
    
    res.json({
      investments: investments,
      pagination: { total: total, page: page, limit: limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with filters
router.get('/users', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = Math.min(parseInt(req.query.limit) || 50, 100); // HIGH-13: Reduced from 200/500 to 50/100
    var skip = (page - 1) * limit;
    var role = req.query.role;
    var kycStatus = req.query.kycStatus;
    var verified = req.query.verified;
    var search = req.query.search && req.query.search.trim() !== '' ? req.query.search.trim() : null;
    var sortBy = req.query.sortBy || 'name'; // Default sort by name
    
    var filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter['kyc.status'] = kycStatus;
    if (verified !== undefined) filter.isVerified = verified === 'true';
    
    // Add search functionality
    if (search) {
      var escapedSearch = escapeRegex(search);
      var searchRegex = { $regex: escapedSearch, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }
    
    // Determine sort order
    var sortOptions = {};
    if (sortBy === 'name') {
      sortOptions = { name: 1 }; // A-Z
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else {
      sortOptions = { name: 1 }; // Default to name
    }
    
    var database = await db.getDb();
    var users = await database.collection('users')
      .find(filter)
      .project({ password: 0, 'kyc.idDocument': 0, 'kyc.selfie': 0 }) // Exclude password and large KYC base64 images
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('users').countDocuments(filter);
    
    users = users.map(function(u) {
      return { ...u, id: u._id.toString() };
    });
    
    res.json({
      users: users,
      pagination: { total: total, page: page, limit: limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single user details
router.get('/users/:id', async function(req, res) {
  try {
    var database = await db.getDb();
    var user = await database.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's investments
    var investments = await database.collection('investments')
      .find(buildUserIdFilter(req.params.id))
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get user's withdrawals
    var withdrawals = await database.collection('withdrawals')
      .find(buildUserIdFilter(req.params.id))
      .sort({ createdAt: -1 })
      .toArray();
    
    user.id = user._id.toString();
    user.investments = investments;
    user.withdrawals = withdrawals;
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Manually verify user email (admin override)
router.post('/users/:id/verify-email', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var result = await database.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          isVerified: true,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Admin verified email for user:', req.params.id);
    res.json({ message: 'User email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify/Reject KYC
router.post('/users/:id/kyc', async function(req, res) {
  var action = req.body.action; // 'approve' or 'reject'
  var reason = req.body.reason;
  
  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }
  
  try {
    var database = await db.getDb();
    
    var updateData = {
      'kyc.status': action === 'approve' ? 'verified' : 'rejected',
      updatedAt: new Date()
    };
    
    if (action === 'approve') {
      updateData.isVerified = true;
      updateData['kyc.verifiedAt'] = new Date();
    } else {
      updateData['kyc.rejectionReason'] = reason || 'Documents not acceptable';
    }
    
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    // Get user for email
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    
    // Send KYC result email (async)
    if (user && user.email) {
      if (action === 'approve') {
        emailService.sendKycApprovedEmail(user).catch(function(err) {
          console.error('Failed to send KYC approved email:', err);
        });
      } else {
        emailService.sendKycRejectedEmail(user, reason).catch(function(err) {
          console.error('Failed to send KYC rejected email:', err);
        });
      }
    }
    
    res.json({ message: 'KYC ' + action + 'd successfully' });
    
    // Audit log
    logAdminAction(req.user.userId, 'kyc_' + action, {
      targetUserId: req.params.id,
      targetEmail: user ? user.email : null,
      reason: reason || null,
      _ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    
    // Send notification (non-blocking)
    if (user) {
      var userId = req.params.id;
      if (action === 'approve') {
        notificationService.createNotification(userId, TYPES.KYC_APPROVED, {
          title: 'KYC Verified!',
          message: 'Your identity has been verified. You can now invest in projects.',
          link: '#/projects'
        }).catch(function() {});
      } else {
        notificationService.createNotification(userId, TYPES.KYC_REJECTED, {
          title: 'KYC Needs Attention',
          message: 'Your verification was not approved: ' + (reason || 'Documents not acceptable') + '. Please resubmit.',
          link: '#/settings'
        }).catch(function() {});
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Suspend/Activate user
router.post('/users/:id/status', async function(req, res) {
  var isActive = req.body.isActive;
  var reason = req.body.reason;
  
  try {
    var database = await db.getDb();
    
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          isActive: isActive,
          suspensionReason: isActive ? null : reason,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ message: isActive ? 'User activated' : 'User suspended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROJECT MANAGEMENT ====================

// Get all projects (including pending)
router.get('/projects', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = Math.min(parseInt(req.query.limit) || 50, 100); // HIGH-13: Reduced from 200/500 to 50/100
    var skip = (page - 1) * limit;
    var status = req.query.status && req.query.status.trim() !== '' ? req.query.status.trim() : null;
    var search = req.query.search && req.query.search.trim() !== '' ? req.query.search.trim() : null;
    var category = req.query.category && req.query.category.trim() !== '' ? req.query.category.trim() : null;
    
    var filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Add search functionality
    if (search) {
      var escapedSearch = escapeRegex(search);
      var searchRegex = { $regex: escapedSearch, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }
    
    var database = await db.getDb();
    
    // Sort: active projects first, then by funding/investors/disbursement
    // Using aggregation for complex sorting
    var pipeline = [
      { $match: filter },
      {
        $addFields: {
          // Active projects get priority 1, others get 0
          statusPriority: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          // Calculate total funding (handle different field names)
          totalFunding: { $ifNull: ['$currentFunding', { $ifNull: ['$raisedAmount', 0] }] },
          // Investor count
          investors: { $ifNull: ['$investorCount', 0] },
          // Total disbursement
          disbursement: { $ifNull: ['$totalProfitDistributed', 0] }
        }
      },
      {
        $sort: {
          statusPriority: -1,  // Active first
          totalFunding: -1,    // Most funded
          investors: -1,       // Most investors
          disbursement: -1,    // Most disbursement
          createdAt: -1        // Newest
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];
    
    var projects = await database.collection('projects')
      .aggregate(pipeline)
      .toArray();
    
    var total = await database.collection('projects').countDocuments(filter);
    
    // Get unique categories for filtering
    var allCategories = await database.collection('projects').distinct('category');
    
    projects = projects.map(function(p) {
      return { ...p, id: p._id.toString() };
    });
    
    res.json({
      projects: projects,
      categories: allCategories.filter(Boolean).sort(),
      pagination: { total: total, page: page, limit: limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Review/Approve/Reject project
router.post('/projects/:id/review', async function(req, res) {
  var action = req.body.action; // 'approve', 'reject', 'request_changes'
  var feedback = req.body.feedback;
  var changes = req.body.changes; // Optional edits to project data
  
  if (!['approve', 'reject', 'request_changes'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  
  try {
    var database = await db.getDb();
    
    var statusMap = {
      'approve': 'active',
      'reject': 'rejected',
      'request_changes': 'changes_requested'
    };
    
    var updateData = {
      status: statusMap[action],
      'review.reviewedAt': new Date(),
      'review.reviewedBy': req.user.id,
      'review.feedback': feedback,
      updatedAt: new Date()
    };
    
    if (action === 'approve' && changes) {
      Object.assign(updateData, changes);
    }
    
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    res.json({ message: 'Project ' + action + 'd successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a project directly (company-initiated projects)
router.post('/projects', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var name = req.body.name;
    var description = req.body.description;
    var category = req.body.category;
    var goalAmount = parseFloat(req.body.goalAmount !== undefined ? req.body.goalAmount : req.body.fundingGoal) || 0;
    var minInvestment = parseFloat(req.body.minInvestment) || 100;
    var targetReturn = req.body.targetReturn || '10-15%';
    var duration = req.body.duration || '12 months';
    var riskLevel = req.body.riskLevel || 'medium';
    var imageUrl = req.body.imageUrl || '';
    var documents = req.body.documents || [];
    var featured = req.body.featured || false;
    var priority = parseInt(req.body.priority !== undefined ? req.body.priority : req.body.featureOrder, 10) || 0;
    var status = req.body.status || 'active';
    var tags = Array.isArray(req.body.tags) ? req.body.tags : [];
    var progressStatus = req.body.progressStatus || 'not_started'; // 'not_started', 'ongoing', 'completed'
    
    // Validate required fields
    if (!name || !description || !category || !goalAmount) {
      return res.status(400).json({ 
        error: 'Name, description, category, and goal amount are required' 
      });
    }
    
    var project = {
      name: name,
      description: description,
      category: category,
      goalAmount: goalAmount,
      minInvestment: minInvestment,
      targetReturn: targetReturn,
      duration: duration,
      riskLevel: riskLevel,
      imageUrl: imageUrl,
      documents: documents,
      featured: featured,
      priority: priority,
      tags: tags,
      currentFunding: 0,
      investorCount: 0,
      status: status, // Admin decides if active/inactive
      progressStatus: progressStatus, // 'not_started', 'ongoing', 'completed'
      createdBy: 'admin',
      createdByAdmin: req.user.userId,
      isCompanyProject: true, // Flag to identify company-initiated projects
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('projects').insertOne(project);
    project._id = result.insertedId;
    
    res.status(201).json({
      message: 'Project created and published successfully',
      project: project
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project details (admin can edit any field)
router.put('/projects/:id', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var allowedFields = [
      'name', 'description', 'category', 'goalAmount', 'minInvestment',
      'targetReturn', 'duration', 'riskLevel', 'imageUrl', 'documents',
      'status', 'featured', 'isCompanyProject', 'priority', 'tags', 'progressStatus'
    ];
    
    var updateData = { updatedAt: new Date() };

    // Aliases / mapping for admin convenience
    if (req.body.fundingGoal !== undefined && req.body.goalAmount === undefined) {
      req.body.goalAmount = req.body.fundingGoal;
    }
    if (req.body.featureOrder !== undefined && req.body.priority === undefined) {
      req.body.priority = req.body.featureOrder;
    }

    allowedFields.forEach(function(field) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Sanitize tags
    if (updateData.tags !== undefined) {
      updateData.tags = Array.isArray(updateData.tags) ? updateData.tags : [];
    }
    
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    res.json({ message: 'Project updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Soft remove a project (admin)
router.delete('/projects/:id', async function(req, res) {
  try {
    var database = await db.getDb();

    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'removed', removedAt: new Date(), updatedAt: new Date() } }
    );

    res.json({ message: 'Project removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== WITHDRAWAL MANAGEMENT ====================

// Get all withdrawal requests
router.get('/withdrawals', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var skip = (page - 1) * limit;
    var status = req.query.status || 'pending';
    
    var filter = {};
    if (status !== 'all') filter.status = status;
    
    var database = await db.getDb();
    var withdrawals = await database.collection('withdrawals')
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            let: { odId: { $toObjectId: '$userId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$odId'] } } },
              { $project: { name: 1, email: 1 } }
            ],
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
      ]).toArray();
    
    var total = await database.collection('withdrawals').countDocuments(filter);
    
    withdrawals = withdrawals.map(function(w) {
      return { ...w, id: w._id.toString() };
    });
    
    res.json({
      withdrawals: withdrawals,
      pagination: { total: total, page: page, limit: limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve/Reject withdrawal
router.post('/withdrawals/:id/process', async function(req, res) {
  var action = req.body.action; // 'approve' or 'reject'
  var reason = req.body.reason;
  var transactionRef = req.body.transactionRef; // Payment reference for approved
  
  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }
  
  try {
    var database = await db.getDb();
    
    var withdrawal = await database.collection('withdrawals').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    var updateData = {
      status: action === 'approve' ? 'completed' : 'rejected',
      processedAt: new Date(),
      processedBy: req.user.id,
      updatedAt: new Date()
    };
    
    if (action === 'approve') {
      updateData.transactionRef = transactionRef;
      
      // Deduct from user wallet (already reserved when withdrawal requested)
    } else {
      updateData.rejectionReason = reason;
      
      // Refund to user wallet
      await database.collection('users').updateOne(
        { _id: new ObjectId(withdrawal.userId) },
        { $inc: { walletBalance: withdrawal.amount } }
      );
    }
    
    await database.collection('withdrawals').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    // Get user for email notification
    var user = await database.collection('users').findOne({ _id: new ObjectId(withdrawal.userId) });
    
    // Send withdrawal result email (async)
    if (user && user.email) {
      if (action === 'approve') {
        emailService.sendWithdrawalCompletedEmail(user, { ...withdrawal, reference: transactionRef }).catch(function(err) {
          console.error('Failed to send withdrawal completed email:', err);
        });
      } else {
        emailService.sendWithdrawalRejectedEmail(user, withdrawal, reason).catch(function(err) {
          console.error('Failed to send withdrawal rejected email:', err);
        });
      }
    }
    
    res.json({ message: 'Withdrawal ' + action + 'd successfully' });
    
    // Audit log
    logAdminAction(req.user.userId, 'process_withdrawal', {
      withdrawalId: req.params.id,
      action: action,
      amount: withdrawal.amount,
      userId: withdrawal.userId,
      reason: reason || null,
      _ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    });
    
    // Send notification (non-blocking)
    var wdUserId = withdrawal.userId.toString ? withdrawal.userId.toString() : withdrawal.userId;
    if (action === 'approve') {
      notificationService.createNotification(wdUserId, TYPES.WITHDRAWAL_APPROVED, {
        title: 'Withdrawal Approved',
        message: 'Your withdrawal of GH₵' + (withdrawal.amount || 0).toLocaleString() + ' has been approved and processed.',
        link: '#/wallet',
        metadata: { amount: withdrawal.amount }
      }).catch(function() {});
    } else {
      notificationService.createNotification(wdUserId, TYPES.WITHDRAWAL_REJECTED, {
        title: 'Withdrawal Rejected',
        message: 'Your withdrawal of GH₵' + (withdrawal.amount || 0).toLocaleString() + ' was rejected: ' + (reason || 'Contact support'),
        link: '#/wallet',
        metadata: { amount: withdrawal.amount, reason: reason }
      }).catch(function() {});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROFIT DISTRIBUTION ====================

// Distribute profits for a project
router.post('/projects/:id/distribute-profits', async function(req, res) {
  var grossProfitAmount = parseFloat(req.body.profitAmount);
  var description = req.body.description || 'Profit distribution';
  
  if (!grossProfitAmount || grossProfitAmount <= 0) {
    return res.status(400).json({ error: 'Valid profit amount required' });
  }
  
  try {
    var database = await db.getDb();
    
    // Get project
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get profit sharing ratio (default 80% to investors, 20% platform)
    var profitSharingRatio = project.profitSharingRatio || { investor: 80, platform: 20 };
    var investorSharePercent = profitSharingRatio.investor / 100;
    
    // Calculate investor portion of gross profit
    var investorProfitPool = grossProfitAmount * investorSharePercent;
    var platformFee = grossProfitAmount - investorProfitPool;
    
    // Get all investments for this project
    var investments = await database.collection('investments')
      .find({ projectId: req.params.id })
      .toArray();
    
    if (investments.length === 0) {
      return res.status(400).json({ error: 'No investments found for this project' });
    }
    
    // Calculate total invested
    var totalInvested = investments.reduce(function(sum, inv) {
      return sum + inv.amount;
    }, 0);
    
    // Distribute investor profit pool proportionally
    var distributions = [];
    
    // Build distributions array and wallet updates in parallel (was sequential per-investor)
    var walletUpdates = [];
    for (var i = 0; i < investments.length; i++) {
      var inv = investments[i];
      var sharePercent = inv.amount / totalInvested;
      var profitShare = investorProfitPool * sharePercent; // Share of INVESTOR pool, not gross
      
      // Queue wallet update for parallel execution
      walletUpdates.push(
        database.collection('users').updateOne(
          { _id: new ObjectId(inv.userId) },
          {
            $inc: {
              walletBalance: profitShare,
              totalEarnings: profitShare
            }
          }
        )
      );
      
      // Record distribution
      var distribution = {
        userId: inv.userId,
        projectId: req.params.id,
        investmentId: inv._id.toString(),
        amount: profitShare,
        sharePercent: sharePercent,
        grossProfit: grossProfitAmount,
        investorSharePercent: profitSharingRatio.investor,
        description: description,
        createdAt: new Date()
      };
      
      distributions.push(distribution);
    }
    
    // Execute all wallet credits + distribution insert in parallel
    await Promise.all([
      Promise.all(walletUpdates),
      database.collection('profit_distributions').insertMany(distributions)
    ]);
    
    // Update project total distributed (track investor portion actually paid out)
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $inc: { totalProfitDistributed: investorProfitPool },
        $set: { lastDistributionAt: new Date() }
      }
    );
    
    // Send profit distribution emails to all investors (async batch)
    var emailPromises = [];
    for (var j = 0; j < distributions.length; j++) {
      var dist = distributions[j];
      (function(distribution) {
        database.collection('users').findOne({ _id: new ObjectId(distribution.userId) })
          .then(function(invUser) {
            if (invUser && invUser.email) {
              return emailService.sendProfitEmail(invUser, distribution, project);
            }
          })
          .catch(function(err) {
            console.error('Failed to send profit email to user ' + distribution.userId + ':', err);
          });
      })(dist);
    }
    
    res.json({
      message: 'Profits distributed successfully',
      grossProfit: grossProfitAmount,
      investorShare: profitSharingRatio.investor + '%',
      platformFee: platformFee,
      totalDistributedToInvestors: investorProfitPool,
      investorCount: investments.length,
      distributions: distributions.map(function(d) {
        return { userId: d.userId, amount: d.amount, sharePercent: d.sharePercent };
      })
    });
    
    // Send profit notifications to all investors (non-blocking)
    for (var k = 0; k < distributions.length; k++) {
      (function(dist) {
        notificationService.createNotification(dist.userId, TYPES.PROFIT_DISTRIBUTED, {
          title: 'Profit Distribution',
          message: 'You earned GH₵' + dist.amount.toFixed(2) + ' from ' + project.name + '!',
          link: '#/investments',
          metadata: { amount: dist.amount, projectName: project.name }
        }).catch(function() {});
      })(distributions[k]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROJECT UPDATES (FOR INVESTORS) ====================

// Add update/announcement to project (visible only to investors)
router.post('/projects/:id/updates', async function(req, res) {
  var title = req.body.title;
  var message = req.body.message;
  var updateType = req.body.type || 'info'; // info, profit, milestone, warning
  var isPublic = req.body.isPublic || false; // If true, visible to all; if false, only investors
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }
  
  try {
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    var update = {
      projectId: req.params.id,
      projectName: project.name,
      title: title,
      message: message,
      type: updateType,
      isPublic: isPublic,
      postedBy: req.user.id,
      postedByName: 'Admin',
      createdAt: new Date()
    };
    
    await database.collection('project_updates').insertOne(update);
    
    // Also update the project's lastUpdateAt
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { lastUpdateAt: new Date() } }
    );
    
    // Send email notifications to all investors of this project (async)
    database.collection('investments').find({ projectId: req.params.id }).toArray()
      .then(function(projectInvestments) {
        var userIds = projectInvestments
          .map(function(inv) { return toObjectId(inv.userId); })
          .filter(Boolean);
        if (userIds.length === 0) return;
        
        return database.collection('users').find({ _id: { $in: userIds } }).toArray()
          .then(function(investors) {
            investors.forEach(function(investor) {
              if (investor.email) {
                emailService.sendProjectUpdateEmail(investor, project, update).catch(function(err) {
                  console.error('Failed to send project update email:', err);
                });
              }
            });
          });
      })
      .catch(function(err) {
        console.error('Failed to send project update emails:', err);
      });
    
    res.json({
      message: 'Update posted successfully',
      update: update
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all updates for a project (admin view)
router.get('/projects/:id/updates', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var updates = await database.collection('project_updates')
      .find({ projectId: req.params.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ updates: updates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a project update
router.delete('/projects/:id/updates/:updateId', async function(req, res) {
  try {
    var database = await db.getDb();
    
    await database.collection('project_updates').deleteOne({
      _id: new ObjectId(req.params.updateId),
      projectId: req.params.id
    });
    
    res.json({ message: 'Update deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== INVESTMENT LIFECYCLE MANAGEMENT ====================

// Complete/close a project and return principal to investors
router.post('/projects/:id/complete', async function(req, res) {
  var returnPrincipal = req.body.returnPrincipal !== false; // Default true
  var completionNote = req.body.note || 'Project completed successfully';
  
  try {
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.status === 'completed') {
      return res.status(400).json({ error: 'Project is already completed' });
    }
    
    // Get all active investments for this project
    var investments = await database.collection('investments')
      .find({ projectId: req.params.id, status: 'active' })
      .toArray();
    
    var totalPrincipalReturned = 0;
    var investorCount = investments.length;
    
    // Process each investment
    for (var i = 0; i < investments.length; i++) {
      var inv = investments[i];
      
      // Mark investment as completed
      await database.collection('investments').updateOne(
        { _id: inv._id },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            completionNote: completionNote,
            principalReturned: returnPrincipal,
            updatedAt: new Date()
          }
        }
      );
      
      // Return principal to wallet if requested
      if (returnPrincipal) {
        var userObjectId = toObjectId(inv.userId);
        if (userObjectId) {
          await database.collection('users').updateOne(
            { _id: userObjectId },
            {
              $inc: { walletBalance: inv.amount },
              $set: { updatedAt: new Date() }
            }
          );
          totalPrincipalReturned += inv.amount;
          
          // Record transaction
          await database.collection('transactions').insertOne({
            userId: inv.userId,
            type: 'principal_return',
            amount: inv.amount,
            status: 'success',
            reference: 'PRIN_' + inv._id.toString() + '_' + Date.now(),
            description: 'Principal returned from ' + project.name,
            projectId: req.params.id,
            investmentId: inv._id.toString(),
            createdAt: new Date()
          });
        }
      }
    }
    
    // Mark project as completed
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          completionNote: completionNote,
          principalReturned: returnPrincipal,
          updatedAt: new Date()
        }
      }
    );
    
    // Send completion emails to investors (async)
    investments.forEach(function(inv) {
      database.collection('users').findOne({ _id: toObjectId(inv.userId) })
        .then(function(user) {
          if (user && user.email) {
            emailService.sendProjectCompletionEmail(user, project, inv, returnPrincipal).catch(function(err) {
              console.error('Failed to send completion email:', err);
            });
          }
        })
        .catch(function(err) {
          console.error('Failed to get user for completion email:', err);
        });
    });
    
    res.json({
      message: 'Project completed successfully',
      projectId: req.params.id,
      investorCount: investorCount,
      principalReturned: returnPrincipal,
      totalPrincipalReturned: totalPrincipalReturned
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a project and refund all investments
router.post('/projects/:id/cancel', async function(req, res) {
  var cancellationReason = req.body.reason || 'Project cancelled by admin';
  
  try {
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.status === 'cancelled' || project.status === 'completed') {
      return res.status(400).json({ error: 'Project is already ' + project.status });
    }
    
    // Get all active investments
    var investments = await database.collection('investments')
      .find({ projectId: req.params.id, status: 'active' })
      .toArray();
    
    var totalRefunded = 0;
    var investorCount = investments.length;
    
    // Refund each investment
    for (var i = 0; i < investments.length; i++) {
      var inv = investments[i];
      
      // Mark investment as cancelled
      await database.collection('investments').updateOne(
        { _id: inv._id },
        {
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: cancellationReason,
            refunded: true,
            updatedAt: new Date()
          }
        }
      );
      
      // Refund to wallet
      var userObjectId = toObjectId(inv.userId);
      if (userObjectId) {
        await database.collection('users').updateOne(
          { _id: userObjectId },
          {
            $inc: { walletBalance: inv.amount, totalInvested: -inv.amount },
            $set: { updatedAt: new Date() }
          }
        );
        totalRefunded += inv.amount;
        
        // Record refund transaction
        await database.collection('transactions').insertOne({
          userId: inv.userId,
          type: 'refund',
          amount: inv.amount,
          status: 'success',
          reference: 'REF_' + inv._id.toString() + '_' + Date.now(),
          description: 'Refund from cancelled project: ' + project.name,
          projectId: req.params.id,
          investmentId: inv._id.toString(),
          createdAt: new Date()
        });
      }
    }
    
    // Mark project as cancelled
    await database.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: cancellationReason,
          currentFunding: 0,
          investorCount: 0,
          updatedAt: new Date()
        }
      }
    );
    
    // Send cancellation emails (async)
    investments.forEach(function(inv) {
      database.collection('users').findOne({ _id: toObjectId(inv.userId) })
        .then(function(user) {
          if (user && user.email) {
            emailService.sendProjectCancellationEmail(user, project, inv, cancellationReason).catch(function(err) {
              console.error('Failed to send cancellation email:', err);
            });
          }
        })
        .catch(function(err) {
          console.error('Failed to get user for cancellation email:', err);
        });
    });
    
    res.json({
      message: 'Project cancelled and investments refunded',
      projectId: req.params.id,
      investorCount: investorCount,
      totalRefunded: totalRefunded
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== INVESTMENT LIFECYCLE MANAGEMENT ====================

// Admin ends a specific investment (user-requested withdrawal)
router.post('/investments/:id/withdraw', async function(req, res) {
  try {
    var database = await db.getDb();
    var applyPenalty = req.body.applyPenalty || false;
    var penaltyPercent = parseFloat(req.body.penaltyPercent) || 10; // Default 10% penalty
    var reason = req.body.reason || 'User requested withdrawal';
    
    // Get the investment
    var investment = await database.collection('investments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    if (investment.status !== 'active') {
      return res.status(400).json({ error: 'Only active investments can be withdrawn. Current status: ' + investment.status });
    }
    
    // Calculate refund amount
    var principalAmount = investment.amount;
    var penaltyAmount = applyPenalty ? Math.round(principalAmount * (penaltyPercent / 100)) : 0;
    var refundAmount = principalAmount - penaltyAmount;
    
    // Get the user
    var user = await database.collection('users').findOne({ 
      $or: [
        { _id: toObjectId(investment.userId) },
        { _id: investment.userId }
      ]
    });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found. Cannot process withdrawal for orphaned investment.' });
    }
    
    // Update investment status to withdrawn
    await database.collection('investments').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: 'withdrawn',
          withdrawnAt: new Date(),
          withdrawnReason: reason,
          withdrawnByAdmin: req.user.id,
          penaltyApplied: applyPenalty,
          penaltyPercent: applyPenalty ? penaltyPercent : 0,
          penaltyAmount: penaltyAmount,
          refundAmount: refundAmount,
          updatedAt: new Date()
        }
      }
    );
    
    // Credit user's wallet with refund
    await database.collection('users').updateOne(
      { _id: user._id },
      {
        $inc: { 
          walletBalance: refundAmount,
          totalInvested: -principalAmount
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Record the transaction
    await database.collection('transactions').insertOne({
      userId: user._id.toString(),
      type: 'investment_withdrawal',
      amount: refundAmount,
      investmentId: investment._id.toString(),
      projectId: investment.projectId,
      projectName: investment.projectName,
      penaltyAmount: penaltyAmount,
      status: 'success',
      description: applyPenalty 
        ? 'Investment withdrawal (principal: GH₵' + principalAmount + ', penalty: GH₵' + penaltyAmount + ')'
        : 'Investment withdrawal (full principal returned)',
      processedBy: req.user.id,
      createdAt: new Date()
    });
    
    // Recalculate project stats
    var projectStats = await database.collection('investments').aggregate([
      { $match: { projectId: investment.projectId, status: 'active' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]).toArray();
    
    await database.collection('projects').updateOne(
      { _id: new ObjectId(investment.projectId) },
      {
        $set: {
          currentFunding: projectStats[0] ? projectStats[0].totalAmount : 0,
          investorCount: projectStats[0] ? projectStats[0].count : 0,
          updatedAt: new Date()
        }
      }
    );
    
    // Send email notification
    emailService.sendInvestmentWithdrawalEmail({
      userName: user.name,
      email: user.email,
      projectName: investment.projectName,
      principalAmount: principalAmount,
      penaltyAmount: penaltyAmount,
      refundAmount: refundAmount,
      reason: reason
    }).catch(function(err) {
      console.error('Failed to send withdrawal email:', err);
    });
    
    res.json({
      message: 'Investment withdrawn successfully',
      investmentId: req.params.id,
      principalAmount: principalAmount,
      penaltyAmount: penaltyAmount,
      refundAmount: refundAmount,
      newWalletBalance: (user.walletBalance || 0) + refundAmount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single investment details (for admin)
router.get('/investments/:id', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var investment = await database.collection('investments').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Get user details
    var user = await database.collection('users').findOne({
      $or: [
        { _id: toObjectId(investment.userId) },
        { _id: investment.userId }
      ]
    });
    
    // Get project details
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(investment.projectId)
    });
    
    res.json({
      ...investment,
      id: investment._id.toString(),
      user: user ? { id: user._id.toString(), name: user.name, email: user.email } : null,
      project: project ? { id: project._id.toString(), name: project.name, status: project.status } : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USER DELETION WITH INVESTMENT HANDLING ====================

// Delete user and handle their investments
router.delete('/users/:id', async function(req, res) {
  try {
    var database = await db.getDb();
    var orphanInvestments = req.query.orphanInvestments !== 'false'; // Default: orphan investments
    
    // Get the user first
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }
    
    // SAFEGUARD: Block deletion if user has active investments with real money
    var activeInvestments = await database.collection('investments').find({
      $or: [{ userId: req.params.id }, { userId: new ObjectId(req.params.id) }],
      status: 'active'
    }).toArray();
    
    var totalActiveAmount = activeInvestments.reduce(function(sum, inv) { return sum + (inv.amount || 0); }, 0);
    
    if (activeInvestments.length > 0 && !req.query.confirmOrphan) {
      return res.status(409).json({ 
        error: 'User has ' + activeInvestments.length + ' active investment(s) worth GH₵' + totalActiveAmount.toFixed(2) + '. '
          + 'These investments will be orphaned (money becomes unrecoverable by the user). '
          + 'Add ?confirmOrphan=true to confirm, or deactivate the user instead.',
        activeInvestments: activeInvestments.length,
        totalActiveAmount: totalActiveAmount,
        suggestion: 'Consider using POST /admin/users/:id/status to suspend the user instead.'
      });
    }
    
    var userId = req.params.id;
    var investmentsHandled = 0;
    var affectedProjects = [];
    
    // Handle investments
    if (orphanInvestments) {
      // Mark all active investments as orphaned
      var investments = await database.collection('investments').find({
        $or: [
          { userId: userId },
          { userId: new ObjectId(userId) }
        ],
        status: 'active'
      }).toArray();
      
      if (investments.length > 0) {
        var investmentIds = investments.map(function(inv) { return inv._id; });
        affectedProjects = [...new Set(investments.map(function(inv) { return inv.projectId; }))];
        
        await database.collection('investments').updateMany(
          { _id: { $in: investmentIds } },
          {
            $set: {
              status: 'orphaned',
              orphanedAt: new Date(),
              orphanedReason: 'User account deleted by admin',
              orphanedByAdmin: req.user.id,
              updatedAt: new Date()
            }
          }
        );
        
        investmentsHandled = investments.length;
        
        // Recalculate stats for affected projects
        for (var i = 0; i < affectedProjects.length; i++) {
          var projectId = affectedProjects[i];
          var stats = await database.collection('investments').aggregate([
            { $match: { projectId: projectId, status: 'active' } },
            { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
          ]).toArray();
          
          await database.collection('projects').updateOne(
            { _id: new ObjectId(projectId) },
            {
              $set: {
                currentFunding: stats[0] ? stats[0].totalAmount : 0,
                investorCount: stats[0] ? stats[0].count : 0,
                updatedAt: new Date()
              }
            }
          );
        }
      }
    }
    
    // Delete the user
    await database.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    
    // SEC-03: Cascade - cancel pending withdrawals
    var cancelledWithdrawals = await database.collection('withdrawals').updateMany(
      { userId: userId, status: 'pending' },
      { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: 'User account deleted by admin' } }
    );
    
    // SEC-03: Cascade - mark pending deposits as orphaned
    var cancelledDeposits = await database.collection('deposits').updateMany(
      { userId: userId, status: 'pending' },
      { $set: { status: 'orphaned', orphanedAt: new Date(), orphanReason: 'User account deleted by admin' } }
    );
    
    // SEC-03: Create audit trail
    await database.collection('audit_log').insertOne({
      action: 'user_deleted',
      targetUserId: userId,
      targetUserEmail: user.email,
      targetUserName: user.name,
      performedBy: req.user.id,
      investmentsOrphaned: investmentsHandled,
      withdrawalsCancelled: cancelledWithdrawals.modifiedCount,
      depositsCancelled: cancelledDeposits.modifiedCount,
      affectedProjects: affectedProjects,
      walletBalanceAtDeletion: user.walletBalance || 0,
      createdAt: new Date()
    });
    
    // Log the deletion
    console.log('Admin deleted user:', user.email, '- Investments orphaned:', investmentsHandled, '- Withdrawals cancelled:', cancelledWithdrawals.modifiedCount);
    
    res.json({
      message: 'User deleted successfully',
      userId: userId,
      userName: user.name,
      userEmail: user.email,
      investmentsOrphaned: investmentsHandled,
      affectedProjects: affectedProjects.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk delete users (with investment handling)
router.post('/users/bulk-delete', async function(req, res) {
  try {
    var userIds = req.body.userIds;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' });
    }
    
    if (userIds.length > 500) {
      return res.status(400).json({ error: 'Maximum 500 users can be deleted at once' });
    }
    
    var database = await db.getDb();
    var objectIds = userIds.map(function(id) { return new ObjectId(id); });
    
    // Don't delete admins
    var admins = await database.collection('users').find({
      _id: { $in: objectIds },
      role: 'admin'
    }).toArray();
    
    if (admins.length > 0) {
      var adminIds = admins.map(function(a) { return a._id.toString(); });
      objectIds = objectIds.filter(function(id) { 
        return adminIds.indexOf(id.toString()) === -1; 
      });
    }
    
    // Mark all their active investments as orphaned
    var investments = await database.collection('investments').find({
      $or: userIds.map(function(id) {
        return { $or: [{ userId: id }, { userId: new ObjectId(id) }] };
      }).flat(),
      status: 'active'
    }).toArray();
    
    var affectedProjects = [];
    if (investments.length > 0) {
      var investmentIds = investments.map(function(inv) { return inv._id; });
      affectedProjects = [...new Set(investments.map(function(inv) { return inv.projectId; }))];
      
      await database.collection('investments').updateMany(
        { _id: { $in: investmentIds } },
        {
          $set: {
            status: 'orphaned',
            orphanedAt: new Date(),
            orphanedReason: 'User account deleted by admin (bulk)',
            orphanedByAdmin: req.user.id,
            updatedAt: new Date()
          }
        }
      );
      
      // Recalculate stats for affected projects
      for (var i = 0; i < affectedProjects.length; i++) {
        var projectId = affectedProjects[i];
        var stats = await database.collection('investments').aggregate([
          { $match: { projectId: projectId, status: 'active' } },
          { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]).toArray();
        
        await database.collection('projects').updateOne(
          { _id: new ObjectId(projectId) },
          {
            $set: {
              currentFunding: stats[0] ? stats[0].totalAmount : 0,
              investorCount: stats[0] ? stats[0].count : 0,
              updatedAt: new Date()
            }
          }
        );
      }
    }
    
    // Delete the users
    var result = await database.collection('users').deleteMany({ _id: { $in: objectIds } });
    
    console.log('Admin bulk deleted', result.deletedCount, 'users, orphaned', investments.length, 'investments');
    
    res.json({
      message: 'Users deleted successfully',
      deletedCount: result.deletedCount,
      skippedAdmins: admins.length,
      investmentsOrphaned: investments.length,
      affectedProjects: affectedProjects.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark orphaned investments (user deleted) as orphaned
router.post('/investments/cleanup-orphaned', async function(req, res) {
  try {
    var database = await db.getDb();
    
    // Find investments where user no longer exists
    var orphanedInvestments = await database.collection('investments').aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'users',
          let: { invUserId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: '$_id' }, { $toString: '$$invUserId' }] } } },
            { $project: { _id: 1 } }
          ],
          as: 'user'
        }
      },
      { $match: { user: { $size: 0 } } },
      { $project: { _id: 1, userId: 1, projectId: 1, amount: 1 } }
    ]).toArray();
    
    if (orphanedInvestments.length === 0) {
      return res.json({ message: 'No orphaned investments found', count: 0 });
    }
    
    // Mark them as orphaned
    var ids = orphanedInvestments.map(function(inv) { return inv._id; });
    var result = await database.collection('investments').updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: 'orphaned',
          orphanedAt: new Date(),
          orphanedReason: 'User account deleted',
          updatedAt: new Date()
        }
      }
    );
    
    // Recalculate project stats for affected projects
    var projectIds = [...new Set(orphanedInvestments.map(function(inv) { return inv.projectId; }))];
    for (var i = 0; i < projectIds.length; i++) {
      var projectId = projectIds[i];
      var stats = await database.collection('investments').aggregate([
        { $match: { projectId: projectId, status: 'active' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]).toArray();
      
      await database.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        {
          $set: {
            currentFunding: stats[0] ? stats[0].totalAmount : 0,
            investorCount: stats[0] ? stats[0].count : 0,
            updatedAt: new Date()
          }
        }
      );
    }
    
    res.json({
      message: 'Orphaned investments cleaned up',
      count: result.modifiedCount,
      affectedProjects: projectIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get investment status summary
router.get('/investments/summary', async function(req, res) {
  try {
    var database = await db.getDb();
    
    var summary = await database.collection('investments').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]).toArray();
    
    var result = {
      active: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
      orphaned: { count: 0, amount: 0 },
      pending_payment: { count: 0, amount: 0 }
    };
    
    summary.forEach(function(s) {
      if (result[s._id]) {
        result[s._id] = { count: s.count, amount: s.totalAmount };
      }
    });
    
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== FINANCIAL REPORTS ====================

router.get('/reports/financial', async function(req, res) {
  try {
    var startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    var endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    var database = await db.getDb();
    
    // Total investments in period
    var investmentStats = await database.collection('investments').aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]).toArray();
    
    // Withdrawals in period
    var withdrawalStats = await database.collection('withdrawals').aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]).toArray();
    
    // Profit distributions in period
    var profitStats = await database.collection('profit_distributions').aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]).toArray();
    
    // Daily breakdown
    var dailyInvestments = await database.collection('investments').aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    res.json({
      period: { start: startDate, end: endDate },
      investments: {
        total: investmentStats[0] ? investmentStats[0].total : 0,
        count: investmentStats[0] ? investmentStats[0].count : 0
      },
      withdrawals: {
        total: withdrawalStats[0] ? withdrawalStats[0].total : 0,
        count: withdrawalStats[0] ? withdrawalStats[0].count : 0
      },
      profitDistributions: {
        total: profitStats[0] ? profitStats[0].total : 0,
        count: profitStats[0] ? profitStats[0].count : 0
      },
      dailyBreakdown: dailyInvestments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== CREDIT USER WALLET ====================

router.post('/wallet/credit', async function(req, res) {
  try {
    var { userId, email, amount, reason } = req.body;
    
    if (!amount || amount <= 0 || !isFinite(amount)) {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    
    if (amount > 1000000) {
      return res.status(400).json({ error: 'Maximum credit is GH₵1,000,000 per operation' });
    }
    
    var database = await db.getDb();
    var user = null;
    
    // Find user by ID or email
    if (userId) {
      user = await database.collection('users').findOne({ 
        $or: [
          { _id: toObjectId(userId) },
          { id: userId }
        ]
      });
    } else if (email) {
      user = await database.collection('users').findOne({ email: email.toLowerCase() });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var currentBalance = user.walletBalance || 0;
    
    // Use atomic $inc to prevent race condition (lost updates)
    await database.collection('users').updateOne(
      { _id: user._id },
      { $inc: { walletBalance: amount } }
    );
    
    var newBalance = currentBalance + amount;
    
    // Record transaction
    await database.collection('transactions').insertOne({
      userId: user._id.toString(),
      type: 'admin_credit',
      amount: amount,
      reason: reason || 'Admin credit',
      adminId: req.user.userId,
      adminName: req.user.name || req.user.email,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      createdAt: new Date()
    });
    
    // Log to audit
    await database.collection('audit_log').insertOne({
      action: 'wallet_credit',
      adminId: req.user.userId,
      adminName: req.user.name || req.user.email,
      targetType: 'user',
      targetId: user._id.toString(),
      details: 'Credited GH₵' + amount + ' - ' + (reason || 'No reason'),
      createdAt: new Date()
    });
    
    res.json({ 
      success: true, 
      newBalance: newBalance,
      userName: user.name || user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BROADCAST EMAIL ====================

router.post('/email/broadcast', async function(req, res) {
  try {
    var { target, subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message required' });
    }
    
    var database = await db.getDb();
    var filter = { role: { $ne: 'admin' } };
    
    // Build filter based on target
    if (target === 'investors') {
      filter.role = 'investor';
    } else if (target === 'verified') {
      filter.isVerified = true;
    } else if (target === 'business_owners') {
      filter.role = 'business_owner';
    }
    
    var users = await database.collection('users').find(filter, { projection: { email: 1, name: 1 } }).toArray();
    
    // Send emails (in background, don't wait)
    var sentCount = 0;
    for (var user of users) {
      try {
        if (emailService.sendEmail) {
          await emailService.sendEmail(user.email, subject, message);
          sentCount++;
        }
      } catch (e) {
        console.error('Failed to send to', user.email, e.message);
      }
    }
    
    // Log to audit
    await database.collection('audit_log').insertOne({
      action: 'broadcast_email',
      adminId: req.user.userId,
      adminName: req.user.name || req.user.email,
      targetType: 'users',
      details: 'Sent "' + subject + '" to ' + sentCount + ' users (target: ' + target + ')',
      createdAt: new Date()
    });
    
    res.json({ success: true, sentCount: sentCount, totalTargeted: users.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== VERIFY USER EMAIL ====================

router.post('/users/:id/verify-email', async function(req, res) {
  try {
    var userId = req.params.id;
    var database = await db.getDb();
    
    var result = await database.collection('users').updateOne(
      { $or: [{ _id: toObjectId(userId) }, { id: userId }] },
      { $set: { isVerified: true, verifiedAt: new Date(), verifiedBy: 'admin' } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log to audit
    await database.collection('audit_log').insertOne({
      action: 'verify_email',
      adminId: req.user.userId,
      adminName: req.user.name || req.user.email,
      targetType: 'user',
      targetId: userId,
      details: 'Email verified by admin',
      createdAt: new Date()
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SUPPORT TICKETS ====================

router.get('/support/tickets', async function(req, res) {
  try {
    var status = req.query.status;
    var limit = parseInt(req.query.limit) || 100;
    
    var database = await db.getDb();
    var filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    var tickets = await database.collection('support_tickets')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    res.json({ tickets: tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/support/tickets/:id', async function(req, res) {
  try {
    var ticketId = req.params.id;
    var database = await db.getDb();
    
    var ticket = await database.collection('support_tickets').findOne({
      $or: [
        { _id: toObjectId(ticketId) },
        { ticketId: ticketId }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/support/tickets/:id/resolve', async function(req, res) {
  try {
    var ticketId = req.params.id;
    var { resolution } = req.body;
    var database = await db.getDb();
    
    var result = await database.collection('support_tickets').updateOne(
      { $or: [{ _id: toObjectId(ticketId) }, { ticketId: ticketId }] },
      { 
        $set: { 
          status: 'resolved',
          resolution: resolution,
          resolvedAt: new Date(),
          resolvedBy: req.user.userId
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/support/tickets/:id/reply', async function(req, res) {
  try {
    var ticketId = req.params.id;
    var { message } = req.body;
    var database = await db.getDb();
    
    var reply = {
      message: message,
      adminId: req.user.userId,
      adminName: req.user.name || req.user.email,
      createdAt: new Date()
    };
    
    var result = await database.collection('support_tickets').updateOne(
      { $or: [{ _id: toObjectId(ticketId) }, { ticketId: ticketId }] },
      { 
        $push: { responses: reply },
        $set: { status: 'in_progress', updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== REFERRALS ====================

router.get('/referrals', async function(req, res) {
  try {
    var limit = parseInt(req.query.limit) || 100;
    var database = await db.getDb();
    
    // Use $lookup to join user data in one query instead of N+1 queries per referral
    var enrichedReferrals = await database.collection('referrals').aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: limit },
      {
        $addFields: {
          referrerObjId: { $cond: { if: { $regexMatch: { input: { $toString: '$referrerId' }, regex: /^[0-9a-fA-F]{24}$/ } }, then: { $toObjectId: '$referrerId' }, else: null } },
          referredObjId: { $cond: { if: { $regexMatch: { input: { $toString: '$referredId' }, regex: /^[0-9a-fA-F]{24}$/ } }, then: { $toObjectId: '$referredId' }, else: null } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'referrerObjId',
          foreignField: '_id',
          pipeline: [{ $project: { email: 1, name: 1 } }],
          as: 'referrerUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'referredObjId',
          foreignField: '_id',
          pipeline: [{ $project: { email: 1, name: 1 } }],
          as: 'referredUser'
        }
      },
      { $unwind: { path: '$referrerUser', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$referredUser', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          referrerEmail: { $ifNull: ['$referrerUser.email', 'Unknown'] },
          referrerName: { $ifNull: ['$referrerUser.name', null] },
          referredEmail: { $ifNull: ['$referredUser.email', 'Unknown'] },
          referredName: { $ifNull: ['$referredUser.name', null] }
        }
      },
      { $project: { referrerUser: 0, referredUser: 0, referrerObjId: 0, referredObjId: 0 } }
    ]).toArray();
    
    res.json({ referrals: enrichedReferrals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== TRANSACTIONS ====================

router.get('/transactions', async function(req, res) {
  try {
    var limit = parseInt(req.query.limit) || 100;
    var type = req.query.type;
    var userId = req.query.userId;
    
    var database = await db.getDb();
    var filter = {};
    
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    
    var transactions = await database.collection('transactions')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    res.json({ transactions: transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== AUDIT LOG ====================

router.get('/audit-log', async function(req, res) {
  try {
    var limit = parseInt(req.query.limit) || 100;
    var action = req.query.action;
    
    var database = await db.getDb();
    var filter = {};
    
    if (action) filter.action = action;
    
    var logs = await database.collection('audit_log')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    
    res.json({ logs: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== GET SINGLE PROJECT ====================

router.get('/projects/:id', async function(req, res) {
  try {
    var projectId = req.params.id;
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({
      $or: [
        { _id: toObjectId(projectId) },
        { id: projectId }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
