// SYS-06: Basic test scaffolding for backend API
// Run with: node packages/backend/tests/smoke.test.js
// These are basic smoke tests to catch startup/import errors

var assert = require('assert');
var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✅ ' + name);
  } catch (err) {
    failed++;
    console.log('  ❌ ' + name + ': ' + err.message);
  }
}

console.log('\n🧪 Demony Backend Smoke Tests\n');

// ==================== Module Loading ====================
console.log('Module Loading:');

test('objectId utils load correctly', function() {
  var { safeObjectId, validateIdParam, toObjectId, buildUserIdFilter } = require('../src/utils/objectId');
  assert(typeof safeObjectId === 'function');
  assert(typeof validateIdParam === 'function');
  assert(typeof toObjectId === 'function');
  assert(typeof buildUserIdFilter === 'function');
});

test('error codes load correctly', function() {
  var { ERROR_CODES, apiError } = require('../src/utils/errorCodes');
  assert(typeof ERROR_CODES === 'object');
  assert(typeof apiError === 'function');
  assert(ERROR_CODES.AUTH_REQUIRED === 'AUTH_REQUIRED');
});

test('idempotency middleware loads correctly', function() {
  var { idempotencyCheck } = require('../src/middleware/idempotency');
  assert(typeof idempotencyCheck === 'function');
});

test('rate limiter loads correctly', function() {
  var rateLimiter = require('../src/middleware/rateLimiter');
  assert(typeof rateLimiter === 'object');
  assert(typeof rateLimiter.createRateLimiter === 'function');
  assert(typeof rateLimiter.authLimiter === 'function');
});

test('auth middleware loads correctly', function() {
  var auth = require('../src/middleware/auth');
  assert(typeof auth === 'function');
});

// ==================== Utility Functions ====================
console.log('\nUtility Functions:');

test('safeObjectId returns null for invalid input', function() {
  var { safeObjectId } = require('../src/utils/objectId');
  assert(safeObjectId(null) === null);
  assert(safeObjectId('') === null);
  assert(safeObjectId('not-valid') === null);
  assert(safeObjectId('12345') === null);
});

test('safeObjectId returns ObjectId for valid 24-hex string', function() {
  var { safeObjectId } = require('../src/utils/objectId');
  var result = safeObjectId('507f1f77bcf86cd799439011');
  assert(result !== null);
  assert(result.toString() === '507f1f77bcf86cd799439011');
});

test('toObjectId handles various input types', function() {
  var { toObjectId } = require('../src/utils/objectId');
  assert(toObjectId(null) === null);
  assert(toObjectId(undefined) === null);
  assert(toObjectId('invalid') === null);
  var valid = toObjectId('507f1f77bcf86cd799439011');
  assert(valid !== null);
});

test('buildUserIdFilter returns $or filter', function() {
  var { buildUserIdFilter } = require('../src/utils/objectId');
  var filter = buildUserIdFilter('507f1f77bcf86cd799439011');
  assert(filter.$or);
  assert(filter.$or.length === 2);
});

test('apiError creates structured error response', function() {
  var { apiError, ERROR_CODES } = require('../src/utils/errorCodes');
  var err = apiError(ERROR_CODES.INVALID_AMOUNT, 'Minimum is 20');
  assert(err.code === 'INVALID_AMOUNT');
  assert(err.error === 'Minimum is 20');
});

test('apiError includes optional details', function() {
  var { apiError } = require('../src/utils/errorCodes');
  var err = apiError('TEST', 'msg', { field: 'amount' });
  assert(err.details.field === 'amount');
});

// ==================== Results ====================
console.log('\n' + '─'.repeat(40));
console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
console.log('─'.repeat(40) + '\n');

process.exit(failed > 0 ? 1 : 0);
