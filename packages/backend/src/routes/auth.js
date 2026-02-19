// Auth routes - MongoDB version
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var db = require('../../database/src/index');
var authenticateToken = require('../middleware/auth');
var emailService = require('../services/email');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;

var JWT_SECRET = require('../config/jwt').JWT_SECRET;

// CRIT-04: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
var ACCESS_TOKEN_EXPIRY = '15m';
var REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// MED-10: Simple brute force protection for login attempts
var loginAttempts = {};
var MAX_LOGIN_ATTEMPTS = 5;
var LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Clean up old entries every 30 minutes
setInterval(function() {
  var now = Date.now();
  for (var key in loginAttempts) {
    if (loginAttempts[key].lockedUntil && loginAttempts[key].lockedUntil < now) {
      delete loginAttempts[key];
    }
  }
}, 30 * 60 * 1000);

function checkLoginAttempts(identifier) {
  var record = loginAttempts[identifier];
  if (!record) return { allowed: true };
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    var remainingMin = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, remainingMinutes: remainingMin };
  }
  if (record.lockedUntil && record.lockedUntil <= Date.now()) {
    delete loginAttempts[identifier];
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLogin(identifier) {
  if (!loginAttempts[identifier]) {
    loginAttempts[identifier] = { count: 0 };
  }
  loginAttempts[identifier].count++;
  if (loginAttempts[identifier].count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts[identifier].lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
}

function clearLoginAttempts(identifier) {
  delete loginAttempts[identifier];
}

// Password strength validation
function validatePassword(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null; // valid
}

function getApiBaseUrl() {
  // Use API_URL directly if set, otherwise default to the backend API on Render
  // IMPORTANT: This must point to the BACKEND, not the frontend!
  return process.env.API_URL || process.env.API_BASE_URL || 'https://demony-api.onrender.com/api';
}

function getAppUrl() {
  // Get frontend URL for redirects - always use the primary domain
  // Handle case where multiple URLs might be concatenated (fix malformed env var)
  var url = process.env.APP_URL || 'https://demony.tech';
  // If multiple URLs are accidentally concatenated, just use the first one
  if (url.includes(',')) {
    url = url.split(',')[0].trim();
  }
  // Always prefer the main domain
  if (url.includes('demony.tech') || url === 'https://demony.tech' || url === 'https://www.demony.tech') {
    return 'https://demony.tech';
  }
  // Remove any trailing slashes
  return url.replace(/\/+$/, '');
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
  
  // Validate and normalize email
  if (typeof email !== 'string' || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email.trim())) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  email = email.trim().toLowerCase();
  
  // Validate name length
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ error: 'Name must be 2-100 characters' });
  }
  name = name.trim();
  
  // Validate password strength
  var passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  // Phone is now required for all users
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate phone format (international format: +country code, 10-20 digits)
  var phoneClean = phone.replace(/[\s\-]/g, '');
  if (!/^[+]?[0-9]{10,20}$/.test(phoneClean)) {
    return res.status(400).json({ error: 'Invalid phone format. Use international format (e.g., +233 24 123 4567)' });
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
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    // Also check for duplicate phone number
    var phoneCheck = await db.query('users', 'findOne', { filter: { phone: phoneClean } });
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    var hashedPassword = await bcrypt.hash(password, 10);
    
    var userData = {
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      phone: phoneClean, // Store cleaned phone number
      
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
      tokenVersion: 0,
      
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
      { id: newUser.id, email: newUser.email, role: role, tokenVersion: 0 },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generate refresh token
    var refreshToken = crypto.randomBytes(40).toString('hex');
    try {
      var database2 = await db.getDb();
      await database2.collection('refresh_tokens').insertOne({
        userId: newUser.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        createdAt: new Date()
      });
    } catch (rtErr) {
      console.error('Failed to store refresh token:', rtErr.message);
    }

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
    
    // Send welcome in-app notification (async)
    var notificationService = require('../services/notifications.js');
    notificationService.createNotification(newUser.id, notificationService.NOTIFICATION_TYPES.WELCOME, {
      title: 'Welcome to Demony!',
      message: 'Your account is ready. Complete your profile and start investing!',
      link: '#/projects'
    }).catch(function() {});
    
    res.json({ message: 'User created successfully', token: token, refreshToken: refreshToken, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async function(req, res) {
  var email = req.body.email;
  var phone = req.body.phone;
  var password = req.body.password;
  
  // Must have either email or phone
  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'Email or phone and password are required' });
  }
  
  // Guard against bcrypt DoS with huge passwords
  if (typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  // Normalize email on login
  if (email) {
    email = email.trim().toLowerCase();
  }
  
  // MED-10: Check for account lockout
  var loginIdentifier = (email || phone || '').toLowerCase();
  var lockCheck = checkLoginAttempts(loginIdentifier);
  if (!lockCheck.allowed) {
    return res.status(429).json({ 
      error: 'Too many failed login attempts. Try again in ' + lockCheck.remainingMinutes + ' minutes.',
      lockedOut: true
    });
  }
  
  try {
    var user;
    
    // Find user by email or phone
    if (email) {
      var result = await db.query('users', 'findOne', { filter: { email: email } });
      user = result.rows[0];
    } else if (phone) {
      // Clean phone number for lookup
      var phoneClean = phone.replace(/[\s\-]/g, '');
      var phoneResult = await db.query('users', 'findOne', { filter: { phone: phoneClean } });
      user = phoneResult.rows[0];
      
      // If not found with cleaned phone, try original
      if (!user) {
        phoneResult = await db.query('users', 'findOne', { filter: { phone: phone } });
        user = phoneResult.rows[0];
      }
    }
    
    if (!user) {
      recordFailedLogin(loginIdentifier);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check if account is explicitly suspended (default to active if not set)
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is suspended. Contact support.' });
    }
    
    var validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      recordFailedLogin(loginIdentifier);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // MED-10: Clear failed attempts on successful login
    clearLoginAttempts(loginIdentifier);

    // Check email verification - require verification unless in development or explicitly skipped
    var skipVerification = process.env.NODE_ENV === 'development' || process.env.SKIP_EMAIL_VERIFICATION === 'true';
    
    if (!user.isVerified && !skipVerification) {
      console.log('📧 User not verified, checking rate limit for:', user.email);
      try {
        var database = await db.getDb();
        
        // Rate limit: max 3 verification emails per day
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var emailsSentToday = await database.collection('email_verifications').countDocuments({
          userId: user._id.toString(),
          createdAt: { $gte: today }
        });
        
        if (emailsSentToday >= 3) {
          console.log('⚠️ Rate limit reached for:', user.email, '- emails sent today:', emailsSentToday);
          return res.status(429).json({ 
            error: 'Too many verification emails requested today. Please check your inbox (including spam folder) or try again tomorrow.',
            needsVerification: true,
            email: user.email,
            rateLimited: true
          });
        }
        
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
          // MED-10: Invalidate all old unused tokens before creating new one
          await database.collection('email_verifications').updateMany(
            { userId: user._id.toString(), used: false },
            { $set: { used: true, invalidatedAt: new Date() } }
          );
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
        console.log('📧 Sending verification email to:', user.email);
        
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
      { id: user._id.toString(), email: user.email, role: user.role || 'investor', tokenVersion: user.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Generate refresh token
    var refreshToken = crypto.randomBytes(40).toString('hex');
    try {
      var rtDatabase = await db.getDb();
      await rtDatabase.collection('refresh_tokens').insertOne({
        userId: user._id.toString(),
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        createdAt: new Date()
      });
    } catch (rtErr) {
      console.error('Failed to store refresh token:', rtErr.message);
    }
    
    // Check if existing user needs to add phone number
    var needsPhone = !user.phone;
    
    res.json({
      message: 'Login successful',
      token: token,
      refreshToken: refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role || 'investor',
        isVerified: user.isVerified || false,
        kycStatus: user.kyc ? user.kyc.status : 'pending',
        walletBalance: user.walletBalance || 0,
        needsPhone: needsPhone
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

// Update user profile (name, optional phone, optional business name)
// Used by web mobile Settings page and Android app parity
router.put('/update-profile', authenticateToken, async function(req, res) {
  var name = req.body.name;
  var phone = req.body.phone;
  var businessName = req.body.businessName;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required' });
  }

  var updateDoc = {
    $set: {
      name: name.trim(),
      updatedAt: new Date()
    }
  };

  // Optional phone update (validate + enforce uniqueness)
  if (phone && typeof phone === 'string') {
    var phoneClean = phone.replace(/[\s\-]/g, '');
    if (!/^[+]?[0-9]{10,20}$/.test(phoneClean)) {
      return res.status(400).json({ error: 'Invalid phone format. Use international format (e.g., +233 24 123 4567)' });
    }
    updateDoc.$set.phone = phoneClean;
  }

  try {
    var database = await db.getDb();

    // Ensure user exists
    var existing = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check phone uniqueness if changing
    if (updateDoc.$set.phone) {
      var phoneUsed = await database.collection('users').findOne({
        phone: updateDoc.$set.phone,
        _id: { $ne: new ObjectId(req.user.id) }
      });
      if (phoneUsed) {
        return res.status(400).json({ error: 'Phone number already registered to another account' });
      }
    }

    // Optional business name update (only for business owners with business object)
    var businessNameTrimmed = typeof businessName === 'string' ? businessName.trim() : '';
    if (businessNameTrimmed.length > 0 && (existing.role || '') === 'business_owner') {
      // CRIT-03 FIX: Avoid conflicting $set paths (business + business.name)
      if (existing.business) {
        // Business object exists, just update the name sub-field
        updateDoc.$set['business.name'] = businessNameTrimmed;
      } else {
        // Business object doesn't exist, create the whole object
        updateDoc.$set.business = {
          name: businessNameTrimmed,
          registrationNumber: '',
          verified: false,
          documents: []
        };
      }
    }

    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      updateDoc
    );

    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role: user.role || 'investor',
        isVerified: user.isVerified || false,
        kycStatus: user.kyc ? user.kyc.status : 'pending',
        walletBalance: user.walletBalance || 0,
        totalInvested: user.totalInvested || 0,
        totalEarnings: user.totalEarnings || 0,
        business: user.business || null,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save notification preferences (web mobile Settings parity)
router.put('/notification-preferences', authenticateToken, async function(req, res) {
  var prefs = {
    emailNotifications: !!req.body.emailNotifications,
    investmentUpdates: !!req.body.investmentUpdates,
    referralNotifications: !!req.body.referralNotifications,
    marketingNotifications: !!req.body.marketingNotifications
  };

  try {
    var database = await db.getDb();

    var result = await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { notificationPreferences: prefs, updatedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Notification preferences saved', preferences: prefs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete account (soft delete by deactivating)
// HIGH-12: Require password re-authentication for destructive action
router.delete('/delete-account', authenticateToken, async function(req, res) {
  try {
    var password = req.body.password;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete your account' });
    }
    
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    var result = await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { isActive: false, deletedAt: new Date(), updatedAt: new Date() } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update phone number (for existing users who don't have one)
router.post('/update-phone', authenticateToken, async function(req, res) {
  var phone = req.body.phone;
  
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate phone format
  var phoneClean = phone.replace(/[\s\-]/g, '');
  if (!/^[+]?[0-9]{10,20}$/.test(phoneClean)) {
    return res.status(400).json({ error: 'Invalid phone format. Use international format (e.g., +233 24 123 4567)' });
  }
  
  try {
    var database = await db.getDb();
    
    // Check if phone is already in use
    var existingUser = await database.collection('users').findOne({ 
      phone: phoneClean,
      _id: { $ne: new ObjectId(req.user.id) }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered to another account' });
    }
    
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          phone: phoneClean,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ message: 'Phone number updated successfully', phone: phoneClean });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password (authenticated user)
router.post('/change-password', authenticateToken, async function(req, res) {
  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  var passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  try {
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    var isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    var hashedPassword = await bcrypt.hash(newPassword, 10);
    // Increment tokenVersion to invalidate all existing tokens
    await database.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { 
        $set: { password: hashedPassword, updatedAt: new Date() },
        $inc: { tokenVersion: 1 }
      }
    );
    
    // Issue new token with updated version
    var updatedUser = await database.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    var newToken = jwt.sign(
      { id: updatedUser._id.toString(), email: updatedUser.email, role: updatedUser.role || 'investor', tokenVersion: updatedUser.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.json({ message: 'Password changed successfully', token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PASSWORD RESET ====================

// Request password reset (forgot password)
router.post('/forgot-password', async function(req, res) {
  var email = req.body.email;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  email = email.trim().toLowerCase();
  
  try {
    var database = await db.getDb();
    var user = await database.collection('users').findOne({ email: email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }
    
    // Rate limit: max 3 reset requests per hour
    var oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    var recentResets = await database.collection('password_resets').countDocuments({
      userId: user._id.toString(),
      createdAt: { $gte: oneHourAgo }
    });
    
    if (recentResets >= 3) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }
    
    // Generate reset token
    var resetToken = crypto.randomBytes(32).toString('hex');
    var appUrl = getAppUrl();
    
    // Store reset token with 1-hour expiry
    await database.collection('password_resets').insertOne({
      userId: user._id.toString(),
      token: resetToken,
      used: false,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      createdAt: new Date()
    });
    
    // Send reset email
    var resetUrl = appUrl + '/#reset-password?token=' + resetToken;
    emailService.sendPasswordResetEmail(user, resetUrl).catch(function(err) {
      console.error('Failed to send password reset email:', err);
    });
    
    res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async function(req, res) {
  var token = req.body.token;
  var newPassword = req.body.newPassword;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  
  var passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ error: passwordError });
  }
  
  try {
    var database = await db.getDb();
    
    // Find valid, unused reset token
    var resetRecord = await database.collection('password_resets').findOne({
      token: token,
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }
    
    // Hash new password
    var hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and increment tokenVersion to invalidate all existing tokens
    await database.collection('users').updateOne(
      { _id: new ObjectId(resetRecord.userId) },
      { 
        $set: { password: hashedPassword, updatedAt: new Date() },
        $inc: { tokenVersion: 1 }
      }
    );
    
    // Mark token as used
    await database.collection('password_resets').updateOne(
      { _id: resetRecord._id },
      { $set: { used: true, usedAt: new Date() } }
    );
    
    // Invalidate all other reset tokens for this user
    await database.collection('password_resets').updateMany(
      { userId: resetRecord.userId, _id: { $ne: resetRecord._id }, used: false },
      { $set: { used: true, usedAt: new Date() } }
    );
    
    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== REFRESH TOKEN ====================

// Exchange a valid refresh token for a new access token
router.post('/refresh-token', async function(req, res) {
  var refreshToken = req.body.refreshToken;
  
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  try {
    var database = await db.getDb();
    
    // Find the refresh token
    var tokenRecord = await database.collection('refresh_tokens').findOne({
      token: refreshToken,
      expiresAt: { $gt: new Date() }
    });
    
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid or expired refresh token. Please login again.' });
    }
    
    // Find the user
    var user = await database.collection('users').findOne({ _id: new ObjectId(tokenRecord.userId) });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is suspended' });
    }
    
    // Issue new access token
    var newAccessToken = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'investor', tokenVersion: user.tokenVersion || 0 },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Rotate refresh token (invalidate old, issue new) for security
    var newRefreshToken = crypto.randomBytes(40).toString('hex');
    await database.collection('refresh_tokens').deleteOne({ _id: tokenRecord._id });
    await database.collection('refresh_tokens').insertOne({
      userId: user._id.toString(),
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdAt: new Date()
    });
    
    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout - invalidate refresh token
router.post('/logout', async function(req, res) {
  var refreshToken = req.body.refreshToken;
  
  if (refreshToken) {
    try {
      var database = await db.getDb();
      await database.collection('refresh_tokens').deleteOne({ token: refreshToken });
    } catch (err) {
      console.error('Logout cleanup error:', err.message);
    }
  }
  
  res.json({ message: 'Logged out successfully' });
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
  var appUrl = getAppUrl(); // Use helper function for clean URL
  console.log('📧 Verification attempt for token:', token ? token.substring(0, 10) + '...' : 'none');
  console.log('📍 Redirect URL:', appUrl);
  
  if (!token) return res.status(400).json({ error: 'Verification token is required' });
  
  try {
    var database = await db.getDb();
    var record = await database.collection('email_verifications').findOne({ token: token });
    
    console.log('📋 Verification record found:', !!record);
    
    if (!record) {
      console.log('❌ Invalid verification token');
      return res.redirect(appUrl + '/#login?verified=invalid');
    }
    
    if (record.used) {
      console.log('⚠️ Token already used');
      return res.redirect(appUrl + '/#login?verified=already');
    }
    
    if (record.expiresAt && record.expiresAt < new Date()) {
      console.log('⏰ Token expired');
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
      return res.redirect(appUrl + '/#login?verified=usernotfound');
    }
    
    console.log('✅ Email verified successfully for userId:', userId);
    
    await database.collection('email_verifications').updateOne(
      { _id: record._id },
      { $set: { used: true, usedAt: new Date() } }
    );
    
    // Redirect to login with success message
    res.redirect(appUrl + '/#login?verified=success');
  } catch (err) {
    console.error('❌ Verification error:', err);
    res.redirect(appUrl + '/#login?verified=error');
  }
});

module.exports = router;
