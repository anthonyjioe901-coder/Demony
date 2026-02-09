// In-memory rate limiter - no external dependencies
// Tracks request counts per IP within sliding time windows

var rateLimitStores = {};

// Clean up expired entries every 5 minutes
setInterval(function() {
  var now = Date.now();
  Object.keys(rateLimitStores).forEach(function(storeName) {
    var store = rateLimitStores[storeName];
    Object.keys(store).forEach(function(key) {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  });
}, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware
 * @param {Object} options
 * @param {string} options.name - Unique name for this limiter's store
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests per window
 * @param {string} [options.message] - Error message when rate limited
 * @param {Function} [options.keyGenerator] - Custom key generator (req) => string
 */
function createRateLimiter(options) {
  var name = options.name || 'default';
  var windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
  var maxRequests = options.maxRequests || 100;
  var message = options.message || 'Too many requests, please try again later.';
  var keyGenerator = options.keyGenerator || function(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  };

  if (!rateLimitStores[name]) {
    rateLimitStores[name] = {};
  }
  var store = rateLimitStores[name];

  return function rateLimiter(req, res, next) {
    var key = keyGenerator(req);
    var now = Date.now();

    if (!store[key] || store[key].resetAt < now) {
      store[key] = {
        count: 1,
        resetAt: now + windowMs
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      var retryAfter = Math.ceil((store[key].resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ 
        error: message,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
}

// Pre-configured limiters for common use cases
var authLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 15,           // 15 attempts per 15 min per IP
  message: 'Too many login/signup attempts. Please try again in 15 minutes.'
});

var apiLimiter = createRateLimiter({
  name: 'api',
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,      // 100 requests per minute per IP
  message: 'Too many requests. Please slow down.'
});

var strictLimiter = createRateLimiter({
  name: 'strict',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,             // 5 attempts per hour
  message: 'Too many attempts. Please try again later.'
});

module.exports = {
  createRateLimiter: createRateLimiter,
  authLimiter: authLimiter,
  apiLimiter: apiLimiter,
  strictLimiter: strictLimiter
};
