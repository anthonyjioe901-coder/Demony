// Investments routes - MongoDB version
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

// Create investment
router.post('/', authenticateToken, async function(req, res) {
  var projectId = req.body.projectId;
  var amount = parseFloat(req.body.amount);
  var userId = req.user.id;
  
  if (!projectId || !amount) {
    return res.status(400).json({ error: 'Project ID and amount are required' });
  }
  
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum investment is $100' });
  }
  
  try {
    var database = await db.getDb();
    
    // Check project exists
    var project = await database.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Create investment
    var investment = {
      userId: userId,
      projectId: projectId,
      projectName: project.name,
      category: project.category,
      amount: amount,
      createdAt: new Date()
    };
    
    var result = await database.collection('investments').insertOne(investment);
    
    // Update project raised amount
    await database.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      { $inc: { raisedAmount: amount } }
    );
    
    investment.id = result.insertedId.toString();
    
    res.json({
      message: 'Investment created successfully',
      investment: investment
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user investments
router.get('/my', authenticateToken, async function(req, res) {
  var userId = req.user.id;
  
  try {
    var database = await db.getDb();
    var investments = await database.collection('investments')
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    investments = investments.map(function(inv) {
      return { ...inv, id: inv._id.toString() };
    });
    
    res.json(investments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single investment
router.get('/:id', authenticateToken, async function(req, res) {
  var id = req.params.id;
  var userId = req.user.id;
  
  try {
    var database = await db.getDb();
    var investment = await database.collection('investments').findOne({
      _id: new ObjectId(id),
      userId: userId
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    investment.id = investment._id.toString();
    res.json(investment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
