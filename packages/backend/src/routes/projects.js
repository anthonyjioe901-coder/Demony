// Projects routes - MongoDB version
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

// PERF-01: Simple in-memory cache for project listings
var projectCache = {
  data: null,
  timestamp: 0,
  TTL: 30 * 1000 // 30 seconds
};

function invalidateProjectCache() {
  projectCache.data = null;
  projectCache.timestamp = 0;
}

// Escape regex special chars to prevent ReDoS attacks
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to normalize project for frontend
function normalizeProject(p) {
  return {
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    category: p.category,
    image_url: p.imageUrl || p.image_url || p.dataUrl || '',
    goal_amount: p.goalAmount || p.goal_amount || p.fundingGoal || 0,
    raised_amount: p.raisedAmount || p.raised_amount || p.currentFunding || p.current_funding || 0,
    min_investment: p.minInvestment || p.min_investment || 20,
    target_return: p.targetReturn || p.target_return || '10-15%',
    duration: p.duration,
    risk_level: p.riskLevel || p.risk_level || 'medium',
    end_date: p.endDate || p.end_date,
    status: p.status || 'active',
    owner_id: p.ownerId,
    owner_name: p.ownerName,
    featured: p.featured || false,
    priority: p.priority || p.featureOrder || 0,
    tags: Array.isArray(p.tags) ? p.tags : [],
    investor_count: p.investorCount || 0,
    total_profit_distributed: p.totalProfitDistributed || 0,
    createdAt: p.createdAt,
    
    // Investment Terms (Phase 1)
    profit_distribution_frequency: p.profitDistributionFrequency || 'as_realized',
    lock_in_period_months: parseInt(p.lockInPeriodMonths) || parseInt(p.duration) || 12,
    // Always use 80/20 split (override any old 60/40 ratios)
    profit_sharing_ratio: (p.profitSharingRatio && p.profitSharingRatio.investor === 60) 
      ? { investor: 80, platform: 20 } 
      : (p.profitSharingRatio || { investor: 80, platform: 20 }),
    early_withdrawal_penalty: p.earlyWithdrawalPenalty || null,
    principal_locked: true, // Principal is always locked until project closes
    profits_withdrawable: true, // Profits can be withdrawn anytime
    
    // Risk Information
    risk_factors: p.riskFactors || ['Market conditions may affect returns', 'Principal is locked for project duration'],
    risk_disclaimer: 'Profits are not guaranteed. Returns depend on actual project performance.',
    
    // Project Progress Status (set by admin)
    progress_status: p.progressStatus || 'not_started' // 'not_started', 'ongoing', 'completed'
  };
}

// Get all ACTIVE projects (public)
router.get('/', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = Math.min(parseInt(req.query.limit) || 100, 200); // PERF-01: Cap max limit
    var skip = (page - 1) * limit;
    var category = req.query.category && req.query.category.trim() !== '' ? req.query.category.trim() : null;
    var search = req.query.search && req.query.search.trim() !== '' ? req.query.search.trim() : null;
    
    // PERF-01: Return cached result for default unfiltered requests
    var isDefaultRequest = !category && !search && page === 1 && limit >= 100;
    if (isDefaultRequest && projectCache.data && (Date.now() - projectCache.timestamp < projectCache.TTL)) {
      return res.json(projectCache.data);
    }
    
    // Only show active projects to public
    var filter = { status: 'active' };
    
    // Add category filter
    if (category) {
      filter.category = category;
    }
    
    // Add search functionality - search all visible card fields
    if (search) {
      var escapedSearch = escapeRegex(search);
      var searchRegex = { $regex: escapedSearch, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { riskLevel: searchRegex },
        { risk_level: searchRegex },
        { targetReturn: searchRegex },
        { target_return: searchRegex },
        { ownerName: searchRegex }
      ];
    }
    
    var database = await db.getDb();
    var projects = await database.collection('projects')
      .find(filter)
      // Higher priority first, then featured, then newest
      .sort({ priority: -1, featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Recalculate funding/investor stats based on ACTIVE investments with ACTIVE users
    var projectIds = projects.map(function(p) { return p._id.toString(); });
    var statsByProjectId = {};
    if (projectIds.length > 0) {
      var investmentStats = await database.collection('investments').aggregate([
        { $match: { projectId: { $in: projectIds }, status: 'active' } },
        // Convert string userId to ObjectId for efficient index-backed lookup
        {
          $addFields: {
            userObjId: {
              $cond: {
                if: { $regexMatch: { input: { $toString: '$userId' }, regex: /^[0-9a-fA-F]{24}$/ } },
                then: { $toObjectId: '$userId' },
                else: null
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userObjId',
            foreignField: '_id',
            pipeline: [
              { $match: { isActive: { $ne: false } } },
              { $project: { _id: 1 } }
            ],
            as: 'user'
          }
        },
        { $match: { user: { $ne: [] } } },
        { $group: { _id: '$projectId', totalAmount: { $sum: '$amount' }, investorCount: { $sum: 1 } } }
      ]).toArray();
      investmentStats.forEach(function(stat) {
        statsByProjectId[stat._id.toString()] = stat;
      });
      projects.forEach(function(p) {
        var stat = statsByProjectId[p._id.toString()];
        p.currentFunding = stat ? stat.totalAmount : 0;
        p.investorCount = stat ? stat.investorCount : 0;
      });
    }
    
    var total = await database.collection('projects').countDocuments(filter);
    
    // Get unique categories for filtering
    var allCategories = await database.collection('projects').distinct('category', { status: 'active' });
    
    var responseData = {
      projects: projects.map(normalizeProject),
      categories: allCategories.filter(Boolean).sort(),
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: Math.ceil(total / limit)
      }
    };
    
    // PERF-01: Cache default request results
    if (isDefaultRequest) {
      projectCache.data = responseData;
      projectCache.timestamp = Date.now();
    }
    
    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', async function(req, res) {
  try {
    var id = req.params.id;
    
    var database = await db.getDb();
    var project = await database.collection('projects').findOne({ _id: new ObjectId(id) });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Recalculate stats for this project using ACTIVE investments with ACTIVE users
    var investmentStats = await database.collection('investments').aggregate([
      { $match: { projectId: id, status: 'active' } },
      {
        $addFields: {
          userObjId: {
            $cond: {
              if: { $regexMatch: { input: { $toString: '$userId' }, regex: /^[0-9a-fA-F]{24}$/ } },
              then: { $toObjectId: '$userId' },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userObjId',
          foreignField: '_id',
          pipeline: [
            { $match: { isActive: { $ne: false } } },
            { $project: { _id: 1 } }
          ],
          as: 'user'
        }
      },
      { $match: { user: { $ne: [] } } },
      { $group: { _id: '$projectId', totalAmount: { $sum: '$amount' }, investorCount: { $sum: 1 } } }
    ]).toArray();
    if (investmentStats[0]) {
      project.currentFunding = investmentStats[0].totalAmount;
      project.investorCount = investmentStats[0].investorCount;
    } else {
      project.currentFunding = 0;
      project.investorCount = 0;
    }

    res.json(normalizeProject(project));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ROI CALCULATOR ====================

// Calculate projected returns (informational only - profits are not guaranteed)
router.post('/:id/calculate-returns', async function(req, res) {
  try {
    var id = req.params.id;
    var amount = parseFloat(req.body.amount);
    var durationMonths = parseInt(req.body.durationMonths);
    
    var database = await db.getDb();
    var project = await database.collection('projects').findOne({ _id: new ObjectId(id) });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    var minInvestment = project.minInvestment || 20;
    if (!amount || amount < minInvestment) {
      return res.status(400).json({ error: 'Amount must be at least ' + minInvestment });
    }
    
    // Parse target return (handle various formats: "10-15%", "20% in 30 days", "25%", etc.)
    var targetReturn = project.targetReturn || '10-15%';
    // Extract all numbers from the string
    var numbers = targetReturn.match(/\d+/g);
    var minReturnPercent = numbers && numbers.length > 0 ? parseFloat(numbers[0]) : 10;
    var maxReturnPercent = numbers && numbers.length > 1 ? parseFloat(numbers[1]) : minReturnPercent;
    var avgReturnPercent = (minReturnPercent + maxReturnPercent) / 2;

    // Ensure we have valid percentages
    if (isNaN(avgReturnPercent) || avgReturnPercent <= 0) {
      avgReturnPercent = 10; // Default fallback
      minReturnPercent = 10;
      maxReturnPercent = 10;
    }
    
    // Use project duration if not specified
    var duration = durationMonths || project.duration || 12;
    var lockInPeriod = project.lockInPeriodMonths || project.duration || 12;
    
    // Profit sharing ratio (default 80/20)
    var profitSharing = project.profitSharingRatio || { investor: 80, platform: 20 };
    var investorShare = profitSharing.investor / 100;
    
    // Calculate total investment in project
    var totalProjectInvestment = project.raisedAmount || project.currentFunding || 0;
    var projectedOwnership = totalProjectInvestment > 0 
      ? (amount / (totalProjectInvestment + amount)) * 100 
      : 100;
    
    // Calculate PROJECTED returns (not guaranteed)
    // These are estimates based on target return, actual returns depend on project performance
    var annualReturnRate = avgReturnPercent / 100;
    var projectedAnnualProfit = amount * annualReturnRate;
    var projectedMonthlyProfit = projectedAnnualProfit / 12;
    var projectedTotalProfit = projectedAnnualProfit * (duration / 12);

    // Apply investor share (platform takes their cut)
    var investorAnnualProfit = projectedAnnualProfit * investorShare;
    var investorMonthlyProfit = projectedMonthlyProfit * investorShare;
    var investorTotalProfit = projectedTotalProfit * investorShare;

    // Ensure all values are valid numbers
    investorAnnualProfit = isNaN(investorAnnualProfit) ? 0 : Math.round(investorAnnualProfit * 100) / 100;
    investorMonthlyProfit = isNaN(investorMonthlyProfit) ? 0 : Math.round(investorMonthlyProfit * 100) / 100;
    investorTotalProfit = isNaN(investorTotalProfit) ? 0 : Math.round(investorTotalProfit * 100) / 100;
    var investorTotalValue = isNaN(amount + investorTotalProfit) ? amount : Math.round((amount + investorTotalProfit) * 100) / 100;
    
    res.json({
      disclaimer: 'IMPORTANT: These are PROJECTED returns only. Actual profits depend on project performance and are NOT guaranteed. You may receive more, less, or nothing.',
      
      investment: {
        amount: amount,
        durationMonths: duration,
        lockInPeriodMonths: lockInPeriod,
        principalLocked: true,
        profitsWithdrawable: true
      },
      
      projectTerms: {
        targetReturnRange: targetReturn,
        profitDistributionFrequency: project.profitDistributionFrequency || 'as_realized',
        profitSharingRatio: profitSharing,
        riskLevel: project.riskLevel || 'medium'
      },
      
      projectedReturns: {
        note: 'Based on average target return of ' + avgReturnPercent + '% annually',
        annualProfit: investorAnnualProfit,
        monthlyProfit: investorMonthlyProfit,
        totalProfit: investorTotalProfit,
        totalValue: investorTotalValue
      },
      
      returnScenarios: {
        pessimistic: {
          returnRate: minReturnPercent + '%',
          totalProfit: isNaN(amount * (minReturnPercent / 100) * investorShare * (duration / 12)) ? 0 : Math.round(amount * (minReturnPercent / 100) * investorShare * (duration / 12) * 100) / 100
        },
        optimistic: {
          returnRate: maxReturnPercent + '%',
          totalProfit: isNaN(amount * (maxReturnPercent / 100) * investorShare * (duration / 12)) ? 0 : Math.round(amount * (maxReturnPercent / 100) * investorShare * (duration / 12) * 100) / 100
        },
        worstCase: {
          returnRate: '0%',
          totalProfit: 0,
          note: 'If the project generates no profit, you receive no returns but your principal remains invested'
        }
      },
      
      ownershipEstimate: Math.round(projectedOwnership * 100) / 100
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BUSINESS OWNER ROUTES ====================

// Submit new project for review (business owners only)
router.post('/submit', authenticateToken, async function(req, res) {
  // Check if user is business owner
  if (req.user.role !== 'business_owner' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only business owners can submit projects' });
  }
  
  var name = req.body.name;
  var description = req.body.description;
  var category = req.body.category;
  var goalAmount = parseFloat(req.body.goalAmount);
  var minInvestment = parseFloat(req.body.minInvestment) || 100;
  var targetReturn = req.body.targetReturn || '10-15%';
  var duration = parseInt(req.body.duration) || 12; // months
  var riskLevel = req.body.riskLevel || 'medium';
  var businessPlan = req.body.businessPlan;
  var financialProjections = req.body.financialProjections;
  var documents = req.body.documents || [];
  
  // Validation
  if (!name || !description || !category || !goalAmount) {
    return res.status(400).json({ error: 'Name, description, category, and goal amount are required' });
  }
  
  if (goalAmount < 1000) {
    return res.status(400).json({ error: 'Minimum funding goal is $1,000' });
  }
  
  if (!businessPlan) {
    return res.status(400).json({ error: 'Business plan is required for project submission' });
  }
  
  try {
    var database = await db.getDb();
    
    // Get user details
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please complete KYC verification before submitting projects' });
    }
    
    var project = {
      name: name,
      description: description,
      category: category,
      goalAmount: goalAmount,
      raisedAmount: 0,
      minInvestment: minInvestment,
      targetReturn: targetReturn,
      duration: duration,
      riskLevel: riskLevel,
      
      // Business details
      businessPlan: businessPlan,
      financialProjections: financialProjections,
      documents: documents,
      
      // Owner info
      ownerId: req.user.id,
      ownerName: user.business ? user.business.name : user.name,
      ownerEmail: user.email,
      
      // Status
      status: 'pending_review', // pending_review, changes_requested, active, funded, completed, rejected
      
      // Review tracking
      review: {
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        feedback: null
      },
      
      // Stats
      investorCount: 0,
      totalProfitDistributed: 0,
      featured: false,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('projects').insertOne(project);
    project.id = result.insertedId.toString();
    
    res.json({
      message: 'Project submitted for review. You will be notified once reviewed.',
      project: normalizeProject(project)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my submitted projects (business owners)
router.get('/my/submissions', authenticateToken, async function(req, res) {
  if (req.user.role !== 'business_owner' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    var database = await db.getDb();
    var projects = await database.collection('projects')
      .find({ ownerId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({
      projects: projects.map(normalizeProject)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update submitted project (before approval)
router.put('/my/:id', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(req.params.id),
      ownerId: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Can only edit pending or changes_requested projects
    if (project.status !== 'pending_review' && project.status !== 'changes_requested') {
      return res.status(400).json({ error: 'Cannot edit project after approval' });
    }
    
    var allowedFields = [
      'name', 'description', 'category', 'goalAmount', 'minInvestment',
      'targetReturn', 'duration', 'riskLevel', 'businessPlan',
      'financialProjections', 'documents'
    ];
    
    var updateData = { updatedAt: new Date() };
    
    // If changes were requested, resubmit for review
    if (project.status === 'changes_requested') {
      updateData.status = 'pending_review';
      updateData['review.submittedAt'] = new Date();
    }
    
    allowedFields.forEach(function(field) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
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

module.exports = router;
module.exports.invalidateProjectCache = invalidateProjectCache;
