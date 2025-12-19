# Render Deployment Guide

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Click the button above or follow the manual steps below.

---

## Manual Deployment

### 1. Create Render Account
Go to [render.com](https://render.com) and sign up.

### 2. Connect GitHub Repository
1. Push your code to GitHub
2. In Render Dashboard, click "New +"
3. Select "Blueprint"
4. Connect your GitHub repo
5. Render will detect `render.yaml` automatically

### 3. Configure Environment Variables

#### Backend Service (demony-api)
Set these in Render Dashboard > demony-api > Environment:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Auto-generated or set your own |
| `NODE_ENV` | `production` |

#### Web Service (demony-web)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://demony-api.onrender.com` |

### 4. Deploy
Click "Apply" to deploy all services.

---

## Individual Service Deployment

### Deploy Backend Only

1. New + > Web Service
2. Connect repo
3. Settings:
   - **Name**: demony-api
   - **Root Directory**: packages/backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Deploy Web Frontend Only

1. New + > Static Site
2. Connect repo
3. Settings:
   - **Name**: demony-web
   - **Root Directory**: packages/web
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

---

## Database Setup

### Option 1: Render PostgreSQL (Recommended)
1. New + > PostgreSQL
2. Name: demony-db
3. Copy the Internal Database URL
4. Paste into backend's `DATABASE_URL` env var

### Option 2: External PostgreSQL
Use any PostgreSQL provider:
- Neon (free tier)
- Supabase (free tier)
- Railway
- PlanetScale

---

## Custom Domain

### Backend API
1. Go to demony-api > Settings > Custom Domain
2. Add: `api.yourdomain.com`
3. Add CNAME record in your DNS:
   ```
   api.yourdomain.com -> demony-api.onrender.com
   ```

### Web Frontend
1. Go to demony-web > Settings > Custom Domain
2. Add: `yourdomain.com` and `www.yourdomain.com`
3. Add DNS records:
   ```
   yourdomain.com -> A record to Render IP
   www.yourdomain.com -> CNAME to demony-web.onrender.com
   ```

---

## CI/CD Auto-Deploy

Render automatically deploys when you push to main branch.

To disable auto-deploy:
1. Go to Service > Settings
2. Turn off "Auto-Deploy"

---

## Monitoring

### Health Checks
Backend has health check at `/` endpoint.

### Logs
View logs in Render Dashboard > Service > Logs

### Metrics
View CPU, Memory, and Bandwidth in Render Dashboard > Service > Metrics

---

## Scaling (Paid Plans)

### Upgrade Service
1. Go to Service > Settings
2. Change Plan (Starter, Standard, Pro)

### Add More Instances
On paid plans, you can scale horizontally.

---

## Troubleshooting

### Build Fails
- Check build logs
- Ensure all dependencies in package.json
- Verify Node version compatibility

### App Crashes
- Check runtime logs
- Verify environment variables are set
- Check DATABASE_URL is correct

### Slow Performance
- Free tier has cold starts (spins down after 15 min inactivity)
- Upgrade to paid plan for always-on

### CORS Issues
- Ensure backend CORS is configured for frontend URL
- Check `cors` middleware in server.js
