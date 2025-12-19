// Portfolio routes - MongoDB version
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var router = express.Router();

// Get portfolio summary
router.get('/', authenticateToken, async function(req, res) {
  var userId = req.user.id;
  
  try {
    var database = await db.getDb();
    
    // Get all user investments
    var investments = await database.collection('investments')
      .find({ userId: userId })
      .toArray();
    
    // Calculate total invested
    var totalInvested = investments.reduce(function(sum, inv) {
      return sum + (inv.amount || 0);
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
    
    // Mock returns for now
    var currentValue = totalInvested * 1.11; // +11% mock
    var totalReturn = currentValue - totalInvested;
    
    res.json({
      userId: userId,
      totalInvested: totalInvested,
      currentValue: currentValue,
      totalReturn: totalReturn,
      returnPercent: totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0,
      activeInvestments: investments.length,
      allocation: allocation,
      riskLevel: 'Moderate',
      diversificationScore: 8.5
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get portfolio history (Mock for now)
router.get('/history', authenticateToken, function(req, res) {
  var history = [
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 10500 },
    { month: 'Mar', value: 11200 },
    { month: 'Apr', value: 11000 },
    { month: 'May', value: 11800 },
    { month: 'Jun', value: 12100 },
    { month: 'Jul', value: 12500 },
    { month: 'Aug', value: 13100 },
    { month: 'Sep', value: 13500 },
    { month: 'Oct', value: 13200 },
    { month: 'Nov', value: 13600 },
    { month: 'Dec', value: 13875 }
  ];
  
  res.json(history);
});

module.exports = router;
