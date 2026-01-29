# Keep Your Render Backend Alive (Free Tier)

Your Render free tier backend sleeps after 15 minutes of inactivity. Here's how to keep it awake 24/7 for **FREE**:

## 🚀 Quick Solution: Use cron-job.org (Recommended)

This is the easiest and most reliable free solution:

1. **Go to**: https://cron-job.org (free account, no credit card needed)

2. **Create an account** (or sign in with Google)

3. **Create a new cron job**:
   - **Title**: `Demony API Keep-Alive`
   - **URL**: `https://demony-api.onrender.com/health`
   - **Schedule**: Every 14 minutes
     - Select "Every 14 minutes" or use custom: `*/14 * * * *`
   - **Request Method**: GET
   - **Enable job**: Yes

4. **Save** - That's it! Your backend will stay awake forever.

---

## 🔧 Alternative: UptimeRobot (Also Free)

1. Go to: https://uptimerobot.com
2. Create free account
3. Add new monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Demony API
   - **URL**: `https://demony-api.onrender.com/health`
   - **Monitoring Interval**: 5 minutes (free tier minimum)

---

## 📋 What These Services Do

- They send a simple HTTP request to your `/health` endpoint every few minutes
- This keeps your Render service "active" so it never goes to sleep
- Both services are 100% free with generous limits

---

## ✅ Your Backend Endpoints

| Endpoint | Purpose |
|----------|---------|
| `https://demony-api.onrender.com/` | Main API root |
| `https://demony-api.onrender.com/health` | Health check (use this for keep-alive) |

---

## 🔄 Built-in Keep-Alive (After Git Push)

Your code also has a built-in self-ping mechanism that activates in production.
Once you push the latest code to GitHub, the backend will:
- Automatically ping itself every 14 minutes
- Log keep-alive status in the console

To push the code, fix your Git permissions:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/Demony.git
# or
git push origin main --force
```

---

## 💡 Pro Tip

Use **both** the external cron service AND the built-in keep-alive for maximum reliability.
If one fails, the other keeps your backend running!
