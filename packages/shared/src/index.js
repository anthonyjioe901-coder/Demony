// Demony Shared Utilities
// Common functions and constants used across web, mobile, and backend

// API endpoints
var API_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  PROJECTS: '/api/projects',
  INVESTMENTS: '/api/investments',
  PORTFOLIO: '/api/portfolio',
  PERFORMANCE: '/api/performance'
};

// Project categories
var PROJECT_CATEGORIES = [
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏢' },
  { id: 'renewable-energy', name: 'Renewable Energy', icon: '🌞' },
  { id: 'food-beverage', name: 'Food & Beverage', icon: '🥖' },
  { id: 'retail', name: 'Retail', icon: '🛒' }
];

// Investment status
var INVESTMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Format currency
function formatCurrency(amount, currency) {
  currency = currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Format percentage
function formatPercent(value, decimals) {
  decimals = decimals || 1;
  return value.toFixed(decimals) + '%';
}

// Calculate progress percentage
function calculateProgress(current, goal) {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

// Format date
function formatDate(date, format) {
  format = format || 'short';
  var d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } else if (format === 'long') {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  } else {
    return d.toISOString();
  }
}

// Calculate days remaining
function daysRemaining(endDate) {
  var now = new Date();
  var end = new Date(endDate);
  var diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Validate email
function isValidEmail(email) {
  var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate password (min 8 chars, 1 number, 1 letter)
function isValidPassword(password) {
  if (password.length < 8) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  return true;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Deep clone object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Debounce function
function debounce(fn, delay) {
  var timeout;
  return function() {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_ENDPOINTS: API_ENDPOINTS,
    PROJECT_CATEGORIES: PROJECT_CATEGORIES,
    INVESTMENT_STATUS: INVESTMENT_STATUS,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    calculateProgress: calculateProgress,
    formatDate: formatDate,
    daysRemaining: daysRemaining,
    isValidEmail: isValidEmail,
    isValidPassword: isValidPassword,
    generateId: generateId,
    deepClone: deepClone,
    debounce: debounce
  };
}

if (typeof window !== 'undefined') {
  window.DemonyShared = {
    API_ENDPOINTS: API_ENDPOINTS,
    PROJECT_CATEGORIES: PROJECT_CATEGORIES,
    INVESTMENT_STATUS: INVESTMENT_STATUS,
    formatCurrency: formatCurrency,
    formatPercent: formatPercent,
    calculateProgress: calculateProgress,
    formatDate: formatDate,
    daysRemaining: daysRemaining,
    isValidEmail: isValidEmail,
    isValidPassword: isValidPassword,
    generateId: generateId,
    deepClone: deepClone,
    debounce: debounce
  };
}
