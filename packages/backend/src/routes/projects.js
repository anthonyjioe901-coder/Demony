// Projects routes
var express = require('express');
var db = require('../../../database/src/index');
var router = express.Router();

// Get all projects with pagination and filtering
router.get('/', async function(req, res) {
  try {
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 10;
    var offset = (page - 1) * limit;
    var category = req.query.category;
    
    var query = 'SELECT * FROM projects';
    var params = [];
    var countQuery = 'SELECT COUNT(*) FROM projects';
    var countParams = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
      countQuery += ' WHERE category = $1';
      countParams.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    var result = await db.query(query, params);
    var countResult = await db.query(countQuery, countParams);
    var total = parseInt(countResult.rows[0].count);
    
    res.json({
      projects: result.rows,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', async function(req, res) {
  try {
    var id = req.params.id;
    var result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
