// Demony Backend Server - Pure JavaScript + C++ Native Addon
var express = require('express');
var cors = require('cors');
var dotenv = require('dotenv');

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
var allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://demony-web.onrender.com',
  process.env.WEB_URL,
  process.env.MOBILE_URL
].filter(Boolean);

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
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for file uploads

// Import routes
var authRoutes = require('./routes/auth.js');
var projectRoutes = require('./routes/projects.js');
var investmentRoutes = require('./routes/investments.js');
var portfolioRoutes = require('./routes/portfolio.js');
var performanceRoutes = require('./routes/performance.js');
var adminRoutes = require('./routes/admin.js');
var withdrawalRoutes = require('./routes/withdrawals.js');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/withdrawals', withdrawalRoutes);

// Root endpoint
app.get('/', function(req, res) {
  res.json({ 
    name: 'Demony API',
    version: '0.1.0',
    nativeAddon: nativeAddon !== null
  });
});

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

app.listen(port, function() {
  console.log('Demony API server running on port ' + port);
});

module.exports = { app: app, nativeAddon: nativeAddon };
