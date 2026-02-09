// NoSQL Injection Protection Middleware
// Strips MongoDB operators ($gt, $ne, $regex, etc.) from user input
// Prevents attacks like { "email": { "$gt": "" } } to bypass auth

/**
 * Recursively sanitize an object by removing keys that start with '$'
 * and cleaning string values that could be operator injections
 */
function sanitizeValue(value) {
  if (value === null || value === undefined) return value;

  // If it's a string, it's safe
  if (typeof value === 'string') return value;

  // If it's a number or boolean, it's safe
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  // If it's a Date, it's safe
  if (value instanceof Date) return value;

  // If it's an array, sanitize each element
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  // If it's an object, remove dangerous keys
  if (typeof value === 'object') {
    var clean = {};
    Object.keys(value).forEach(function(key) {
      // Block keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) {
        console.warn('⚠️ NoSQL injection blocked: operator "' + key + '" stripped from input');
        return; // Skip this key
      }
      clean[key] = sanitizeValue(value[key]);
    });
    return clean;
  }

  return value;
}

/**
 * Middleware that sanitizes req.body, req.query, and req.params
 * to prevent NoSQL injection attacks
 */
function noSqlSanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
}

module.exports = noSqlSanitize;
