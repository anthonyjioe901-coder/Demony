// Auth routes - MongoDB version
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var db = require('../../../database/src/index');
var authenticateToken = require('../middleware/auth');
var emailService = require('../services/email');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

var JWT_SECRET = process.env.JWT_SECRET || 'demony-secret-key-change-in-production';

function getApiBaseUrl() {
  // Use API_URL directly if set, otherwise default to the backend API on Render
  // IMPORTANT: This must point to the BACKEND, not the frontend!
  return process.env.API_URL || process.env.API_BASE_URL || 'https://demony-api.onrender.com/api';
}

// Valid user roles
var USER_ROLES = ['investor', 'business_owner', 'admin'];

// Signup with role selection and KYC
router.post('/signup', async function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var role = req.body.role || 'investor';
  var phone = req.body.phone;
  var businessName = req.body.businessName; // For business owners
  var businessRegistration = req.body.businessRegistration; // For business owners
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  
  if (USER_ROLES.indexOf(role) === -1 || role === 'admin') {
    return res.status(400).json({ error: 'Invalid role. Choose investor or business_owner' });
  }
  
  // Business owners must provide business details
  if (role === 'business_owner' && (!businessName || !businessRegistration)) {
    return res.status(400).json({ error: 'Business name and registration number required for business owners' });
  }
  
  try {
    var userCheck = await db.query('users', 'findOne', { filter: { email: email } });
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    var hashedPassword = await bcrypt.hash(password, 10);
    
    var userData = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      phone: phone || null,
      
      // KYC fields
      kyc: {
        status: 'pending', // pending, submitted, verified, rejected
        idDocument: null,
        selfie: null,
        submittedAt: null,
        verifiedAt: null,
        rejectionReason: null
      },
      
      // Account status
      isVerified: false,
      isActive: true,
      
      // Financial
      walletBalance: 0,
      totalInvested: 0,
      totalEarnings: 0,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add business-specific fields
    if (role === 'business_owner') {
      userData.business = {
        name: businessName,
        registrationNumber: businessRegistration,
        verified: false,
        documents: []
      };
    }
    
    var result = await db.query('users', 'insertOne', { doc: userData });
    
    var newUser = {
      id: result.insertedId.toString(),
      name: name,
      email: email,
      role: role,
      isVerified: false,
      kycStatus: 'pending'
    };
    
    var token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create verification token and send email
    try {
      var database = await db.getDb();
      var verificationToken = crypto.randomBytes(32).toString('hex');
      var verifyUrl = getApiBaseUrl() + '/auth/verify-email/' + verificationToken;
      await database.collection('email_verifications').insertOne({
        userId: newUser.id,
        token: verificationToken,
        used: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours
        createdAt: new Date()
      });
      emailService.sendVerificationEmail({ email: email, name: name }, verifyUrl).catch(function(err) {
        console.error('Failed to send verification email:', err);
      });
    } catch (verificationErr) {
      console.error('Could not create verification token:', verificationErr);
    }
    
    // Send welcome email (async, don't wait)
    emailService.sendWelcomeEmail({ email: email, name: name }).catch(function(err) {
      console.error('Failed to send welcome email:', err);
    });
    
    res.json({ message: 'User created successfully', token: token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    var result = await db.query('users', 'findOne', { filter: { email: email } });
    var user = result.rows[0];
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check if account is explicitly suspended (default to active if not set)
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is suspended. Contact support.' });
    }
    
    var validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check email verification - require verification unless in development or explicitly skipped
    var skipVerification = process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL_VERIFICATION === 'true';
    
    if (!user.isVerified && !skipVerification) {
      console.log('📧 User not verified, sending verification email to:', user.email);
      try {
        var database = await db.getDb();
        // Check for existing valid verification token
        var existing = await database.collection('email_verifications').findOne({
          userId: user._id.toString(),
          used: false,
          expiresAt: { $gt: new Date() }
        });
        
        var tokenToSend;
        if (existing) {
          tokenToSend = existing.token;
          console.log('📧 Using existing verification token for:', user.email);
        } else {
          tokenToSend = crypto.randomBytes(32).toString('hex');
          await database.collection('email_verifications').insertOne({
            userId: user._id.toString(),
            token: tokenToSend,
            used: false,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48), // 48 hours
            createdAt: new Date()
          });
          console.log('📧 Created new verification token for:', user.email);
        }
        
        var verifyUrlLogin = getApiBaseUrl() + '/auth/verify-email/' + tokenToSend;
        console.log('📧 Sending verification email to:', user.email, '- URL:', verifyUrlLogin);
        
        emailService.sendVerificationEmail(user, verifyUrlLogin).then(function(result) {
          console.log('✅ Verification email sent successfully:', result);
        }).catch(function(err) {
          console.error('❌ Failed to send verification email:', err);
        });
      } catch (verifyErr) {
        console.error('❌ Error handling verification email on login:', verifyErr);
      }
      
      return res.status(403).json({ 
        error: 'Please verify your email first. A verification link has been sent to ' + user.email + '. Check your inbox and spam folder.',
        needsVerification: true,
        email: user.email
      });
    }
    
    var token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'investor' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'investor',
        isVerified: user.isVerified || false,
        kycStatus: user.kyc ? user.kyc.status : 'pending',
        walletBalance: user.walletBalance || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async function(req, res) {
  try {
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role || 'investor',
      isVerified: user.isVerified || false,
      kycStatus: user.kyc ? user.kyc.status : 'pending',
      walletBalance: user.walletBalance || 0,
      totalInvested: user.totalInvested || 0,
      totalEarnings: user.totalEarnings || 0,
      business: user.business || null,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit KYC documents
router.post('/kyc/submit', authenticateToken, async function(req, res) {
  var idDocument = req.body.idDocument; // Base64 or URL
  var selfie = req.body.selfie; // Base64 or URL
  
  if (!idDocument || !selfie) {
    return res.status(400).json({ error: 'ID document and selfie are required' });
  }
  
  try {
    var ObjectId = require('mongodb').ObjectId;
    var database = await db.getDb();
    
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          'kyc.status': 'submitted',
          'kyc.idDocument': idDocument,
          'kyc.selfie': selfie,
          'kyc.submittedAt': new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ message: 'KYC documents submitted for review' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Verify email
router.get('/verify-email/:token', async function(req, res) {
  var token = req.params.token;
  console.log('📧 Verification attempt for token:', token ? token.substring(0, 10) + '...' : 'none');
  
  if (!token) return res.status(400).json({ error: 'Verification token is required' });
  
  try {
    var database = await db.getDb();
    var record = await database.collection('email_verifications').findOne({ token: token });
    
    console.log('📋 Verification record found:', !!record);
    
    if (!record) {
      console.log('❌ Invalid verification token');
      var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
      return res.redirect(appUrl + '/#login?verified=invalid');
    }
    
    if (record.used) {
      console.log('⚠️ Token already used');
      var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
      return res.redirect(appUrl + '/#login?verified=already');
    }
    
    if (record.expiresAt && record.expiresAt < new Date()) {
      console.log('⏰ Token expired');
      var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
      return res.redirect(appUrl + '/#login?verified=expired');
    }
    
    // Update user - handle both string and ObjectId userId
    var userId = record.userId;
    console.log('👤 Updating user:', userId);
    
    var updateResult;
    try {
      // Try as ObjectId first
      updateResult = await database.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isVerified: true, updatedAt: new Date() } }
      );
      console.log('📝 Update result (ObjectId):', {
        matched: updateResult.matchedCount,
        modified: updateResult.modifiedCount
      });
    } catch (e) {
      console.log('⚠️ ObjectId update failed, trying string ID:', e.message);
      // If that fails, try as string
      updateResult = await database.collection('users').updateOne(
        { _id: userId },
        { $set: { isVerified: true, updatedAt: new Date() } }
      );
      console.log('📝 Update result (string):', {
        matched: updateResult.matchedCount,
        modified: updateResult.modifiedCount
      });
    }
    
    if (updateResult.matchedCount === 0) {
      console.log('❌ User not found for userId:', userId);
      var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
      return res.redirect(appUrl + '/#login?verified=usernotfound');
    }
    
    console.log('✅ Email verified successfully for userId:', userId);
    
    await database.collection('email_verifications').updateOne(
      { _id: record._id },
      { $set: { used: true, usedAt: new Date() } }
    );
    
    // Redirect to login with success message
    var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
    res.redirect(appUrl + '/#login?verified=success');
  } catch (err) {
    console.error('❌ Verification error:', err);
    var appUrl = process.env.APP_URL || 'https://demony-web.onrender.com';
    res.redirect(appUrl + '/#login?verified=error');
  }
});

module.exports = router;
