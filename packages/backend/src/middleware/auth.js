var jwt = require('jsonwebtoken');
var JWT_SECRET = require('../config/jwt').JWT_SECRET;

function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, function(err, decoded) {
    if (err) return res.sendStatus(403);
    // Normalize userId - support both 'id' and 'userId' in token
    req.user = {
      userId: decoded.id || decoded.userId,
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  });
}

module.exports = authenticateToken;
