// Paystack Webhook Handler - MUST be mounted BEFORE express.json() in server.js
// This ensures the raw body is available for HMAC signature verification.
var express = require('express');
var crypto = require('crypto');
var db = require('../../../database/src/index');
var ObjectId = require('mongodb').ObjectId;
var { toObjectId } = require('../utils/objectId');
var router = express.Router();

// Use express.raw() to get the unparsed body for HMAC verification
router.post('/', express.raw({ type: 'application/json' }), async function(req, res) {
  try {
    var PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured');
      return res.sendStatus(500);
    }

    // req.body is a Buffer because we used express.raw()
    var rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      // Fallback: if somehow it was already parsed, convert back
      rawBody = Buffer.from(JSON.stringify(req.body));
    }

    var hash = crypto.createHmac('sha512', PAYSTACK_SECRET)
      .update(rawBody)
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      console.warn('❌ Paystack webhook: invalid signature');
      return res.status(400).send('Invalid signature');
    }
    
    var event = JSON.parse(rawBody.toString());
    var database = await db.getDb();
    
    if (event.event === 'charge.success') {
      var data = event.data;
      var reference = data.reference;
      
      var transaction = await database.collection('transactions').findOne({ reference: reference });
      
      if (transaction && transaction.status === 'pending') {
        var amount = data.amount / 100;
        
        if (amount < transaction.amount) {
          await database.collection('transactions').updateOne(
            { reference: reference },
            { $set: { status: 'failed', updatedAt: new Date(), failureReason: 'amount_mismatch' } }
          );
        } else {
          // Atomically mark as success only if still pending (prevents double-credit)
          var updateResult = await database.collection('transactions').updateOne(
            { reference: reference, status: 'pending' },
            { $set: { status: 'success', verifiedAt: new Date(), updatedAt: new Date(), paidAmount: amount } }
          );
          
          // Only credit wallet if we actually transitioned from pending → success
          if (updateResult.modifiedCount > 0) {
            var webhookUserId = toObjectId(transaction.userId);
            if (webhookUserId) {
              await database.collection('users').updateOne(
                { _id: webhookUserId },
                { 
                  $inc: { walletBalance: amount },
                  $set: { updatedAt: new Date() }
                }
              );
            }
          } else {
            console.log('[Webhook] Transaction already processed, skipping wallet credit:', reference);
          }
        }
      }
    }
    
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;
