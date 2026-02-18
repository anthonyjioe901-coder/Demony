// Portfolio routes - MongoDB version
var express = require('express');
var db = require('../../database/src/index');
var authenticateToken = require('../middleware/auth');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var { buildUserIdFilter } = require('../utils/objectId');

// Get portfolio summary
router.get('/', authenticateToken, async function(req, res) {
  var userId = req.user.userId || req.user.id;
  
  try {
    var database = await db.getDb();
    
    // Get all user investments
    var investments = await database.collection('investments')
      .find(buildUserIdFilter(userId))
      .toArray();
    
    // Calculate total invested
    var totalInvested = investments.reduce(function(sum, inv) {
      return sum + (inv.amount || 0);
    }, 0);
    
    // Get actual earnings from profit distributions
    var profitDistributions = await database.collection('profit_distributions')
      .find(buildUserIdFilter(userId))
      .toArray();
    
    var totalEarnings = profitDistributions.reduce(function(sum, dist) {
      return sum + (dist.amount || 0);
    }, 0);
    
    // Calculate allocation by category
    var categoryMap = {};
    investments.forEach(function(inv) {
      var cat = inv.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + inv.amount;
    });
    
    var allocation = Object.keys(categoryMap).map(function(cat) {
      return {
        category: cat,
        value: categoryMap[cat],
        percent: totalInvested > 0 ? Math.round((categoryMap[cat] / totalInvested) * 100) : 0
      };
    });
    
    // Calculate current value (principal + earnings)
    var currentValue = totalInvested + totalEarnings;
    
    res.json({
      userId: userId,
      totalInvested: totalInvested,
      totalEarnings: totalEarnings, // Actual profits earned
      currentValue: currentValue,
      totalReturn: totalEarnings, // Same as earnings since principal is separate
      returnPercent: totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0,
      activeInvestments: investments.length,
      allocation: allocation,
      riskLevel: 'Moderate',
      diversificationScore: Math.min(10, Math.max(1, allocation.length * 2)),
      
      // Additional clarity for users
      summary: {
        principalLocked: totalInvested,
        profitsWithdrawable: totalEarnings,
        note: 'Principal is locked until project completion. Profits can be withdrawn anytime.'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get portfolio history (computed from actual investment and profit data)
router.get('/history', authenticateToken, async function(req, res) {
  try {
    var userId = req.user.userId || req.user.id;
    var database = await db.getDb();
    var userIdFilter = buildUserIdFilter(userId);
    
    // Get all investments with creation dates
    var investments = await database.collection('investments')
      .find(userIdFilter)
      .sort({ createdAt: 1 })
      .toArray();
    
    // Get all profit distributions with dates
    var profits = await database.collection('profit_distributions')
      .find(userIdFilter)
      .sort({ createdAt: 1 })
      .toArray();
    
    // Build monthly history for the last 12 months
    var history = [];
    var now = new Date();
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (var i = 11; i >= 0; i--) {
      var date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      // Sum investments up to end of this month
      var invested = investments
        .filter(function(inv) { return inv.createdAt <= endOfMonth; })
        .reduce(function(sum, inv) { return sum + (inv.amount || 0); }, 0);
      
      // Sum profits up to end of this month
      var earned = profits
        .filter(function(p) { return p.createdAt <= endOfMonth; })
        .reduce(function(sum, p) { return sum + (p.amount || 0); }, 0);
      
      history.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        value: invested + earned,
        invested: invested,
        earnings: earned
      });
    }
    
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
