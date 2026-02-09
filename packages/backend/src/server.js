// Demony Backend Server - Pure JavaScript + C++ Native Addon
var express = require('express');
var cors = require('cors');
var dotenv = require('dotenv');
var helmet = require('helmet');
var noSqlSanitize = require('./middleware/sanitize');
var { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

dotenv.config();

var app = express();
var port = process.env.PORT || 3001;

// Try to load native C++ addon
var nativeAddon = null;
try {
  nativeAddon = require('../build/Release/demony_native.node');
  console.log('C++ native addon loaded successfully');
} catch (err) {
  console.warn('C++ native addon not available, using JS fallback');
  console.warn('Run "npm run build:cpp" to build the native addon');
}

// CORS configuration for production
// Parse comma-separated allowed origins from env
var envAllowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(function(origin) { return origin.trim(); })
  : [];

var allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://demony-web.onrender.com',
  'https://demony.vercel.app',
  process.env.WEB_URL,
  process.env.MOBILE_URL
].concat(envAllowedOrigins).filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      console.log('   Add it to ALLOWED_ORIGINS env variable');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security headers (free, no external service needed)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for now (frontend is separate)
}));

// ========== PAYSTACK WEBHOOK (must be BEFORE express.json()) ==========
// Paystack signs the raw body. If express.json() parses it first,
// re-serializing with JSON.stringify() may change key order/whitespace
// and break HMAC verification. Mount raw handler here.
var walletWebhookRouter = require('./routes/walletWebhook.js');
app.use('/api/wallet/webhook', walletWebhookRouter);

app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads

// NoSQL injection protection - strips $ operators from user input
app.use(noSqlSanitize);

// Global rate limiting
app.use('/api/', apiLimiter);

// Import routes
var authRoutes = require('./routes/auth.js');
var projectRoutes = require('./routes/projects.js');
var investmentRoutes = require('./routes/investments.js');
var portfolioRoutes = require('./routes/portfolio.js');
var performanceRoutes = require('./routes/performance.js');
var adminRoutes = require('./routes/admin.js');
var withdrawalRoutes = require('./routes/withdrawals.js');
var walletRoutes = require('./routes/wallet.js');
var uploadRoutes = require('./routes/upload.js');
var supportRoutes = require('./routes/support.js');
var referralRoutes = require('./routes/referrals.js');

// Use routes (auth gets stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/referrals', referralRoutes);

// Root endpoint
app.get('/', function(req, res) {
  res.json({ 
    name: 'Demony API',
    version: '0.1.0',
    nativeAddon: nativeAddon !== null
  });
});

// Health check endpoint for keep-alive pings
app.get('/health', function(req, res) {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// ========== KEEP-ALIVE MECHANISM ==========
// Pings itself every 14 minutes to prevent Render free tier from sleeping
var KEEP_ALIVE_URL = process.env.RENDER_EXTERNAL_URL || process.env.API_URL || 'https://demony-api.onrender.com';
var KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

function keepAlive() {
  var https = require('https');
  var http = require('http');
  var url = KEEP_ALIVE_URL + '/health';
  var client = url.startsWith('https') ? https : http;
  
  client.get(url, function(res) {
    console.log('[Keep-Alive] Ping successful at ' + new Date().toISOString() + ' - Status: ' + res.statusCode);
  }).on('error', function(err) {
    console.log('[Keep-Alive] Ping failed:', err.message);
  });
}

// Start keep-alive only in production
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  console.log('🔄 Keep-alive mechanism enabled - pinging every 14 minutes');
  console.log('   Target URL: ' + KEEP_ALIVE_URL);
  setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
  // Initial ping after 1 minute to confirm it's working
  setTimeout(keepAlive, 60000);
}

// Native addon test endpoint
app.get('/api/native-test', function(req, res) {
  if (nativeAddon) {
    var result = nativeAddon.calculateCompoundInterest(10000, 0.12, 5);
    res.json({ 
      success: true, 
      message: 'C++ addon working',
      testResult: result
    });
  } else {
    res.json({ 
      success: false, 
      message: 'C++ addon not loaded' 
    });
  }
});

// Connect to database, create indexes, then start server
var db = require('../../database/src/index');
var { createIndexes } = require('../../database/src/create-indexes');

db.connect().then(function() {
  console.log('📦 Database connected');
  // Create indexes in background (non-blocking, idempotent)
  createIndexes().catch(function(err) {
    console.error('Index creation warning:', err.message);
  });
}).catch(function(err) {
  console.error('Database connection failed:', err);
});

app.listen(port, function() {
  console.log('Demony API server running on port ' + port);
});

module.exports = { app: app, nativeAddon: nativeAddon };
