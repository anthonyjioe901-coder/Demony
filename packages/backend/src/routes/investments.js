// Investments routes - MongoDB version with Wallet Integration
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

// Create investment from wallet balance
router.post('/', authenticateToken, async function(req, res) {
  var projectId = req.body.projectId;
  var amount = parseFloat(req.body.amount);
  var userId = req.user.userId || req.user.id;
  
  if (!projectId || !amount) {
    return res.status(400).json({ error: 'Project ID and amount are required' });
  }
  
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum investment is 100' });
  }
  
  try {
    var database = await db.getDb();
    
    // Check project exists and is active
    var project = await database.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.status !== 'active') {
      return res.status(400).json({ error: 'Project is not open for investment' });
    }
    
    // Check min investment
    if (amount < (project.minInvestment || 100)) {
      return res.status(400).json({ error: 'Minimum investment for this project is ' + (project.minInvestment || 100) });
    }
    
    // Check user wallet balance
    var user = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var walletBalance = user.walletBalance || 0;
    if (walletBalance < amount) {
      return res.status(400).json({ 
        error: 'Insufficient wallet balance. Please deposit funds first.',
        required: amount,
        available: walletBalance
      });
    }
    
    // Calculate ownership percentage
    var goalAmount = project.goalAmount || 100000;
    var ownershipPercent = (amount / goalAmount) * 100;
    
    // Create investment
    var investment = {
      userId: userId,
      projectId: projectId,
      projectName: project.name,
      category: project.category,
      amount: amount,
      ownershipPercent: ownershipPercent,
      status: 'active',
      earnings: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('investments').insertOne(investment);
    
    // Deduct from wallet
    await database.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $inc: { walletBalance: -amount, totalInvested: amount },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Update project funding
    await database.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $inc: { currentFunding: amount, investorCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Record transaction
    await database.collection('transactions').insertOne({
      userId: userId,
      type: 'investment',
      amount: -amount,
      status: 'success',
      reference: 'INV_' + result.insertedId.toString(),
      description: 'Investment in ' + project.name,
      projectId: projectId,
      investmentId: result.insertedId.toString(),
      createdAt: new Date()
    });
    
    investment.id = result.insertedId.toString();
    
    res.json({
      message: 'Investment successful',
      investment: {
        id: investment.id,
        projectName: investment.projectName,
        amount: investment.amount,
        ownershipPercent: investment.ownershipPercent.toFixed(2),
        status: investment.status
      },
      newWalletBalance: walletBalance - amount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invest directly with Paystack (one-time payment)
router.post('/pay', authenticateToken, async function(req, res) {
  var projectId = req.body.projectId;
  var amount = parseFloat(req.body.amount);
  var userId = req.user.userId || req.user.id;
  
  if (!projectId || !amount || amount < 100) {
    return res.status(400).json({ error: 'Valid project ID and amount (min 100) required' });
  }
  
  try {
    var https = require('https');
    var database = await db.getDb();
    
    var project = await database.collection('projects').findOne({ _id: new ObjectId(projectId) });
    if (!project || project.status !== 'active') {
      return res.status(404).json({ error: 'Project not available' });
    }
    
    var user = await database.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var reference = 'INV_' + projectId + '_' + userId + '_' + Date.now();
    
    // Create pending investment
    var pendingInvestment = await database.collection('investments').insertOne({
      userId: userId,
      projectId: projectId,
      projectName: project.name,
      category: project.category,
      amount: amount,
      ownershipPercent: (amount / (project.goalAmount || 100000)) * 100,
      status: 'pending_payment',
      paymentReference: reference,
      createdAt: new Date()
    });
    
    // Initialize Paystack
    var paystackData = JSON.stringify({
      email: user.email,
      amount: Math.round(amount * 100),
      reference: reference,
      callback_url: process.env.WEB_URL + '/investments?status=success&ref=' + reference,
      metadata: {
        userId: userId,
        projectId: projectId,
        investmentId: pendingInvestment.insertedId.toString(),
        type: 'investment'
      }
    });
    
    var paystackRes = await new Promise(function(resolve, reject) {
      var options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      };
      
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() { resolve(JSON.parse(body)); });
      });
      req.on('error', reject);
      req.write(paystackData);
      req.end();
    });
    
    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Payment initialization failed' });
    }
    
    res.json({
      message: 'Payment initialized',
      authorization_url: paystackRes.data.authorization_url,
      reference: reference,
      investmentId: pendingInvestment.insertedId.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify investment payment
router.get('/verify/:reference', authenticateToken, async function(req, res) {
  var reference = req.params.reference;
  
  try {
    var https = require('https');
    var database = await db.getDb();
    
    var investment = await database.collection('investments').findOne({ paymentReference: reference });
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    if (investment.status !== 'pending_payment') {
      return res.json({ status: investment.status, message: 'Already processed' });
    }
    
    // Verify with Paystack
    var paystackRes = await new Promise(function(resolve, reject) {
      var options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/verify/' + reference,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + process.env.PAYSTACK_SECRET_KEY }
      };
      
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() { resolve(JSON.parse(body)); });
      });
      req.on('error', reject);
      req.end();
    });
    
    if (!paystackRes.status || paystackRes.data.status !== 'success') {
      await database.collection('investments').updateOne(
        { paymentReference: reference },
        { $set: { status: 'payment_failed', updatedAt: new Date() } }
      );
      return res.status(400).json({ error: 'Payment failed' });
    }
    
    // Payment successful - activate investment
    await database.collection('investments').updateOne(
      { paymentReference: reference },
      { $set: { status: 'active', paidAt: new Date(), updatedAt: new Date() } }
    );
    
    // Update user totals
    await database.collection('users').updateOne(
      { _id: new ObjectId(investment.userId) },
      { $inc: { totalInvested: investment.amount }, $set: { updatedAt: new Date() } }
    );
    
    // Update project funding
    await database.collection('projects').updateOne(
      { _id: new ObjectId(investment.projectId) },
      { $inc: { currentFunding: investment.amount, investorCount: 1 }, $set: { updatedAt: new Date() } }
    );
    
    // Record transaction
    await database.collection('transactions').insertOne({
      userId: investment.userId,
      type: 'investment',
      amount: -investment.amount,
      status: 'success',
      reference: reference,
      description: 'Investment in ' + investment.projectName,
      projectId: investment.projectId,
      createdAt: new Date()
    });
    
    res.json({
      status: 'success',
      message: 'Investment confirmed',
      investment: {
        id: investment._id.toString(),
        projectName: investment.projectName,
        amount: investment.amount,
        ownershipPercent: investment.ownershipPercent.toFixed(2)
      }
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
