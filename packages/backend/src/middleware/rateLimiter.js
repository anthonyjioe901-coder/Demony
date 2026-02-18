// Rate limiter with MongoDB persistence for multi-instance safety
// Falls back to in-memory if DB is not available

var db = require('../../database/src/index');

var inMemoryStores = {};

// Clean up expired in-memory entries every 5 minutes
setInterval(function() {
  var now = Date.now();
  Object.keys(inMemoryStores).forEach(function(storeName) {
    var store = inMemoryStores[storeName];
    Object.keys(store).forEach(function(key) {
      if (store[key].resetAt < now) {
        delete store[key];
      }
    });
  });
}, 5 * 60 * 1000);

/**
 * Create a rate limiter middleware with MongoDB persistence
 * @param {Object} options
 * @param {string} options.name - Unique name for this limiter's store
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Max requests per window
 * @param {string} [options.message] - Error message when rate limited
 * @param {Function} [options.keyGenerator] - Custom key generator (req) => string
 */
function createRateLimiter(options) {
  var name = options.name || 'default';
  var windowMs = options.windowMs || 15 * 60 * 1000;
  var maxRequests = options.maxRequests || 100;
  var message = options.message || 'Too many requests, please try again later.';
  var keyGenerator = options.keyGenerator || function(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  };

  if (!inMemoryStores[name]) {
    inMemoryStores[name] = {};
  }
  var memStore = inMemoryStores[name];

  return async function rateLimiter(req, res, next) {
    var key = keyGenerator(req);
    var now = Date.now();

    // Try MongoDB first, fall back to in-memory
    try {
      var database = await db.getDb();
      var collection = database.collection('rate_limits');
      var docId = name + ':' + key;
      
      var record = await collection.findOne({ _id: docId });
      
      if (!record || record.resetAt < now) {
        // Window expired or first request — start new window
        await collection.updateOne(
          { _id: docId },
          { $set: { count: 1, resetAt: now + windowMs, updatedAt: new Date() } },
          { upsert: true }
        );
        return next();
      }
      
      // Increment count atomically
      var updated = await collection.findOneAndUpdate(
        { _id: docId },
        { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      
      var currentCount = updated && updated.value ? updated.value.count : record.count + 1;
      
      if (currentCount > maxRequests) {
        var retryAfter = Math.ceil((record.resetAt - now) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: message, retryAfterSeconds: retryAfter });
      }
      
      return next();
    } catch (dbErr) {
      // Fallback to in-memory if DB is unavailable
      if (!memStore[key] || memStore[key].resetAt < now) {
        memStore[key] = { count: 1, resetAt: now + windowMs };
        return next();
      }

      memStore[key].count++;

      if (memStore[key].count > maxRequests) {
        var retryAfter = Math.ceil((memStore[key].resetAt - now) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ error: message, retryAfterSeconds: retryAfter });
      }

      next();
    }
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

// Financial operations - stricter limits for deposits, withdrawals, investments
var financialLimiter = createRateLimiter({
  name: 'financial',
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,       // 10 financial operations per minute
  message: 'Too many financial operations. Please slow down.'
});

module.exports = {
  createRateLimiter: createRateLimiter,
  authLimiter: authLimiter,
  apiLimiter: apiLimiter,
  strictLimiter: strictLimiter,
  financialLimiter: financialLimiter
};
