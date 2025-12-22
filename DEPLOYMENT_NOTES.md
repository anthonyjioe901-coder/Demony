# Deployment Notes

## Render.com Authentication Prompt Issue

### Problem
When accessing the mobile app, you may encounter an "Authentication required" browser prompt with the message:
```
demony-web.onrender.com says
Authentication required
```

### Root Cause
This is **NOT** an issue with your application code. Render.com automatically adds HTTP Basic Authentication to:
- Preview deployments (non-production branches)
- Pull request preview environments
- Services that are being deployed for the first time

### Solutions

#### 1. Use Production URL (Recommended)
Ensure your mobile app is configured to use the production API URL:
```
https://demony-api.onrender.com/api
```

Not preview URLs like:
```
https://demony-api-pr-123.onrender.com/api  ❌
```

#### 2. Check Your Environment Variables
In `packages/mobile/` directory, ensure you have:

**`.env` (for development):**
```env
VITE_API_URL=http://localhost:3001/api
```

**`.env.production` (for production builds):**
```env
VITE_API_URL=https://demony-api.onrender.com/api
```

#### 3. Rebuild Mobile App
After updating environment variables:
```bash
cd packages/mobile
npm run build
npx cap sync
```

#### 4. Disable Preview Authentication in Render (Optional)
If you control the Render deployment:
1. Log in to Render dashboard
2. Go to Service Settings
3. Navigate to "Preview Environments"
4. Toggle off "Require Authentication"

### Production Deployment Checklist

- [ ] Production URL is not password-protected
- [ ] Mobile app uses production API URL in `.env.production`
- [ ] CORS is configured to allow your domain
- [ ] JWT_SECRET is set in production environment
- [ ] Database connection string is configured

### Testing
To verify the issue is resolved:
1. Open mobile app on device/emulator
2. Try to login
3. Should connect without authentication prompt

### Environment URLs
- **Web Frontend:** https://demony-web.onrender.com
- **Backend API:** https://demony-api.onrender.com/api
- **Local Dev Backend:** http://localhost:3001/api
- **Local Dev Frontend:** http://localhost:5173

## Additional Notes

- Preview deployments are useful for testing but should not be used in production
- Always use the main production URL for released apps
- Preview authentication credentials (if needed) can be found in Render dashboard under the preview deployment details