// Admin routes - Full administrative control
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var emailService = require('../services/email');
var router = express.Router();

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
    
    var totalUsers = await database.collection('users').countDocuments();
    var verifiedUsers = await database.collection('users').countDocuments({ isVerified: true });
    var pendingKyc = await database.collection('users').countDocuments({ 'kyc.status': 'submitted' });
    
    var totalProjects = await database.collection('projects').countDocuments();
    var pendingProjects = await database.collection('projects').countDocuments({ status: 'pending_review' });
    var activeProjects = await database.collection('projects').countDocuments({ status: 'active' });
    
    var totalInvestments = await database.collection('investments').countDocuments();
    var investmentStats = await database.collection('investments').aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]).toArray();
    
    var pendingWithdrawals = await database.collection('withdrawals').countDocuments({ status: 'pending' });
    var withdrawalStats = await database.collection('withdrawals').aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]).toArray();
    
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

// ==================== USER MANAGEMENT ====================

// Get all users with filters
router.get('/users', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var skip = (page - 1) * limit;
    var role = req.query.role;
    var kycStatus = req.query.kycStatus;
    var verified = req.query.verified;
    
    var filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter['kyc.status'] = kycStatus;
    if (verified !== undefined) filter.isVerified = verified === 'true';
    
    var database = await db.getDb();
    var users = await database.collection('users')
      .find(filter)
      .project({ password: 0 }) // Exclude password
      .sort({ createdAt: -1 })
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
      .find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get user's withdrawals
    var withdrawals = await database.collection('withdrawals')
      .find({ userId: req.params.id })
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
    var limit = parseInt(req.query.limit) || 20;
    var skip = (page - 1) * limit;
    var status = req.query.status;
    
    var filter = {};
    if (status) filter.status = status;
    
    var database = await db.getDb();
    var projects = await database.collection('projects')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('projects').countDocuments(filter);
    
    projects = projects.map(function(p) {
      return { ...p, id: p._id.toString() };
    });
    
    res.json({
      projects: projects,
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
      'status', 'featured', 'isCompanyProject', 'priority', 'tags'
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
    
    for (var i = 0; i < investments.length; i++) {
      var inv = investments[i];
      var sharePercent = inv.amount / totalInvested;
      var profitShare = investorProfitPool * sharePercent; // Share of INVESTOR pool, not gross
      
      // Add to user wallet
      await database.collection('users').updateOne(
        { _id: new ObjectId(inv.userId) },
        {
          $inc: {
            walletBalance: profitShare,
            totalEarnings: profitShare
          }
        }
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
    
    // Save all distributions
    await database.collection('profit_distributions').insertMany(distributions);
    
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
        var userIds = projectInvestments.map(function(inv) { return new ObjectId(inv.userId); });
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

module.exports = router;
