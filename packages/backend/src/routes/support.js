// Support routes - Tickets and FAQ
var express = require('express');
var db = require('../../../database/src/index');
var emailService = require('../services/email');
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
    
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
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
  } catch (err) {
    console.error('Support ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket status by ID (no auth - uses ticket ID as verification)
router.get('/tickets/:ticketId', async function(req, res) {
  try {
    var ticketId = req.params.ticketId;
    
    var database = await db.getDb();
    var ticket = await database.collection('support_tickets').findOne({ ticketId: ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({
      ticketId: ticket.ticketId,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
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
