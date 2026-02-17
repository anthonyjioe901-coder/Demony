// Notification Routes - SSE streaming + REST API
var express = require('express');
var authenticateToken = require('../middleware/auth.js');
var notificationService = require('../services/notifications.js');
var router = express.Router();

// ==================== SSE Stream ====================
// GET /api/notifications/stream - Server-Sent Events endpoint
// Note: EventSource doesn't support custom headers, so we also accept token as query param
router.get('/stream', function(req, res, next) {
  // Try query token first (EventSource), then fall back to header-based auth
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = 'Bearer ' + req.query.token;
  }
  authenticateToken(req, res, next);
}, function(req, res) {
  var userId = req.user.id || req.user.userId;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering (Render uses Nginx)
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial connection event
  res.write('data: ' + JSON.stringify({ event: 'connected', userId: userId }) + '\n\n');
  
  // Register this connection
  notificationService.addConnection(userId, res);
  
  // Send current unread count immediately
  notificationService.getNotifications(userId, { unreadOnly: true, limit: 1 })
    .then(function(result) {
      res.write('data: ' + JSON.stringify({ event: 'unread_count', count: result.unreadCount }) + '\n\n');
    })
    .catch(function() {});
  
  // Keep connection alive with heartbeat every 30s
  var heartbeat = setInterval(function() {
    try {
      res.write(':heartbeat\n\n');
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 30000);
  
  // Cleanup on disconnect
  req.on('close', function() {
    clearInterval(heartbeat);
  });
});

// ==================== REST API ====================

// GET /api/notifications - Get notification list
router.get('/', authenticateToken, async function(req, res) {
  try {
    var userId = req.user.id || req.user.userId;
    var options = {
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0,
      unreadOnly: req.query.unread === 'true'
    };
    
    var result = await notificationService.getNotifications(userId, options);
    
    res.json({
      notifications: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async function(req, res) {
  try {
    var userId = req.user.id || req.user.userId;
    var notificationId = req.params.id; // 'all' or specific ID
    
    var result = await notificationService.markAsRead(userId, notificationId);
    
    res.json({ success: true, unreadCount: result.unreadCount });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// GET /api/notifications/unread-count - Quick count endpoint
router.get('/unread-count', authenticateToken, async function(req, res) {
  try {
    var userId = req.user.id || req.user.userId;
    var result = await notificationService.getNotifications(userId, { unreadOnly: true, limit: 1 });
    
    res.json({ count: result.unreadCount });
  } catch (err) {
    res.json({ count: 0 });
  }
});

module.exports = router;
