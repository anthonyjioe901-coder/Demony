// Utility functions for Demony Web App

/**
 * Escape HTML special characters to prevent XSS attacks.
 * Use this whenever inserting user-controlled data into innerHTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Escape a string for use inside an HTML attribute value (double-quoted).
 */
function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Debounce a function call. Returns a new function that delays invoking
 * `fn` until after `delay` milliseconds have elapsed since the last call.
 */
function debounce(fn, delay) {
  var timer = null;
  return function() {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 * Format a date string safely.
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Get current year for copyright notices.
 */
function getCurrentYear() {
  return new Date().getFullYear();
}

export { escapeHtml, escapeAttr, debounce, formatDate, getCurrentYear };
