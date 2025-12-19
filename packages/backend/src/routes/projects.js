// Projects routes - MongoDB version
var express = require('express');
var db = require('../../../database/src/index');
var router = express.Router();

// Get all projects with pagination and filtering
router.get('/', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 10;
    var skip = (page - 1) * limit;
    var category = req.query.category;
    
    var filter = {};
    if (category) {
      filter.category = category;
    }
    
    var database = await db.getDb();
    var projects = await database.collection('projects')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('projects').countDocuments(filter);
    
    // Transform _id to id and normalize field names for frontend compatibility
    projects = projects.map(function(p) {
      return {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        image_url: p.imageUrl || p.image_url,
        goal_amount: p.goalAmount || p.goal_amount || 0,
        raised_amount: p.raisedAmount || p.raised_amount || 0,
        min_investment: p.minInvestment || p.min_investment || 100,
        target_return: p.targetReturn || p.target_return || '10-15%',
        end_date: p.endDate || p.end_date,
        createdAt: p.createdAt
      };
    });
    
    res.json({
      projects: projects,
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
    var ObjectId = require('mongodb').ObjectId;
    
    var database = await db.getDb();
    var project = await database.collection('projects').findOne({ _id: new ObjectId(id) });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Normalize field names for frontend
    res.json({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      category: project.category,
      image_url: project.imageUrl || project.image_url,
      goal_amount: project.goalAmount || project.goal_amount || 0,
      raised_amount: project.raisedAmount || project.raised_amount || 0,
      min_investment: project.minInvestment || project.min_investment || 100,
      target_return: project.targetReturn || project.target_return || '10-15%',
      end_date: project.endDate || project.end_date,
      createdAt: project.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
