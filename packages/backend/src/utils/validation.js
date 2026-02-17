// Input validation helpers
var { ObjectId } = require('mongodb');

// Email regex - RFC 5322 simplified
var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Ghana phone format
var PHONE_REGEX = /^(\+233|0)[0-9]{9}$/;

// Known Ghana mobile money networks
var MOMO_NETWORKS = ['mtn', 'vodafone', 'airteltigo', 'telecel'];

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && EMAIL_REGEX.test(email);
}

function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  var cleaned = phone.replace(/[\s-]/g, '');
  return PHONE_REGEX.test(cleaned);
}

function isValidObjectId(id) {
  if (typeof id !== 'string') return false;
  try {
    return ObjectId.isValid(id);
  } catch (e) {
    return false;
  }
}

// Ensure amount has max 2 decimal places and is finite
function sanitizeAmount(amount) {
  var num = parseFloat(amount);
  if (!num || !isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100; // Round to 2 decimal places
}

function isValidString(val, minLen, maxLen) {
  if (typeof val !== 'string') return false;
  var trimmed = val.trim();
  if (minLen && trimmed.length < minLen) return false;
  if (maxLen && trimmed.length > maxLen) return false;
  return trimmed.length > 0;
}

function sanitizeString(val, maxLen) {
  if (typeof val !== 'string') return '';
  var trimmed = val.trim();
  if (maxLen) return trimmed.substring(0, maxLen);
  return trimmed;
}

// Validate password strength
function validatePassword(password) {
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length > 128) return 'Password is too long';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null; // valid
}

// Validate account number (digits only, reasonable length)
function isValidAccountNumber(num) {
  if (typeof num !== 'string') return false;
  var cleaned = num.replace(/[\s-]/g, '');
  return /^[0-9]{6,20}$/.test(cleaned);
}

// Validate momo network
function isValidMomoNetwork(network) {
  if (typeof network !== 'string') return false;
  return MOMO_NETWORKS.indexOf(network.toLowerCase()) !== -1;
}

module.exports = {
  isValidEmail,
  normalizeEmail,
  isValidPhone,
  isValidObjectId,
  sanitizeAmount,
  isValidString,
  sanitizeString,
  validatePassword,
  isValidAccountNumber,
  isValidMomoNetwork,
  EMAIL_REGEX,
  PHONE_REGEX,
  MOMO_NETWORKS
};
