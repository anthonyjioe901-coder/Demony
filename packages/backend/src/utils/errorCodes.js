// SYS-04: Machine-readable error codes for API responses
// Usage: res.status(400).json(apiError('INVALID_AMOUNT', 'Minimum deposit is 20'))
// Client can switch on error.code instead of parsing human-readable messages

var ERROR_CODES = {
  // Auth
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID_FORMAT: 'INVALID_ID_FORMAT',
  MISSING_FIELDS: 'MISSING_FIELDS',
  
  // Financial
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ALREADY_PROCESSED: 'ALREADY_PROCESSED',
  WITHDRAWAL_LIMIT: 'WITHDRAWAL_LIMIT',
  
  // Investment
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_CLOSED: 'PROJECT_CLOSED',
  INVESTMENT_NOT_FOUND: 'INVESTMENT_NOT_FOUND',
  
  // General
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  DUPLICATE: 'DUPLICATE'
};

/**
 * Create a structured API error response.
 * @param {string} code - Machine-readable error code from ERROR_CODES
 * @param {string} message - Human-readable error message
 * @param {object} [details] - Optional additional details
 */
function apiError(code, message, details) {
  var response = { error: message, code: code };
  if (details) response.details = details;
  return response;
}

module.exports = { ERROR_CODES: ERROR_CODES, apiError: apiError };
