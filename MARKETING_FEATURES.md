# Analytics & Referral System Setup Guide

## Summary of Changes

Two major marketing features have been implemented:

### 1. ✅ Referral System ("Give GH₵50, Get GH₵50")
A complete referral system that rewards both the referrer and the new user.

#### How It Works:
1. Every user gets a unique referral code (e.g., `DEM7A3B2C`)
2. Users can share their code via WhatsApp, Twitter, Facebook, or copy the link
3. When a new user signs up using the referral link (`?ref=DEM7A3B2C`)
4. The referral is tracked as "pending"
5. When the new user makes their **first investment of GH₵100+**, both parties receive **GH₵50** bonus in their wallets

#### Location in App:
- **Portfolio Page** - Prominent referral widget at the top with:
  - Referral code display
  - Copy button
  - WhatsApp, Twitter, Facebook share buttons
  - Stats: Total referred, Completed, Earned

#### Project Page:
- Each project card now has a **share button (📤)** for easy social sharing

### 2. ✅ Analytics Tracking (Google Analytics + Facebook Pixel)

#### Setup Required:
You need to replace the placeholder IDs with your actual IDs:

**Google Analytics (GA4):**
- Open `packages/web/src/index.html`
- Find `G-XXXXXXXXXX` and replace with your GA4 Measurement ID
- Get your ID from: https://analytics.google.com → Admin → Data Streams

**Facebook Pixel:**
- Open `packages/web/src/index.html`
- Find `XXXXXXXXXXXXXXX` and replace with your Facebook Pixel ID
- Get your ID from: https://business.facebook.com/events_manager

Do the same for `packages/mobile/src/index.html`.

#### Events Being Tracked:

| Event | Description | GA4 Event | FB Pixel Event |
|-------|-------------|-----------|----------------|
| Signup | User creates account | `sign_up` | `CompleteRegistration` |
| Login | User logs in | `login` | - |
| Investment | User invests in project | `purchase` | `Purchase` |
| Deposit | User deposits funds | `add_payment_info` | `AddPaymentInfo` |
| Share | User shares referral/project | `share` | - |
| View Project | User views project details | `view_item` | `ViewContent` |
| Start Investment | User begins checkout | `begin_checkout` | `InitiateCheckout` |

## Files Modified/Created:

### New Files:
- `packages/backend/src/routes/referrals.js` - Referral API endpoints
- `packages/web/src/js/analytics.js` - Analytics helper module

### Modified Files:
- `packages/backend/src/server.js` - Added referral routes
- `packages/backend/src/routes/investments.js` - Added referral completion trigger
- `packages/web/src/index.html` - Added GA4 and Facebook Pixel
- `packages/mobile/src/index.html` - Added GA4 and Facebook Pixel
- `packages/web/src/js/app.js` - Added referral code handling + analytics import
- `packages/web/src/js/api.js` - Added referral API methods
- `packages/web/src/js/pages/portfolio.js` - Added referral widget
- `packages/web/src/js/pages/projects.js` - Added share buttons

## Testing the Referral System:

1. Log in as a user
2. Go to Portfolio page
3. Copy your referral code/link
4. Open in incognito window or different browser
5. Sign up using the referral link
6. Make an investment of GH₵100 or more
7. Both users should receive GH₵50 in their wallets

## API Endpoints:

```
GET  /api/referrals/my-code         - Get current user's referral code
GET  /api/referrals/history         - Get referral history
GET  /api/referrals/validate/:code  - Validate a referral code
POST /api/referrals/track           - Track a new referral
GET  /api/referrals/leaderboard     - Get top referrers
```

## Configuration:

Referral bonus amounts are configured in `packages/backend/src/routes/referrals.js`:

```javascript
var REFERRAL_BONUS_REFERRER = 50; // GH₵50 for referrer
var REFERRAL_BONUS_REFEREE = 50;  // GH₵50 for new user
var MIN_INVESTMENT_FOR_BONUS = 100; // Minimum investment to trigger bonus
```
