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

export { escapeHtml, escapeAttr, debounce, formatDate, getCurrentYear, showNotification };

// MED-11: Centralized notification function (moved from app.js)
// MED-12: Fixed style tag duplication — inject animation CSS once
var _notifStyleInjected = false;
function _ensureNotifStyle() {
  if (_notifStyleInjected) return;
  var style = document.createElement('style');
  style.id = 'demony-notif-style';
  style.textContent = '@keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }';
  document.head.appendChild(style);
  _notifStyleInjected = true;
}

function showNotification(message, type) {
  var colors = {
    'success': { bg: '#10b981', icon: '\u2705' },
    'error': { bg: '#ef4444', icon: '\u274C' },
    'info': { bg: '#3b82f6', icon: '\u2139\uFE0F' },
    'warning': { bg: '#f59e0b', icon: '\u26A0\uFE0F' }
  };
  var color = colors[type] || colors['info'];
  _ensureNotifStyle();
  var notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 10000; padding: 1.25rem 2rem; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); max-width: 600px; width: 90%; text-align: center; font-weight: 600; font-size: 1rem; line-height: 1.5; animation: slideDown 0.3s ease-out;';
  notification.style.backgroundColor = color.bg;
  notification.style.color = 'white';
  notification.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; gap: 0.75rem;"><span style="font-size: 1.5rem;">' + color.icon + '</span><span>' + message + '</span></div>';
  document.body.appendChild(notification);
  setTimeout(function() {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s';
    setTimeout(function() { notification.remove(); }, 500);
  }, 7000);
  return notification;
}
