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
  
  // Risk acknowledgment fields (required)
  var termsAccepted = req.body.termsAccepted;
  var riskAcknowledged = req.body.riskAcknowledged;
  var lockInAcknowledged = req.body.lockInAcknowledged;
  
  if (!projectId || !amount) {
    return res.status(400).json({ error: 'Project ID and amount are required' });
  }
  
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum investment is 100' });
  }
  
  // Require risk acknowledgments
  if (!termsAccepted || !riskAcknowledged || !lockInAcknowledged) {
    return res.status(400).json({ 
      error: 'You must acknowledge all investment risks before proceeding',
      required: {
        termsAccepted: 'Accept investment terms and conditions',
        riskAcknowledged: 'Acknowledge that profits are not guaranteed',
        lockInAcknowledged: 'Acknowledge that principal is locked for the project duration'
      }
    });
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
    
    // Get project lock-in period
    var lockInPeriodMonths = project.lockInPeriodMonths || project.duration || 12;
    var lockInEndDate = new Date();
    lockInEndDate.setMonth(lockInEndDate.getMonth() + lockInPeriodMonths);
    
    // Calculate ownership percentage
    var goalAmount = project.goalAmount || 100000;
    var ownershipPercent = (amount / goalAmount) * 100;
    
    // Create investment with enhanced tracking
    var investment = {
      userId: userId,
      projectId: projectId,
      projectName: project.name,
      category: project.category,
      amount: amount,
      ownershipPercent: ownershipPercent,
      status: 'active',
      earnings: 0,
      
      // Lock-in tracking
      lockInPeriodMonths: lockInPeriodMonths,
      lockInEndDate: lockInEndDate,
      principalLocked: true,
      
      // Terms acceptance record
      termsAcceptance: {
        termsAccepted: true,
        riskAcknowledged: true,
        lockInAcknowledged: true,
        acceptedAt: new Date(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
        termsVersion: '1.0'
      },
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('investments').insertOne(investment);
    
    // Also record in separate collection for audit trail
    await database.collection('investment_terms_acceptance').insertOne({
      userId: userId,
      investmentId: result.insertedId.toString(),
      projectId: projectId,
      amount: amount,
      termsVersion: '1.0',
      termsAccepted: true,
      riskAcknowledged: true,
      lockInAcknowledged: true,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
      acceptedAt: new Date()
    });
    
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
        status: investment.status,
        lockInPeriodMonths: investment.lockInPeriodMonths,
        lockInEndDate: investment.lockInEndDate,
        principalLocked: true,
        profitsWithdrawable: true
      },
      newWalletBalance: walletBalance - amount,
      importantNotice: {
        message: 'Your investment is now active. Your principal is locked until ' + lockInEndDate.toLocaleDateString() + '. Profits (when distributed) can be withdrawn anytime.',
        lockInEndDate: lockInEndDate
      }
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
    
    // Get all profit distributions for this user to calculate earnings per investment
    var allDistributions = await database.collection('profit_distributions')
      .find({ userId: userId })
      .toArray();
    
    // Create a map of investmentId -> total earnings
    var earningsMap = {};
    allDistributions.forEach(function(dist) {
      var invId = dist.investmentId;
      earningsMap[invId] = (earningsMap[invId] || 0) + dist.amount;
    });
    
    investments = investments.map(function(inv) {
      var invId = inv._id.toString();
      return { 
        ...inv, 
        id: invId,
        earnings: earningsMap[invId] || 0 // Actual earnings from profit distributions
      };
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

// ==================== PROFIT HISTORY ====================

// Get profit distribution history for an investment
router.get('/:id/profit-history', authenticateToken, async function(req, res) {
  var id = req.params.id;
  var userId = req.user.id;
  
  try {
    var database = await db.getDb();
    
    // Verify investment belongs to user
    var investment = await database.collection('investments').findOne({
      _id: new ObjectId(id),
      userId: userId
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Get all profit distributions for this investment
    var distributions = await database.collection('profit_distributions')
      .find({ investmentId: id })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate totals
    var totalEarned = distributions.reduce(function(sum, d) {
      return sum + d.amount;
    }, 0);
    
    res.json({
      investmentId: id,
      projectId: investment.projectId,
      projectName: investment.projectName,
      principalAmount: investment.amount,
      totalEarned: totalEarned,
      distributionCount: distributions.length,
      distributions: distributions.map(function(d) {
        return {
          id: d._id.toString(),
          amount: d.amount,
          sharePercent: d.sharePercent,
          description: d.description,
          createdAt: d.createdAt
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== TERMS ACCEPTANCE ====================

// Accept investment terms and risk disclosure
router.post('/:investmentId/accept-terms', authenticateToken, async function(req, res) {
  var investmentId = req.params.investmentId;
  var userId = req.user.id;
  var riskDisclosureAccepted = req.body.riskDisclosureAccepted;
  var lockInAcknowledged = req.body.lockInAcknowledged;
  var profitNotGuaranteedAcknowledged = req.body.profitNotGuaranteedAcknowledged;
  
  if (!riskDisclosureAccepted || !lockInAcknowledged || !profitNotGuaranteedAcknowledged) {
    return res.status(400).json({ 
      error: 'All risk acknowledgments are required',
      required: ['riskDisclosureAccepted', 'lockInAcknowledged', 'profitNotGuaranteedAcknowledged']
    });
  }
  
  try {
    var database = await db.getDb();
    
    // Get client IP address
    var ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    var acceptance = {
      userId: userId,
      investmentId: investmentId,
      termsVersion: '1.0',
      riskDisclosureAccepted: true,
      lockInAcknowledged: true,
      profitNotGuaranteedAcknowledged: true,
      ipAddress: ipAddress,
      acceptedAt: new Date()
    };
    
    await database.collection('investment_terms_acceptance').insertOne(acceptance);
    
    res.json({
      message: 'Terms accepted successfully',
      acceptedAt: acceptance.acceptedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROJECT UPDATES (FOR INVESTORS) ====================

// Get project updates for an investment (only if user has invested in this project)
router.get('/:id/project-updates', authenticateToken, async function(req, res) {
  var investmentId = req.params.id;
  var userId = req.user.id;
  
  try {
    var database = await db.getDb();
    
    // Verify user has invested in this project
    var investment = await database.collection('investments').findOne({
      _id: new ObjectId(investmentId),
      userId: userId
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Get project details with admin-only info
    var project = await database.collection('projects').findOne({
      _id: new ObjectId(investment.projectId)
    });
    
    // Get project updates (investor-only updates)
    var updates = await database.collection('project_updates')
      .find({ projectId: investment.projectId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get profit distribution history for this project
    var distributions = await database.collection('profit_distributions')
      .find({ projectId: investment.projectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    // Calculate total project stats
    var allProjectDistributions = await database.collection('profit_distributions')
      .find({ projectId: investment.projectId })
      .toArray();
    
    var totalProjectProfit = allProjectDistributions.reduce(function(sum, d) {
      return sum + d.amount;
    }, 0);
    
    res.json({
      investmentId: investmentId,
      projectId: investment.projectId,
      projectName: investment.projectName,
      
      // Project details (for investors only)
      projectDetails: {
        name: project.name,
        description: project.description,
        category: project.category,
        status: project.status,
        targetReturn: project.targetReturn,
        riskLevel: project.riskLevel || 'medium',
        profitDistributionFrequency: project.profitDistributionFrequency || 'as_realized',
        lockInPeriodMonths: project.lockInPeriodMonths || project.duration || 12,
        profitSharingRatio: project.profitSharingRatio || { investor: 60, platform: 40 },
        totalFunding: project.currentFunding || project.raisedAmount || 0,
        investorCount: project.investorCount || 0,
        totalProfitDistributed: project.totalProfitDistributed || 0,
        lastDistributionAt: project.lastDistributionAt,
        lastUpdateAt: project.lastUpdateAt
      },
      
      // Your investment info
      yourInvestment: {
        amount: investment.amount,
        ownershipPercent: investment.ownershipPercent,
        investedAt: investment.createdAt,
        lockInEndDate: investment.lockInEndDate,
        status: investment.status
      },
      
      // Project stats
      projectStats: {
        totalProfitDistributed: totalProjectProfit,
        distributionCount: allProjectDistributions.length,
        yourSharePercent: investment.amount / (project.currentFunding || investment.amount) * 100
      },
      
      // Admin updates for investors
      updates: updates.map(function(u) {
        return {
          id: u._id.toString(),
          title: u.title,
          message: u.message,
          type: u.type,
          createdAt: u.createdAt
        };
      }),
      
      // Recent profit distributions (project-wide)
      recentDistributions: distributions.map(function(d) {
        return {
          totalAmount: d.amount / d.sharePercent, // Total distributed to all investors
          date: d.createdAt,
          description: d.description
        };
      }).filter(function(d, i, arr) {
        // Remove duplicates (same date)
        return i === arr.findIndex(function(x) {
          return x.date.getTime() === d.date.getTime();
        });
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
