// MED-05: Safe ObjectId validation utility
// Prevents errors from invalid ObjectId strings passed via URL params
var ObjectId = require('mongodb').ObjectId;

/**
 * Validate and create an ObjectId from a string.
 * Returns null if the string is not a valid 24-hex-char ObjectId.
 */
function safeObjectId(id) {
  if (!id || typeof id !== 'string') return null;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) return null;
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

/**
 * Express middleware that validates :id param is a valid ObjectId.
 * Returns 400 if invalid, otherwise calls next().
 */
function validateIdParam(req, res, next) {
  var id = req.params.id;
  if (!id) return next();
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
}

module.exports = {
  safeObjectId: safeObjectId,
  validateIdParam: validateIdParam
};
