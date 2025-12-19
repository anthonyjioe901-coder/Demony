// Investments routes
var express = require('express');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var router = express.Router();

// Create investment
router.post('/', authenticateToken, async function(req, res) {
  var projectId = req.body.projectId;
  var amount = req.body.amount;
  var userId = req.user.id;
  
  if (!projectId || !amount) {
    return res.status(400).json({ error: 'Project ID and amount are required' });
  }
  
  if (amount < 100) {
    return res.status(400).json({ error: 'Minimum investment is $100' });
  }
  
  try {
    // Check project exists
    var projectRes = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    var project = projectRes.rows[0];
    
    // Start transaction
    await db.query('BEGIN');
    
    // Create investment
    var investRes = await db.query(
      'INSERT INTO investments (user_id, project_id, amount) VALUES ($1, $2, $3) RETURNING *',
      [userId, projectId, amount]
    );
    
    // Update project raised amount
    await db.query(
      'UPDATE projects SET raised_amount = raised_amount + $1 WHERE id = $2',
      [amount, projectId]
    );
    
    await db.query('COMMIT');
    
    res.json({
      message: 'Investment created successfully',
      investment: investRes.rows[0]
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user investments
router.get('/my', authenticateToken, async function(req, res) {
  var userId = req.user.id;
  
  try {
    var result = await db.query(`
      SELECT i.*, p.name as project_name, p.category 
      FROM investments i
      JOIN projects p ON i.project_id = p.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
    `, [userId]);
    
    res.json(result.rows);
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
    var result = await db.query('SELECT * FROM investments WHERE id = $1 AND user_id = $2', [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
