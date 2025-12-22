// Withdrawal routes - User withdrawal requests
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var emailService = require('../services/email');
var router = express.Router();

// Request withdrawal
router.post('/', authenticateToken, async function(req, res) {
  var amount = parseFloat(req.body.amount);
  var method = req.body.method; // 'bank_transfer', 'mobile_money', etc.
  var accountDetails = req.body.accountDetails;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }
  
  if (!method || !accountDetails) {
    return res.status(400).json({ error: 'Withdrawal method and account details required' });
  }
  
  try {
    var database = await db.getDb();
    
    // Get user
    var user = await database.collection('users').findOne({
      _id: new ObjectId(req.user.id)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check KYC status
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please complete KYC verification before withdrawing' });
    }
    
    // Check balance
    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Minimum withdrawal
    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum withdrawal is $10' });
    }
    
    // Create withdrawal request
    var withdrawal = {
      userId: req.user.id,
      amount: amount,
      method: method,
      accountDetails: accountDetails,
      status: 'pending', // pending, completed, rejected
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('withdrawals').insertOne(withdrawal);
    
    // Reserve amount (deduct from wallet)
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { walletBalance: -amount } }
    );
    
    withdrawal.id = result.insertedId.toString();
    
    // Send withdrawal requested email (async)
    emailService.sendWithdrawalRequestedEmail(user, withdrawal).catch(function(err) {
      console.error('Failed to send withdrawal email:', err);
    });
    
    res.json({
      message: 'Withdrawal request submitted. Awaiting admin approval.',
      withdrawal: withdrawal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's withdrawals
router.get('/my', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    var withdrawals = await database.collection('withdrawals')
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    withdrawals = withdrawals.map(function(w) {
      return { ...w, id: w._id.toString() };
    });
    
    res.json(withdrawals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel pending withdrawal
router.delete('/:id', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    
    var withdrawal = await database.collection('withdrawals').findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.id
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending withdrawals' });
    }
    
    // Refund to wallet
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { walletBalance: withdrawal.amount } }
    );
    
    // Update withdrawal status
    await database.collection('withdrawals').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'cancelled', updatedAt: new Date() } }
    );
    
    res.json({ message: 'Withdrawal cancelled and funds returned to wallet' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
