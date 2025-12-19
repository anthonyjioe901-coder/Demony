// Auth routes - MongoDB version
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
    var userCheck = await db.query('users', 'findOne', { filter: { email: email } });
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    var hashedPassword = await bcrypt.hash(password, 10);
    
    var result = await db.query('users', 'insertOne', {
      doc: { name: name, email: email, password: hashedPassword, createdAt: new Date() }
    });
    
    var newUser = { id: result.insertedId.toString(), name: name, email: email };
    var token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ message: 'User created successfully', token: token, user: newUser });
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
    var result = await db.query('users', 'findOne', { filter: { email: email } });
    var user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    var validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    var token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
