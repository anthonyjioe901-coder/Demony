// Shared JWT configuration - single source of truth
var crypto = require('crypto');

// SECURITY: No fallback in production. Server must not start with a guessable secret.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET environment variable is not set in production!');
  process.exit(1);
}

var JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-' + crypto.randomBytes(16).toString('hex');

module.exports = { JWT_SECRET: JWT_SECRET };
