// Upload routes - Image handling with base64
var express = require('express');
var authenticateToken = require('../middleware/auth');
var router = express.Router();
var fs = require('fs');
var path = require('path');

// Ensure uploads directory exists
var uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload image as base64
router.post('/image', authenticateToken, async function(req, res) {
  try {
    var imageData = req.body.image; // base64 string
    var filename = req.body.filename || 'image';
    
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Validate file size (max 5MB for base64 data, which is ~3.75MB decoded)
    var MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5MB base64
    if (imageData.length > MAX_BASE64_SIZE) {
      return res.status(400).json({ error: 'Image too large. Maximum size is 5MB.' });
    }
    
    // Handle base64 data URL format
    var base64Data = imageData;
    var extension = 'png';
    
    // Validate allowed image types
    var ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    
    if (imageData.startsWith('data:')) {
      // Validate MIME type
      var mimeMatch = imageData.match(/^data:(image\/\w+);base64,/);
      if (!mimeMatch) {
        return res.status(400).json({ error: 'Invalid image format. Only PNG, JPG, GIF, WEBP are allowed.' });
      }
      
      // Extract MIME type and data
      var matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        base64Data = matches[2];
      } else {
        base64Data = imageData.split(',')[1] || imageData;
      }
    }
    
    if (ALLOWED_EXTENSIONS.indexOf(extension) === -1) {
      return res.status(400).json({ error: 'Invalid image type. Only PNG, JPG, GIF, WEBP are allowed.' });
    }
    
    // Generate unique filename
    var uniqueFilename = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '.' + extension;
    var filePath = path.join(uploadsDir, uniqueFilename);
    
    // Save file
    fs.writeFileSync(filePath, base64Data, 'base64');
    
    // Return URL (relative to server)
    var imageUrl = '/uploads/' + uniqueFilename;
    
    // In production, you might want to upload to cloud storage (S3, Cloudinary, etc.)
    // and return the CDN URL instead
    
    // For Render deployment, we'll use a data URL approach for simplicity
    // since Render's filesystem is ephemeral
    var fullDataUrl = 'data:image/' + extension + ';base64,' + base64Data;
    
    res.json({
      success: true,
      url: imageUrl,
      dataUrl: fullDataUrl, // Use this for display since Render doesn't persist files
      filename: uniqueFilename
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Serve uploaded images
router.get('/image/:filename', function(req, res) {
  // SEC-07: Sanitize filename to prevent path traversal attacks
  var filename = path.basename(req.params.filename);
  var filePath = path.join(uploadsDir, filename);
  
  // Double-check resolved path is within uploadsDir
  var resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(uploadsDir))) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

module.exports = router;
