// Auth routes
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var db = require('../../../database/src/index');
var router = express.Router();

var JWT_SECRET = process.env.JWT_SECRET || 'demony-secret-key-change-in-production';

// Signup
router.post('/signup', async function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if user exists
    var userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    var hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    var result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    
    var newUser = result.rows[0];
    
    var token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'User created successfully',
      token: token,
      user: newUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Find user
    var result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    var user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    var validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    var token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
  
  var validPassword = bcrypt.compareSync(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  var token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    message: 'Login successful',
    token: token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

module.exports = router;
