// Projects routes - MongoDB version
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

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
    min_investment: p.minInvestment || p.min_investment || 100,
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
    createdAt: p.createdAt
  };
}

// Get all ACTIVE projects (public)
router.get('/', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 10;
    var skip = (page - 1) * limit;
    var category = req.query.category;
    
    // Only show active projects to public
    var filter = { status: 'active' };
    if (category) {
      filter.category = category;
    }
    
    var database = await db.getDb();
    var projects = await database.collection('projects')
      .find(filter)
      // Higher priority first, then featured, then newest
      .sort({ priority: -1, featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('projects').countDocuments(filter);
    
    res.json({
      projects: projects.map(normalizeProject),
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: Math.ceil(total / limit)
      }
    });
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
    
    res.json(normalizeProject(project));
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
