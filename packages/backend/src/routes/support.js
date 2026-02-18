// Support routes - Tickets and FAQ
var express = require('express');
var db = require('../../database/src/index');
var emailService = require('../services/email');
var authenticateToken = require('../middleware/auth');
var { strictLimiter } = require('../middleware/rateLimiter');
var notificationService = require('../services/notifications.js');
var TYPES = notificationService.NOTIFICATION_TYPES;
var router = express.Router();

// Generate ticket ID
function generateTicketId() {
  var date = new Date();
  var prefix = 'TKT';
  var timestamp = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  var random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return prefix + '-' + timestamp + '-' + random;
}

// Submit support ticket (no auth required)
router.post('/tickets', async function(req, res) {
  try {
    var category = req.body.category;
    var priority = req.body.priority || 'medium';
    var subject = req.body.subject;
    var message = req.body.message;
    var email = req.body.email;
    var phone = req.body.phone;
    
    // Validation
    if (!category || !subject || !message || !email) {
      return res.status(400).json({ error: 'Category, subject, message, and email are required' });
    }
    
    // Validate types and lengths
    if (typeof subject !== 'string' || subject.trim().length < 3 || subject.trim().length > 200) {
      return res.status(400).json({ error: 'Subject must be 3-200 characters' });
    }
    if (typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
      return res.status(400).json({ error: 'Message must be 10-5000 characters' });
    }
    
    // Proper email validation
    if (typeof email !== 'string' || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    email = email.trim().toLowerCase();
    
    var validCategories = ['account', 'deposit', 'withdrawal', 'investment', 'technical', 'business', 'feedback', 'other'];
    if (validCategories.indexOf(category) === -1) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    var validPriorities = ['low', 'medium', 'high'];
    if (validPriorities.indexOf(priority) === -1) {
      priority = 'medium';
    }
    
    var ticketId = generateTicketId();
    
    var database = await db.getDb();
    
    // Check if user exists (optional association)
    var user = await database.collection('users').findOne({ email: email });
    
    var ticket = {
      ticketId: ticketId,
      userId: user ? user._id.toString() : null,
      category: category,
      priority: priority,
      subject: subject.substring(0, 100),
      message: message.substring(0, 5000),
      email: email,
      phone: phone || null,
      status: 'open', // open, in_progress, resolved, closed
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await database.collection('support_tickets').insertOne(ticket);
    
    // Send confirmation email
    try {
      await emailService.sendEmail('supportTicketConfirmation', email, {
        ticketId: ticketId,
        subject: subject,
        category: category,
        priority: priority,
        userName: user ? user.name : email.split('@')[0],
        appUrl: process.env.APP_URL
      });
    } catch (emailErr) {
      console.error('Failed to send ticket confirmation email:', emailErr);
    }
    
    // Notify support team (async)
    try {
      var supportEmail = process.env.SUPPORT_EMAIL || 'support@demony.com';
      await emailService.sendEmail('supportTicketNotification', supportEmail, {
        ticketId: ticketId,
        subject: subject,
        category: category,
        priority: priority,
        message: message.substring(0, 500),
        email: email,
        phone: phone,
        userName: user ? user.name : 'Guest',
        appUrl: process.env.APP_URL
      });
    } catch (notifyErr) {
      console.error('Failed to send support notification:', notifyErr);
    }
    
    res.json({
      message: 'Support ticket submitted successfully',
      ticketId: ticketId
    });
    
    // Send in-app notification if user exists (non-blocking)
    if (user) {
      notificationService.createNotification(user._id.toString(), TYPES.SUPPORT_TICKET_CREATED, {
        title: 'Support Request Received',
        message: 'Your ticket ' + ticketId + ' has been submitted. We\'ll respond within 24 hours.',
        link: '#/support',
        metadata: { ticketId: ticketId }
      }).catch(function() {});
    }
  } catch (err) {
    console.error('Support ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get authenticated user's tickets
router.get('/tickets/my', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    var userId = req.user.userId || req.user.id;

    var tickets = await database.collection('support_tickets')
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    res.json({
      tickets: tickets.map(function(ticket) {
        return {
          ticketId: ticket.ticketId,
          category: ticket.category,
          priority: ticket.priority,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          email: ticket.email,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          responseCount: ticket.responses ? ticket.responses.length : 0
        };
      })
    });
  } catch (err) {
    console.error('Get my tickets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket status by ID (rate-limited, returns limited info without auth)
router.get('/tickets/:ticketId', strictLimiter, async function(req, res) {
  try {
    var ticketId = req.params.ticketId;
    
    // Validate ticket ID format to prevent enumeration
    if (!ticketId || !/^TKT-\d{6}-[A-Z0-9]{6}$/.test(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
    var database = await db.getDb();
    var ticket = await database.collection('support_tickets').findOne({ ticketId: ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Return only status info - no message content without authentication
    res.json({
      ticketId: ticket.ticketId,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      responseCount: ticket.responses ? ticket.responses.length : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get full ticket details (authenticated - user can only see their own tickets)
router.get('/tickets/:ticketId/details', authenticateToken, async function(req, res) {
  try {
    var ticketId = req.params.ticketId;
    
    var database = await db.getDb();
    var ticket = await database.collection('support_tickets').findOne({ ticketId: ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Only allow the ticket owner or admin to see full details
    if (ticket.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this ticket' });
    }
    
    res.json({
      ticketId: ticket.ticketId,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      responses: ticket.responses.map(function(r) {
        return {
          message: r.message,
          isStaff: r.isStaff,
          createdAt: r.createdAt
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get FAQ (public)
router.get('/faq', async function(req, res) {
  try {
    var database = await db.getDb();
    var faqs = await database.collection('faq')
      .find({ published: true })
      .sort({ order: 1 })
      .toArray();
    
    // Return default FAQs if none in database
    if (!faqs || faqs.length === 0) {
      return res.json({ faqs: [] });
    }
    
    res.json({
      faqs: faqs.map(function(f) {
        return {
          category: f.category,
          question: f.question,
          answer: f.answer
        };
      })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health/status check (public)
router.get('/status', function(req, res) {
  res.json({
    status: 'operational',
    services: {
      api: 'operational',
      database: 'operational',
      payments: 'operational',
      email: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
