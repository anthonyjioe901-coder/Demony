// Portfolio routes
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var router = express.Router();

// Get portfolio summary
router.get('/', authenticateToken, async function(req, res) {
  var userId = req.user.id;
  
  try {
    // Calculate total invested
    var investedRes = await db.query(
      'SELECT SUM(amount) as total FROM investments WHERE user_id = $1',
      [userId]
    );
    var totalInvested = parseFloat(investedRes.rows[0].total || 0);
    
    // Calculate allocation
    var allocationRes = await db.query(`
      SELECT p.category, SUM(i.amount) as value
      FROM investments i
      JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1
      GROUP BY p.category
    `, [userId]);
    
    var allocation = allocationRes.rows.map(function(row) {
      return {
        category: row.category,
        value: parseFloat(row.value),
        percent: totalInvested > 0 ? Math.round((parseFloat(row.value) / totalInvested) * 100) : 0
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
      activeInvestments: await getActiveInvestmentsCount(userId),
      allocation: allocation,
      riskLevel: 'Moderate',
      diversificationScore: 8.5
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function getActiveInvestmentsCount(userId) {
  var res = await db.query('SELECT COUNT(*) FROM investments WHERE user_id = $1', [userId]);
  return parseInt(res.rows[0].count);
}

// Get portfolio history (Mock for now)
router.get('/history', authenticateToken, function(req, res) {
  // Mock history data
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
