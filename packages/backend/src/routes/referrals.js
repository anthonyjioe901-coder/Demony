// Referral System Routes - MongoDB version
var express = require('express');
var crypto = require('crypto');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var emailService = require('../services/email');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

// Referral bonus amounts in GH₵
var REFERRAL_BONUS_REFERRER = 20; // Bonus for the person who referred
var REFERRAL_BONUS_REFEREE = 20;  // Bonus for the new user
var MIN_INVESTMENT_FOR_BONUS = 100; // Minimum investment to trigger bonus
var QUALIFYING_REFERRALS_NEEDED = 10; // Number of qualified referrals to unlock earnings
var MIN_QUALIFYING_INVESTMENT = 100; // Minimum investment amount per referral to count as "qualified"

// Generate referral code from user ID
function generateReferralCode(userId) {
  // Create a short, unique code from user ID + random string
  var hash = crypto.createHash('sha256').update(userId + Date.now().toString()).digest('hex');
  return 'DEM' + hash.substring(0, 6).toUpperCase();
}

// Get or create referral code for current user
router.get('/my-code', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    var userId = req.user.id;
    
    // Check if user already has a referral code
    var existing = await database.collection('referral_codes').findOne({
      userId: userId
    });
    
    if (existing) {
      // Get referral stats
      var stats = await getReferralStats(database, userId);
      return res.json({
        code: existing.code,
        shareUrl: getShareUrl(existing.code),
        stats: stats
      });
    }
    
    // Generate new code
    var code = generateReferralCode(userId);
    
    // Make sure code is unique
    var attempts = 0;
    while (attempts < 5) {
      var codeExists = await database.collection('referral_codes').findOne({ code: code });
      if (!codeExists) break;
      code = generateReferralCode(userId + attempts.toString());
      attempts++;
    }
    
    await database.collection('referral_codes').insertOne({
      userId: userId,
      code: code,
      createdAt: new Date(),
      isActive: true
    });
    
    var stats = await getReferralStats(database, userId);
    
    res.json({
      code: code,
      shareUrl: getShareUrl(code),
      stats: stats
    });
  } catch (err) {
    console.error('Error getting referral code:', err);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// Get referral stats for a user
async function getReferralStats(database, userId) {
  var referrals = await database.collection('referrals').find({
    referrerId: userId
  }).toArray();
  
  var totalReferrals = referrals.length;
  var completedReferrals = referrals.filter(function(r) { return r.status === 'completed'; }).length;
  var pendingReferrals = referrals.filter(function(r) { return r.status === 'pending'; }).length;
  
  // Count qualified referrals (completed + invested GH₵100+)
  var qualifiedReferrals = referrals.filter(function(r) {
    return r.status === 'completed' && r.investmentAmount >= MIN_QUALIFYING_INVESTMENT;
  }).length;
  
  var totalEarned = referrals.reduce(function(sum, r) {
    return sum + (r.bonusPaid || 0);
  }, 0);
  
  // Check if earnings are unlocked
  var isQualified = qualifiedReferrals >= QUALIFYING_REFERRALS_NEEDED;
  var availableEarnings = isQualified ? totalEarned : 0;
  var lockedEarnings = isQualified ? 0 : totalEarned;
  
  return {
    totalReferrals: totalReferrals,
    completedReferrals: completedReferrals,
    pendingReferrals: pendingReferrals,
    qualifiedReferrals: qualifiedReferrals,
    qualifyingNeeded: QUALIFYING_REFERRALS_NEEDED,
    totalEarned: totalEarned,
    availableEarnings: availableEarnings,
    lockedEarnings: lockedEarnings,
    isQualified: isQualified,
    progress: Math.min(100, Math.round((qualifiedReferrals / QUALIFYING_REFERRALS_NEEDED) * 100)),
    bonusPerReferral: REFERRAL_BONUS_REFERRER
  };
}

function getShareUrl(code) {
  var baseUrl = process.env.WEB_URL || 'https://demony-web.onrender.com';
  return baseUrl + '?ref=' + code;
}

// Get referral history
router.get('/history', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    var userId = req.user.id;
    
    // PERF-02: Use $lookup to batch-fetch referred user names instead of N+1 queries
    var referrals = await database.collection('referrals').aggregate([
      { $match: { referrerId: userId } },
      { $sort: { createdAt: -1 } },
      { $limit: 50 },
      {
        $addFields: {
          refereeObjId: {
            $cond: {
              if: { $regexMatch: { input: { $toString: '$refereeId' }, regex: /^[0-9a-fA-F]{24}$/ } },
              then: { $toObjectId: '$refereeId' },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'refereeObjId',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: 'refereeUser'
        }
      }
    ]).toArray();
    
    var referralList = referrals.map(function(ref) {
      var displayName = 'User';
      if (ref.refereeUser && ref.refereeUser[0] && ref.refereeUser[0].name) {
        var nameParts = ref.refereeUser[0].name.split(' ');
        displayName = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
      }
      return {
        id: ref._id.toString(),
        displayName: displayName,
        status: ref.status,
        bonusPaid: ref.bonusPaid || 0,
        createdAt: ref.createdAt,
        investedAt: ref.investedAt
      };
    });
    
    res.json({ referrals: referralList });
  } catch (err) {
    console.error('Error getting referral history:', err);
    res.status(500).json({ error: 'Failed to get referral history' });
  }
});

// Validate a referral code (public - for signup page)
router.get('/validate/:code', async function(req, res) {
  try {
    var database = await db.getDb();
    var code = req.params.code.toUpperCase();
    
    var referralCode = await database.collection('referral_codes').findOne({
      code: code,
      isActive: true
    });
    
    if (!referralCode) {
      return res.json({ valid: false });
    }
    
    // Get referrer name (first name only for privacy)
    var referrer = await database.collection('users').findOne({
      _id: new ObjectId(referralCode.userId)
    });
    
    var referrerName = 'a friend';
    if (referrer && referrer.name) {
      referrerName = referrer.name.split(' ')[0];
    }
    
    res.json({
      valid: true,
      referrerName: referrerName,
      bonus: REFERRAL_BONUS_REFEREE
    });
  } catch (err) {
    console.error('Error validating referral code:', err);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

// Track a referral (called during signup)
router.post('/track', async function(req, res) {
  try {
    var code = req.body.code;
    var refereeId = req.body.refereeId;
    var refereeEmail = req.body.refereeEmail;
    
    if (!code || !refereeId) {
      return res.status(400).json({ error: 'Code and refereeId required' });
    }
    
    var database = await db.getDb();
    code = code.toUpperCase();
    
    // Find the referral code
    var referralCode = await database.collection('referral_codes').findOne({
      code: code,
      isActive: true
    });
    
    if (!referralCode) {
      return res.json({ tracked: false, reason: 'Invalid code' });
    }
    
    // Can't refer yourself
    if (referralCode.userId === refereeId) {
      return res.json({ tracked: false, reason: 'Cannot refer yourself' });
    }
    
    // Check if this user was already referred
    var existingReferral = await database.collection('referrals').findOne({
      refereeId: refereeId
    });
    
    if (existingReferral) {
      return res.json({ tracked: false, reason: 'Already referred' });
    }
    
    // Create referral record
    await database.collection('referrals').insertOne({
      referrerId: referralCode.userId,
      refereeId: refereeId,
      refereeEmail: refereeEmail,
      code: code,
      status: 'pending', // pending = signed up, completed = made qualifying investment
      bonusPaid: 0,
      createdAt: new Date()
    });
    
    console.log('📣 Referral tracked: ' + refereeId + ' referred by ' + referralCode.userId);
    
    res.json({ tracked: true });
  } catch (err) {
    console.error('Error tracking referral:', err);
    res.status(500).json({ error: 'Failed to track referral' });
  }
});

// Complete a referral (called when referee makes qualifying investment)
// This is an internal function called from the investments route
async function completeReferral(refereeId, investmentAmount) {
  try {
    if (investmentAmount < MIN_INVESTMENT_FOR_BONUS) {
      console.log('📣 Investment amount ' + investmentAmount + ' below minimum ' + MIN_INVESTMENT_FOR_BONUS);
      return { completed: false, reason: 'Below minimum' };
    }
    
    var database = await db.getDb();
    
    // Find pending referral for this user
    var referral = await database.collection('referrals').findOne({
      refereeId: refereeId,
      status: 'pending'
    });
    
    if (!referral) {
      return { completed: false, reason: 'No pending referral' };
    }
    
    // Update referral status
    await database.collection('referrals').updateOne(
      { _id: referral._id },
      {
        $set: {
          status: 'completed',
          bonusPaid: REFERRAL_BONUS_REFERRER,
          investedAt: new Date(),
          investmentAmount: investmentAmount
        }
      }
    );
    
    // Check if referrer now qualifies for earnings unlock
    var stats = await getReferralStats(database, referral.referrerId);
    var justQualified = stats.qualifiedReferrals === QUALIFYING_REFERRALS_NEEDED;
    
    // If just qualified, credit all accumulated bonuses
    if (justQualified) {
      await database.collection('users').updateOne(
        { _id: new ObjectId(referral.referrerId) },
        {
          $inc: { walletBalance: stats.totalEarned }
        }
      );
      
      // Create transaction for unlocked earnings
      await database.collection('transactions').insertOne({
        userId: referral.referrerId,
        type: 'referral_bonus',
        amount: stats.totalEarned,
        status: 'completed',
        description: 'Referral earnings unlocked! (' + stats.qualifiedReferrals + ' qualified referrals)',
        createdAt: new Date()
      });
    } else if (stats.isQualified) {
      // Already qualified, credit new bonus immediately
      await database.collection('users').updateOne(
        { _id: new ObjectId(referral.referrerId) },
        {
          $inc: { walletBalance: REFERRAL_BONUS_REFERRER }
        }
      );
      
      await database.collection('transactions').insertOne({
        userId: referral.referrerId,
        type: 'referral_bonus',
        amount: REFERRAL_BONUS_REFERRER,
        status: 'completed',
        description: 'Referral bonus - friend invested',
        createdAt: new Date()
      });
    } else {
      // Not yet qualified, bonus is tracked but locked
      await database.collection('transactions').insertOne({
        userId: referral.referrerId,
        type: 'referral_bonus_pending',
        amount: REFERRAL_BONUS_REFERRER,
        status: 'pending',
        description: 'Referral bonus (locked - ' + stats.qualifiedReferrals + '/' + QUALIFYING_REFERRALS_NEEDED + ' qualified)',
        createdAt: new Date()
      });
    }
    
    // Credit referee's welcome bonus immediately
    await database.collection('users').updateOne(
      { _id: new ObjectId(refereeId) },
      {
        $inc: { walletBalance: REFERRAL_BONUS_REFEREE }
      }
    );
    
    await database.collection('transactions').insertOne({
      userId: refereeId,
      type: 'referral_bonus',
      amount: REFERRAL_BONUS_REFEREE,
      status: 'completed',
      description: 'Welcome bonus - first investment',
      createdAt: new Date()
    });
    
    // Notify referrer via email
    try {
      var referrer = await database.collection('users').findOne({
        _id: new ObjectId(referral.referrerId)
      });
      if (referrer && referrer.email) {
        var emailSubject = '';
        var emailBody = '';
        
        if (justQualified) {
          emailSubject = '🎉 Congratulations! You unlocked GH₵' + stats.totalEarned + ' in referral earnings!';
          emailBody = '<h2>Amazing news, ' + (referrer.name || 'Investor') + '!</h2>' +
            '<p>You\'ve reached ' + QUALIFYING_REFERRALS_NEEDED + ' qualified referrals!</p>' +
            '<p><strong>GH₵' + stats.totalEarned + '</strong> in accumulated referral bonuses has been unlocked and added to your wallet!</p>' +
            '<p>From now on, all new referral bonuses will be credited immediately.</p>' +
            '<p>Keep sharing to earn more!</p>' +
            '<p>Best,<br>The Demony Team</p>';
        } else if (stats.isQualified) {
          emailSubject = '🎉 You earned GH₵' + REFERRAL_BONUS_REFERRER + ' referral bonus!';
          emailBody = '<h2>Great news, ' + (referrer.name || 'Investor') + '!</h2>' +
            '<p>Your friend just made their first investment on Demony.</p>' +
            '<p><strong>GH₵' + REFERRAL_BONUS_REFERRER + '</strong> has been added to your wallet!</p>' +
            '<p>Keep sharing your referral code to earn more bonuses.</p>' +
            '<p>Best,<br>The Demony Team</p>';
        } else {
          emailSubject = '📊 Referral progress: ' + stats.qualifiedReferrals + '/' + QUALIFYING_REFERRALS_NEEDED + ' qualified!';
          emailBody = '<h2>Good progress, ' + (referrer.name || 'Investor') + '!</h2>' +
            '<p>Your friend just made their first investment on Demony.</p>' +
            '<p>You\'ve earned <strong>GH₵' + REFERRAL_BONUS_REFERRER + '</strong> (currently locked).</p>' +
            '<p><strong>Progress:</strong> ' + stats.qualifiedReferrals + ' out of ' + QUALIFYING_REFERRALS_NEEDED + ' qualified referrals.</p>' +
            '<p>Once you reach ' + QUALIFYING_REFERRALS_NEEDED + ' qualified referrals, all earnings will be unlocked!</p>' +
            '<p><strong>Total pending:</strong> GH₵' + stats.lockedEarnings + '</p>' +
            '<p>Keep sharing your code!</p>' +
            '<p>Best,<br>The Demony Team</p>';
        }
        
        await emailService.sendEmail({
          to: referrer.email,
          subject: emailSubject,
          html: emailBody
        });
      }
    } catch (emailErr) {
      console.error('Failed to send referral notification email:', emailErr);
    }
    
    console.log('📣 Referral completed! Referrer ' + referral.referrerId + ' and referee ' + refereeId + ' each received bonus');
    
    return { 
      completed: true, 
      referrerBonus: REFERRAL_BONUS_REFERRER, 
      refereeBonus: REFERRAL_BONUS_REFEREE 
    };
  } catch (err) {
    console.error('Error completing referral:', err);
    return { completed: false, reason: 'Error processing' };
  }
}

// Leaderboard (optional - gamification)
router.get('/leaderboard', async function(req, res) {
  try {
    var database = await db.getDb();
    
    // PERF-02: Use $lookup to batch-fetch user names instead of N+1 queries
    var leaders = await database.collection('referrals').aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: '$referrerId',
        count: { $sum: 1 },
        earned: { $sum: '$bonusPaid' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $addFields: {
          referrerObjId: {
            $cond: {
              if: { $regexMatch: { input: { $toString: '$_id' }, regex: /^[0-9a-fA-F]{24}$/ } },
              then: { $toObjectId: '$_id' },
              else: null
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'referrerObjId',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: 'user'
        }
      }
    ]).toArray();
    
    var leaderboard = leaders.map(function(leader, index) {
      var displayName = 'Investor';
      if (leader.user && leader.user[0] && leader.user[0].name) {
        var nameParts = leader.user[0].name.split(' ');
        displayName = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
      }
      return {
        rank: index + 1,
        displayName: displayName,
        referrals: leader.count,
        earned: leader.earned
      };
    });
    
    res.json({ leaderboard: leaderboard });
  } catch (err) {
    console.error('Error getting leaderboard:', err);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

module.exports = router;
module.exports.completeReferral = completeReferral;
module.exports.REFERRAL_BONUS_REFEREE = REFERRAL_BONUS_REFEREE;
