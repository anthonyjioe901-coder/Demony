// Wallet routes - Deposits, Withdrawals, Balance with Paystack
var express = require('express');
var https = require('https');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var ObjectId = require('mongodb').ObjectId;
var router = express.Router();

var PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Helper to make Paystack API calls
function paystackRequest(method, path, data) {
  return new Promise(function(resolve, reject) {
    var options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + PAYSTACK_SECRET,
        'Content-Type': 'application/json'
      }
    };
    
    var req = https.request(options, function(res) {
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(new Error('Invalid response from Paystack'));
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Apply auth to all routes
router.use(authenticateToken);

// ==================== WALLET BALANCE ====================

// Get wallet balance and transaction history
router.get('/balance', async function(req, res) {
  try {
    var database = await db.getDb();
    var user = await database.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { walletBalance: 1, totalInvested: 1, totalEarnings: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      balance: user.walletBalance || 0,
      totalInvested: user.totalInvested || 0,
      totalEarnings: user.totalEarnings || 0,
      availableForWithdrawal: (user.walletBalance || 0) + (user.totalEarnings || 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 20;
    var skip = (page - 1) * limit;
    var type = req.query.type; // deposit, withdrawal, investment, profit
    
    var filter = { userId: req.user.userId };
    if (type) filter.type = type;
    
    var database = await db.getDb();
    var transactions = await database.collection('transactions')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    var total = await database.collection('transactions').countDocuments(filter);
    
    res.json({
      transactions: transactions.map(function(t) {
        return {
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          status: t.status,
          reference: t.reference,
          description: t.description,
          createdAt: t.createdAt
        };
      }),
      pagination: {
        page: page,
        limit: limit,
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DEPOSITS (PAYSTACK) ====================

// Initialize deposit - creates Paystack payment link
router.post('/deposit/initialize', async function(req, res) {
  try {
    var amount = parseFloat(req.body.amount);
    
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit is 100' });
    }
    
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create unique reference
    var reference = 'DEP_' + req.user.userId + '_' + Date.now();
    
    // Initialize Paystack transaction (amount in kobo/cents)
    var paystackData = {
      email: user.email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference: reference,
      callback_url: process.env.WEB_URL + '/wallet?status=success',
      metadata: {
        userId: req.user.userId,
        type: 'deposit',
        custom_fields: [
          { display_name: 'User', variable_name: 'user_name', value: user.name }
        ]
      }
    };
    
    var paystackRes = await paystackRequest('POST', '/transaction/initialize', paystackData);
    
    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Payment initialization failed' });
    }
    
    // Save pending transaction
    await database.collection('transactions').insertOne({
      userId: req.user.userId,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      reference: reference,
      paystackReference: paystackRes.data.reference,
      description: 'Wallet deposit',
      createdAt: new Date()
    });
    
    res.json({
      message: 'Payment initialized',
      authorization_url: paystackRes.data.authorization_url,
      access_code: paystackRes.data.access_code,
      reference: reference
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify deposit after payment
router.get('/deposit/verify/:reference', async function(req, res) {
  try {
    var reference = req.params.reference;
    
    var database = await db.getDb();
    var transaction = await database.collection('transactions').findOne({ reference: reference });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (transaction.status === 'success') {
      return res.json({ message: 'Already verified', status: 'success' });
    }
    
    // Verify with Paystack
    var paystackRes = await paystackRequest('GET', '/transaction/verify/' + reference, null);
    
    if (!paystackRes.status || paystackRes.data.status !== 'success') {
      await database.collection('transactions').updateOne(
        { reference: reference },
        { $set: { status: 'failed', updatedAt: new Date() } }
      );
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    var amount = paystackRes.data.amount / 100; // Convert from kobo
    
    // Update transaction
    await database.collection('transactions').updateOne(
      { reference: reference },
      { $set: { status: 'success', verifiedAt: new Date(), updatedAt: new Date() } }
    );
    
    // Credit user wallet
    await database.collection('users').updateOne(
      { _id: new ObjectId(transaction.userId) },
      { 
        $inc: { walletBalance: amount },
        $set: { updatedAt: new Date() }
      }
    );
    
    res.json({
      message: 'Deposit successful',
      status: 'success',
      amount: amount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PAYSTACK WEBHOOK ====================

// Paystack webhook handler (no auth - uses signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), async function(req, res) {
  try {
    var crypto = require('crypto');
    var hash = crypto.createHmac('sha512', PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }
    
    var event = req.body;
    var database = await db.getDb();
    
    if (event.event === 'charge.success') {
      var data = event.data;
      var reference = data.reference;
      
      var transaction = await database.collection('transactions').findOne({ reference: reference });
      
      if (transaction && transaction.status === 'pending') {
        var amount = data.amount / 100;
        
        await database.collection('transactions').updateOne(
          { reference: reference },
          { $set: { status: 'success', verifiedAt: new Date(), updatedAt: new Date() } }
        );
        
        await database.collection('users').updateOne(
          { _id: new ObjectId(transaction.userId) },
          { 
            $inc: { walletBalance: amount },
            $set: { updatedAt: new Date() }
          }
        );
      }
    }
    
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

// ==================== WITHDRAWALS ====================

// Request withdrawal
router.post('/withdraw', async function(req, res) {
  try {
    var amount = parseFloat(req.body.amount);
    var bankCode = req.body.bankCode;
    var accountNumber = req.body.accountNumber;
    var accountName = req.body.accountName;
    
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal is 100' });
    }
    
    if (!bankCode || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'Bank details required' });
    }
    
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var availableBalance = (user.walletBalance || 0) + (user.totalEarnings || 0);
    
    if (amount > availableBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check KYC status for large withdrawals
    if (amount > 50000 && (!user.kyc || user.kyc.status !== 'verified')) {
      return res.status(400).json({ error: 'KYC verification required for withdrawals over 50,000' });
    }
    
    var reference = 'WDR_' + req.user.userId + '_' + Date.now();
    
    // Create withdrawal request (pending admin approval)
    await database.collection('transactions').insertOne({
      userId: req.user.userId,
      type: 'withdrawal',
      amount: -amount, // Negative for withdrawals
      status: 'pending_approval',
      reference: reference,
      bankDetails: {
        bankCode: bankCode,
        accountNumber: accountNumber,
        accountName: accountName
      },
      description: 'Withdrawal request',
      createdAt: new Date()
    });
    
    // Deduct from available balance (hold)
    var deductFrom = amount <= (user.walletBalance || 0) ? 'walletBalance' : 'totalEarnings';
    var updateField = {};
    updateField[deductFrom] = -amount;
    
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.userId) },
      { 
        $inc: updateField,
        $set: { updatedAt: new Date() }
      }
    );
    
    res.json({
      message: 'Withdrawal request submitted',
      reference: reference,
      status: 'pending_approval'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get list of banks (Paystack)
router.get('/banks', async function(req, res) {
  try {
    var paystackRes = await paystackRequest('GET', '/bank?country=ghana', null);
    
    if (!paystackRes.status) {
      return res.status(400).json({ error: 'Could not fetch banks' });
    }
    
    res.json({
      banks: paystackRes.data.map(function(bank) {
        return {
          code: bank.code,
          name: bank.name
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify bank account
router.get('/verify-account', async function(req, res) {
  try {
    var accountNumber = req.query.account_number;
    var bankCode = req.query.bank_code;
    
    if (!accountNumber || !bankCode) {
      return res.status(400).json({ error: 'Account number and bank code required' });
    }
    
    var paystackRes = await paystackRequest(
      'GET', 
      '/bank/resolve?account_number=' + accountNumber + '&bank_code=' + bankCode,
      null
    );
    
    if (!paystackRes.status) {
      return res.status(400).json({ error: paystackRes.message || 'Could not verify account' });
    }
    
    res.json({
      verified: true,
      accountName: paystackRes.data.account_name,
      accountNumber: paystackRes.data.account_number
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
