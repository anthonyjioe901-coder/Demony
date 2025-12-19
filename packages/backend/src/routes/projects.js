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
    
    // Transform _id to id for frontend compatibility
    projects = projects.map(function(p) {
      return { ...p, id: p._id.toString() };
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
    
    project.id = project._id.toString();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
