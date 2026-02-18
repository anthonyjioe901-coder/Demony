// SYS-01: Idempotency key middleware for financial endpoints
// Prevents duplicate operations (double-charges, double-withdrawals) from network retries
var db = require('../../../database/src/index');

var IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Middleware that checks for an Idempotency-Key header.
 * If the key was already used, returns the cached response.
 * Otherwise, intercepts res.json() to cache the response for later replay.
 */
function idempotencyCheck(req, res, next) {
  var key = req.headers['idempotency-key'];
  if (!key) return next(); // No key = no idempotency enforcement

  var userId = req.user && (req.user.id || req.user.userId);
  if (!userId) return next();

  var compositeKey = userId + ':' + key;

  (async function() {
    try {
      var database = await db.getDb();
      var existing = await database.collection('idempotency_keys').findOne({ _id: compositeKey });

      if (existing) {
        // Return cached response
        return res.status(existing.statusCode).json(existing.body);
      }

      // Intercept res.json to cache the response
      var originalJson = res.json.bind(res);
      res.json = function(body) {
        // Store asynchronously - don't block the response
        database.collection('idempotency_keys').insertOne({
          _id: compositeKey,
          statusCode: res.statusCode || 200,
          body: body,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS)
        }).catch(function(err) {
          // Duplicate key = race condition, safe to ignore
          if (err.code !== 11000) console.error('Idempotency store error:', err.message);
        });

        return originalJson(body);
      };

      next();
    } catch (err) {
      // On DB error, proceed without idempotency (non-blocking)
      console.error('Idempotency check failed:', err.message);
      next();
    }
  })();
}

module.exports = { idempotencyCheck: idempotencyCheck };
