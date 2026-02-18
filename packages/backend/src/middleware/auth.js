var jwt = require('jsonwebtoken');
var JWT_SECRET = require('../config/jwt').JWT_SECRET;
var db = require('../../../database/src/index');
var ObjectId = require('mongodb').ObjectId;

function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, async function(err, decoded) {
    if (err) return res.sendStatus(403);

    var userId = decoded.id || decoded.userId;

    // SEC: Check that the user account is still active and token version matches
    try {
      var database = await db.getDb();
      var user = await database.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { isActive: 1, tokenVersion: 1 } }
      );

      if (!user) return res.status(401).json({ error: 'User not found' });
      if (user.isActive === false) return res.status(403).json({ error: 'Account is suspended' });

      // Token version check: if user changed password, old tokens are invalid
      if (typeof user.tokenVersion === 'number' && typeof decoded.tokenVersion === 'number') {
        if (decoded.tokenVersion !== user.tokenVersion) {
          return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
      }
    } catch (dbErr) {
      // If DB is down, reject the request - do NOT allow unauthenticated access
      console.error('Auth middleware DB check failed:', dbErr.message);
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again.' });
    }

    // Normalize userId - support both 'id' and 'userId' in token
    req.user = {
      userId: userId,
      id: userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
}

module.exports = authenticateToken;
