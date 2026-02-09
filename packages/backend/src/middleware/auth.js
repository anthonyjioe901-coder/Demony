var jwt = require('jsonwebtoken');

// SECURITY: No fallback in production. Server must not start with a guessable secret.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is not set in production!');
  process.exit(1);
}
var JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-' + require('crypto').randomBytes(16).toString('hex');

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
