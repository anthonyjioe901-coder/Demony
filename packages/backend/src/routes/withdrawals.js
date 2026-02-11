// Withdrawal routes - User withdrawal requests
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var emailService = require('../services/email');
var router = express.Router();

// Request withdrawal
// NOTE: The primary withdrawal flow now goes through /api/wallet/withdraw.
// This route is kept for backward compatibility but redirects to wallet behavior.
router.post('/', authenticateToken, async function(req, res) {
  var amount = parseFloat(req.body.amount);
  var method = req.body.method;
  var accountDetails = req.body.accountDetails;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }
  
  if (!method || !accountDetails) {
    return res.status(400).json({ error: 'Withdrawal method and account details required' });
  }
  
  if (amount < 20) {
    return res.status(400).json({ error: 'Minimum withdrawal is GH₵20' });
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
    
    // Check balance
    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // ATOMIC deduction: Only deduct if balance is still sufficient
    var deductResult = await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id), walletBalance: { $gte: amount } },
      { 
        $inc: { walletBalance: -amount },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (deductResult.modifiedCount === 0) {
      return res.status(400).json({ error: 'Insufficient balance (concurrent transaction detected)' });
    }
    
    // Create withdrawal request
    var withdrawal = {
      userId: req.user.id,
      amount: amount,
      method: method,
      accountDetails: accountDetails,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    var result = await database.collection('withdrawals').insertOne(withdrawal);
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

// Get user's withdrawals (support both userId formats)
router.get('/my', authenticateToken, async function(req, res) {
  try {
    var userId = req.user.id || req.user.userId;
    var database = await db.getDb();
    var withdrawals = await database.collection('withdrawals')
      .find({ $or: [{ userId: userId }, { userId: req.user.userId }] })
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
    var userId = req.user.id || req.user.userId;
    var database = await db.getDb();
    
    var withdrawal = await database.collection('withdrawals').findOne({
      _id: new ObjectId(req.params.id),
      $or: [{ userId: userId }, { userId: req.user.userId }]
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending withdrawals' });
    }
    
    // Atomically update withdrawal to cancelled (only if still pending)
    var cancelResult = await database.collection('withdrawals').updateOne(
      { _id: new ObjectId(req.params.id), status: 'pending' },
      { $set: { status: 'cancelled', updatedAt: new Date() } }
    );
    
    // Only refund if we actually cancelled it (prevents double-refund)
    if (cancelResult.modifiedCount > 0) {
      // BUG-05: Use withdrawal.userId (the original requester) for refund, not req.user.id
      var refundUserId = withdrawal.userId;
      await database.collection('users').updateOne(
        { _id: new ObjectId(refundUserId) },
        { 
          $inc: { walletBalance: withdrawal.amount },
          $set: { updatedAt: new Date() }
        }
      );
      
      // Also update corresponding transaction record if it exists
      if (withdrawal.reference) {
        await database.collection('transactions').updateOne(
          { reference: withdrawal.reference },
          { $set: { status: 'cancelled', updatedAt: new Date() } }
        );
      }
    } else {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    res.json({ message: 'Withdrawal cancelled and funds returned to wallet' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
