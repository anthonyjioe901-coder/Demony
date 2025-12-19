var jwt = require('jsonwebtoken');
var JWT_SECRET = process.env.JWT_SECRET || 'demony-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, function(err, user) {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
