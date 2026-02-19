// Notification UI - Bell icon, dropdown panel, SSE connection
import { escapeHtml } from './utils.js';

var _api = null;
var _isOpen = false;
var _notifications = [];
var _unreadCount = 0;
var _outsideClickHandler = null;
var _initialized = false;

// Initialize notification system
function initNotifications(api) {
  // Prevent duplicate initialization (updateAuthState can be called multiple times)
  if (_initialized && _api === api) {
    return;
  }
  
  // Clean up any previous instance first
  if (_initialized) {
    destroyNotifications();
  }
  
  _api = api;
  _initialized = true;
  
  if (!api.token) return;
  
  // Create bell icon in navbar
  createNotificationBell();
  
  // Load initial notifications
  loadNotifications();
  
  // Connect SSE stream
  api.connectNotificationStream(function(data) {
    if (data.event === 'notification') {
      handleNewNotification(data.notification);
    } else if (data.event === 'unread_count') {
      updateBadge(data.count);
    }
  });
}

// Cleanup on logout
function destroyNotifications() {
  if (_api) {
    _api.disconnectNotificationStream();
  }
  // Remove outside click handler to prevent leak
  if (_outsideClickHandler) {
    document.removeEventListener('click', _outsideClickHandler);
    _outsideClickHandler = null;
  }
  var bell = document.getElementById('notification-bell');
  if (bell) bell.remove();
  var panel = document.getElementById('notification-panel');
  if (panel) panel.remove();
  _notifications = [];
  _unreadCount = 0;
  _isOpen = false;
  _initialized = false;
  _api = null;
}

// Create notification bell in the navbar
function createNotificationBell() {
  // Remove existing bell
  var existingBell = document.getElementById('notification-bell');
  if (existingBell) existingBell.remove();
  
  var bell = document.createElement('div');
  bell.id = 'notification-bell';
  bell.className = 'notification-bell';
  bell.innerHTML = 
    '<button class="notification-bell-btn" title="Notifications">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>' +
        '<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>' +
      '</svg>' +
      '<span class="notification-badge" id="notification-badge" style="display: none;">0</span>' +
    '</button>';
  
  // Insert before user menu in the nav-right section
  var userMenu = document.getElementById('user-menu');
  var navRight = document.querySelector('.nav-right');
  
  if (navRight && userMenu) {
    navRight.insertBefore(bell, userMenu);
  } else if (navRight) {
    navRight.appendChild(bell);
  } else {
    document.body.appendChild(bell);
  }
  
  // Click handler
  bell.querySelector('.notification-bell-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    togglePanel();
  });
  
  // Close panel on outside click (use stored ref to prevent leak)
  if (_outsideClickHandler) {
    document.removeEventListener('click', _outsideClickHandler);
  }
  _outsideClickHandler = function(e) {
    if (_isOpen && !e.target.closest('#notification-panel') && !e.target.closest('#notification-bell')) {
      closePanel();
    }
  };
  document.addEventListener('click', _outsideClickHandler);
  
  // Add styles
  addNotificationStyles();
}

function togglePanel() {
  if (_isOpen) {
    closePanel();
  } else {
    openPanel();
  }
}

function openPanel() {
  _isOpen = true;
  var existingPanel = document.getElementById('notification-panel');
  if (existingPanel) existingPanel.remove();
  
  var panel = document.createElement('div');
  panel.id = 'notification-panel';
  panel.className = 'notification-panel';
  
  var headerHtml = 
    '<div class="notification-panel-header">' +
      '<h3>Notifications</h3>' +
      '<div class="notification-panel-actions">' +
        (_unreadCount > 0 ? '<button class="notification-mark-all" id="mark-all-read">Mark all read</button>' : '') +
      '</div>' +
    '</div>';
  
  var bodyHtml = '<div class="notification-panel-body" id="notification-list">';
  
  if (_notifications.length === 0) {
    bodyHtml += '<div class="notification-empty"><p>No notifications yet</p></div>';
  } else {
    _notifications.forEach(function(notif) {
      bodyHtml += renderNotificationItem(notif);
    });
  }
  
  bodyHtml += '</div>';
  
  panel.innerHTML = headerHtml + bodyHtml;
  
  // Append to bell container
  var bell = document.getElementById('notification-bell');
  if (bell) {
    bell.appendChild(panel);
  }
  
  // Mark all read button handler
  var markAllBtn = document.getElementById('mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      markAllRead();
    });
  }
  
  // Individual notification click handlers
  panel.querySelectorAll('.notification-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var id = this.getAttribute('data-id');
      var link = this.getAttribute('data-link');
      
      // Mark as read
      if (this.classList.contains('unread')) {
        _api.markNotificationRead(id).catch(function() {});
        this.classList.remove('unread');
        _unreadCount = Math.max(0, _unreadCount - 1);
        updateBadge(_unreadCount);
      }
      
      // Navigate
      if (link) {
        closePanel();
        window.location.hash = link;
      }
    });
  });
}

function closePanel() {
  _isOpen = false;
  var panel = document.getElementById('notification-panel');
  if (panel) panel.remove();
}

function renderNotificationItem(notif) {
  var timeAgo = getTimeAgo(new Date(notif.createdAt));
  var unreadClass = notif.read ? '' : ' unread';
  
  return '<div class="notification-item' + unreadClass + '" data-id="' + (notif._id || notif.id) + '" data-link="' + (notif.link || '') + '">' +
    '<div class="notification-icon">' + escapeHtml(notif.icon || '🔔') + '</div>' +
    '<div class="notification-content">' +
      '<div class="notification-title">' + escapeHtml(notif.title || 'Notification') + '</div>' +
      '<div class="notification-message">' + escapeHtml(notif.message || '') + '</div>' +
      '<div class="notification-time">' + timeAgo + '</div>' +
    '</div>' +
    (!notif.read ? '<div class="notification-dot"></div>' : '') +
  '</div>';
}

function handleNewNotification(notification) {
  // Add to top of list
  _notifications.unshift(notification);
  _unreadCount++;
  updateBadge(_unreadCount);
  
  // If panel is open, refresh it
  if (_isOpen) {
    openPanel();
  }
  
  // Show toast notification
  showNotificationToast(notification);
}

function showNotificationToast(notification) {
  var toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = 
    '<div class="notification-toast-content">' +
      '<span class="notification-toast-icon">' + escapeHtml(notification.icon || '🔔') + '</span>' +
      '<div>' +
        '<div class="notification-toast-title">' + escapeHtml(notification.title) + '</div>' +
        '<div class="notification-toast-msg">' + escapeHtml(notification.message) + '</div>' +
      '</div>' +
    '</div>';
  
  document.body.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(function() {
    toast.classList.add('show');
  });
  
  // Click to navigate
  toast.addEventListener('click', function() {
    if (notification.link) {
      window.location.hash = notification.link;
    }
    toast.remove();
  });
  
  // Auto-remove after 5s
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 5000);
}

function updateBadge(count) {
  _unreadCount = count;
  var badge = document.getElementById('notification-badge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function loadNotifications() {
  if (!_api || !_api.token) return;
  
  _api.getNotifications({ limit: 30 }).then(function(result) {
    _notifications = result.notifications || [];
    _unreadCount = result.unreadCount || 0;
    updateBadge(_unreadCount);
  }).catch(function() {});
}

function markAllRead() {
  if (!_api) return;
  
  _api.markNotificationRead('all').then(function() {
    _notifications.forEach(function(n) { n.read = true; });
    _unreadCount = 0;
    updateBadge(0);
    if (_isOpen) openPanel();
  }).catch(function() {});
}

function getTimeAgo(date) {
  var now = new Date();
  var diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return date.toLocaleDateString();
}

// Notification CSS
function addNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
  
  var style = document.createElement('style');
  style.id = 'notification-styles';
  style.textContent = 
    '.notification-bell { position: relative; display: inline-flex; align-items: center; margin-right: 0.75rem; }' +
    '.notification-bell-btn { background: none; border: none; cursor: pointer; padding: 0.5rem; display: flex; align-items: center; color: var(--text-color); position: relative; border-radius: 50%; transition: background 0.2s; }' +
    '.notification-bell-btn:hover { background: var(--surface-color); }' +
    '.notification-badge { position: absolute; top: 2px; right: 2px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; pointer-events: none; }' +
    
    '.notification-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 380px; max-height: 500px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 10000; overflow: hidden; }' +
    '.notification-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); }' +
    '.notification-panel-header h3 { margin: 0; font-size: 1rem; }' +
    '.notification-mark-all { background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 0.85rem; font-weight: 500; }' +
    '.notification-mark-all:hover { text-decoration: underline; }' +
    
    '.notification-panel-body { max-height: 400px; overflow-y: auto; }' +
    '.notification-empty { text-align: center; padding: 2rem; color: var(--text-muted); }' +
    
    '.notification-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 1.25rem; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid var(--border-color); }' +
    '.notification-item:hover { background: var(--surface-color); }' +
    '.notification-item.unread { background: rgba(99, 102, 241, 0.05); }' +
    '.notification-icon { font-size: 1.25rem; flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }' +
    '.notification-content { flex: 1; min-width: 0; }' +
    '.notification-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.15rem; }' +
    '.notification-message { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
    '.notification-time { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }' +
    '.notification-dot { width: 8px; height: 8px; background: var(--primary-color); border-radius: 50%; flex-shrink: 0; margin-top: 6px; }' +
    
    '.notification-toast { position: fixed; top: 20px; right: 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); padding: 1rem 1.25rem; z-index: 100000; cursor: pointer; transform: translateX(120%); transition: transform 0.3s ease; max-width: 380px; }' +
    '.notification-toast.show { transform: translateX(0); }' +
    '.notification-toast-content { display: flex; align-items: flex-start; gap: 0.75rem; }' +
    '.notification-toast-icon { font-size: 1.5rem; }' +
    '.notification-toast-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; }' +
    '.notification-toast-msg { font-size: 0.8rem; color: var(--text-muted); }' +
    
    '@media (max-width: 480px) {' +
      '.notification-panel { width: calc(100vw - 20px); right: -60px; }' +
      '.notification-toast { right: 10px; left: 10px; max-width: none; }' +
    '}';
  
  document.head.appendChild(style);
}

export { initNotifications, destroyNotifications };
