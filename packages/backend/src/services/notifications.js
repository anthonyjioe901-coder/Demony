// Notification Service - Real-time SSE + Persistent Storage
// Handles in-app notifications for deposits, investments, KYC, support, profits

var db = require('../../database/src/index');
var { ObjectId } = require('mongodb');

// ==================== SSE Connection Manager ====================
// Stores active SSE connections per user
var activeConnections = new Map(); // userId -> Set of response objects
var MAX_CONNECTIONS_PER_USER = 5; // MED-08: Limit SSE connections per user

function addConnection(userId, res) {
  if (!activeConnections.has(userId)) {
    activeConnections.set(userId, new Set());
  }
  var connections = activeConnections.get(userId);
  
  // MED-08: Enforce per-user connection limit — drop oldest
  if (connections.size >= MAX_CONNECTIONS_PER_USER) {
    var oldest = connections.values().next().value;
    try { oldest.end(); } catch (e) {}
    connections.delete(oldest);
  }
  
  connections.add(res);
  
  // Clean up on disconnect
  res.on('close', function() {
    var connections = activeConnections.get(userId);
    if (connections) {
      connections.delete(res);
      if (connections.size === 0) {
        activeConnections.delete(userId);
      }
    }
  });
}

function sendToUser(userId, data) {
  var connections = activeConnections.get(userId);
  if (connections && connections.size > 0) {
    var message = 'data: ' + JSON.stringify(data) + '\n\n';
    connections.forEach(function(res) {
      try {
        res.write(message);
      } catch (err) {
        // Connection broken, will be cleaned up by close event
      }
    });
    return true; // Delivered in real-time
  }
  return false; // User not connected
}

// Broadcast to all connected users (for system announcements)
function broadcast(data) {
  var message = 'data: ' + JSON.stringify(data) + '\n\n';
  activeConnections.forEach(function(connections) {
    connections.forEach(function(res) {
      try {
        res.write(message);
      } catch (err) {
        // ignore broken connections
      }
    });
  });
}

// ==================== Notification Types ====================
var NOTIFICATION_TYPES = {
  // Wallet
  DEPOSIT_PENDING: 'deposit_pending',
  DEPOSIT_SUCCESS: 'deposit_success',
  DEPOSIT_FAILED: 'deposit_failed',
  WITHDRAWAL_PENDING: 'withdrawal_pending',
  WITHDRAWAL_APPROVED: 'withdrawal_approved',
  WITHDRAWAL_REJECTED: 'withdrawal_rejected',
  
  // Investments
  INVESTMENT_CONFIRMED: 'investment_confirmed',
  PROFIT_DISTRIBUTED: 'profit_distributed',
  INVESTMENT_MATURED: 'investment_matured',
  PROJECT_UPDATE: 'project_update',
  PROJECT_COMPLETED: 'project_completed',
  PROJECT_CANCELLED: 'project_cancelled',
  
  // KYC
  KYC_SUBMITTED: 'kyc_submitted',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  
  // Support
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_REPLIED: 'support_ticket_replied',
  SUPPORT_TICKET_RESOLVED: 'support_ticket_resolved',
  
  // Referrals
  REFERRAL_SIGNUP: 'referral_signup',
  REFERRAL_BONUS: 'referral_bonus',
  
  // System
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  WELCOME: 'welcome'
};

// ==================== Create Notification ====================
async function createNotification(userId, type, data) {
  try {
    var database = await db.getDb();
    
    var notification = {
      userId: userId,
      type: type,
      title: data.title || getDefaultTitle(type),
      message: data.message || '',
      icon: data.icon || getDefaultIcon(type),
      link: data.link || null,     // e.g., '#/wallet', '#/investments'
      read: false,
      createdAt: new Date(),
      metadata: data.metadata || {}
    };
    
    var result = await database.collection('notifications').insertOne(notification);
    notification._id = result.insertedId;
    
    // Send via SSE to connected clients
    sendToUser(userId, {
      event: 'notification',
      notification: notification
    });
    
    // Update unread count
    var unreadCount = await database.collection('notifications').countDocuments({
      userId: userId,
      read: false
    });
    
    sendToUser(userId, {
      event: 'unread_count',
      count: unreadCount
    });
    
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

// ==================== Bulk Notification ====================
// HIGH-07: Use insertMany for efficiency instead of sequential loop
async function notifyMultipleUsers(userIds, type, data) {
  if (!userIds || userIds.length === 0) return [];
  try {
    var database = await db.getDb();
    var now = new Date();
    var notifications = userIds.map(function(userId) {
      return {
        userId: userId,
        type: type,
        title: data.title || getDefaultTitle(type),
        message: data.message || '',
        icon: data.icon || getDefaultIcon(type),
        link: data.link || null,
        read: false,
        createdAt: now,
        metadata: data.metadata || {}
      };
    });
    
    var result = await database.collection('notifications').insertMany(notifications);
    
    // Attach inserted IDs and send SSE to connected users
    var inserted = notifications.map(function(n, i) {
      n._id = result.insertedIds[i];
      sendToUser(n.userId, { event: 'notification', notification: n });
      return n;
    });
    
    // Send updated unread counts to each user via SSE
    var uniqueUserIds = [...new Set(userIds)];
    for (var uid of uniqueUserIds) {
      try {
        var count = await database.collection('notifications').countDocuments({ userId: uid, read: false });
        sendToUser(uid, { event: 'unread_count', count: count });
      } catch (e) { /* ignore */ }
    }
    
    return inserted;
  } catch (err) {
    console.error('Failed to bulk create notifications:', err);
    return [];
  }
}

// ==================== Get Notifications ====================
async function getNotifications(userId, options) {
  var database = await db.getDb();
  var query = { userId: userId };
  
  if (options && options.unreadOnly) {
    query.read = false;
  }
  
  var limit = (options && options.limit) || 50;
  var skip = (options && options.skip) || 0;
  
  var notifications = await database.collection('notifications')
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  var total = await database.collection('notifications')
    .countDocuments(query);
  
  var unreadCount = await database.collection('notifications')
    .countDocuments({ userId: userId, read: false });
  
  return {
    notifications: notifications,
    total: total,
    unreadCount: unreadCount
  };
}

// ==================== Mark as Read ====================
async function markAsRead(userId, notificationId) {
  var database = await db.getDb();
  
  if (notificationId === 'all') {
    await database.collection('notifications').updateMany(
      { userId: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
  } else {
    await database.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId), userId: userId },
      { $set: { read: true, readAt: new Date() } }
    );
  }
  
  var unreadCount = await database.collection('notifications')
    .countDocuments({ userId: userId, read: false });
  
  // Update count via SSE
  sendToUser(userId, {
    event: 'unread_count',
    count: unreadCount
  });
  
  return { unreadCount: unreadCount };
}

// ==================== Delete Old Notifications ====================
async function cleanupOldNotifications(daysOld) {
  var database = await db.getDb();
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (daysOld || 90));
  
  var result = await database.collection('notifications').deleteMany({
    createdAt: { $lt: cutoff },
    read: true
  });
  
  return result.deletedCount;
}

// ==================== Helper Functions ====================
function getDefaultTitle(type) {
  var titles = {
    deposit_pending: 'Deposit Processing',
    deposit_success: 'Deposit Successful',
    deposit_failed: 'Deposit Failed',
    withdrawal_pending: 'Withdrawal Submitted',
    withdrawal_approved: 'Withdrawal Approved',
    withdrawal_rejected: 'Withdrawal Rejected',
    investment_confirmed: 'Investment Confirmed',
    profit_distributed: 'Profit Distribution',
    investment_matured: 'Investment Matured',
    project_update: 'Project Update',
    project_completed: 'Project Completed',
    project_cancelled: 'Project Cancelled',
    kyc_submitted: 'KYC Submitted',
    kyc_approved: 'KYC Approved',
    kyc_rejected: 'KYC Needs Attention',
    support_ticket_created: 'Support Request Received',
    support_ticket_replied: 'Support Reply',
    support_ticket_resolved: 'Ticket Resolved',
    referral_signup: 'New Referral',
    referral_bonus: 'Referral Bonus',
    system_announcement: 'Announcement',
    welcome: 'Welcome to Demony!'
  };
  return titles[type] || 'Notification';
}

function getDefaultIcon(type) {
  var icons = {
    deposit_pending: '⏳',
    deposit_success: '💰',
    deposit_failed: '❌',
    withdrawal_pending: '📤',
    withdrawal_approved: '✅',
    withdrawal_rejected: '❌',
    investment_confirmed: '📈',
    profit_distributed: '💵',
    investment_matured: '🎉',
    project_update: '📋',
    project_completed: '🏁',
    project_cancelled: '🚫',
    kyc_submitted: '📄',
    kyc_approved: '✅',
    kyc_rejected: '⚠️',
    support_ticket_created: '🎫',
    support_ticket_replied: '💬',
    support_ticket_resolved: '✅',
    referral_signup: '👤',
    referral_bonus: '🎁',
    system_announcement: '📢',
    welcome: '👋'
  };
  return icons[type] || '🔔';
}

// ==================== Exports ====================
module.exports = {
  addConnection: addConnection,
  sendToUser: sendToUser,
  broadcast: broadcast,
  createNotification: createNotification,
  notifyMultipleUsers: notifyMultipleUsers,
  getNotifications: getNotifications,
  markAsRead: markAsRead,
  cleanupOldNotifications: cleanupOldNotifications,
  NOTIFICATION_TYPES: NOTIFICATION_TYPES
};
