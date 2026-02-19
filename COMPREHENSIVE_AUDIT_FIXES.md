# Comprehensive Audit & Fix Report

## Summary

Full audit across **5 areas** (notification system, backend core, backend routes, web frontend, Android). **114 total issues** found, **40+ fixes applied** across all platforms.

---

## Session 1 Fixes (Notification System + Email Integration)

### Notification System (12 fixes)

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **CRIT** | `backend/services/email.js` | Added 3 new email templates: `broadcast`, `referralNotification`, `supportTicketReply` |
| 2 | **CRIT** | `backend/routes/referrals.js` | Fixed referral email — was passing object as template name (`sendEmail({to,subject,html})` → `sendEmail('referralNotification', email, data)`) |
| 3 | **CRIT** | `backend/routes/auth.js` | Fixed profile update MongoDB error — conflicting `$set` paths (`business` + `business.name`) |
| 4 | **CRIT** | `backend/routes/admin.js` | Fixed broadcast email — wrong `sendEmail` signature (user.email as templateName) |
| 5 | **HIGH** | `backend/routes/support.js` | Fixed support notification email — `email` → `userEmail` field name |
| 6 | **HIGH** | `backend/routes/walletWebhook.js` | Added missing notification + email for webhook deposit handler |
| 7 | **HIGH** | `backend/routes/wallet.js` | Added missing deposit confirmation email after verify |
| 8 | **HIGH** | `backend/routes/wallet.js` | Added withdrawal pending notification + email |
| 9 | **HIGH** | `backend/routes/admin.js` | Added ticket reply notification + email + `isStaff:true` flag |
| 10 | **HIGH** | `backend/routes/admin.js` | Added ticket resolve notification |
| 11 | **MED** | `backend/routes/auth.js` | Added welcome in-app notification on signup |
| 12 | **MED** | `backend/services/email.js` | Email disabled flag now auto-resets after 5 minutes (was permanent) |
| 13 | **MED** | `backend/services/notifications.js` | `notifyMultipleUsers` now sends per-user SSE unread count updates |
| 14 | **MED** | `backend/routes/notifications.js` | Added ObjectId validation on mark-read endpoint |
| 15 | **LOW** | `backend/routes/admin.js` | Fixed `$referredId` → `$refereeId` in admin referrals pipeline |

### Web Notification UI (3 fixes)

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **HIGH** | `web/js/notifications.js` | Fixed event listener leak — `_outsideClickHandler` now tracked and removed |
| 2 | **HIGH** | `web/js/notifications.js` | Added `_initialized` guard preventing duplicate SSE connections |
| 3 | **MED** | `web/js/notifications.js` | `destroyNotifications()` now resets `_initialized` flag |

---

## Session 2 Fixes (Current Session)

### Backend Critical/High Fixes

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **CRIT-04** | `backend/routes/admin.js` | Profit distribution now wrapped in MongoDB transaction — all wallet credits + distribution inserts + project update are atomic |
| 2 | **CRIT-05** | `backend/routes/admin.js` | Project completion now wrapped in MongoDB transaction — investment status + principal returns + transaction records + project status are atomic |
| 3 | **CRIT-05** | `backend/routes/admin.js` | Project cancellation now wrapped in MongoDB transaction — investment cancellation + refunds + transaction records + project cancellation are atomic |
| 4 | **HIGH-06** | `backend/routes/investments.js` | Investment verify (`/verify/:reference`) now sends INVESTMENT_CONFIRMED notification + investment email |
| 5 | **HIGH-07** | `backend/routes/investments.js` | Fixed ownership % calculation — now queries project `currentFunding` from DB instead of using user's own totals (was showing 100% for single investors) |
| 6 | **HIGH-08** | `backend/middleware/auth.js` | Auth middleware now includes `name` in `req.user` (was only userId/email/role) |
| 7 | **HIGH-12** | `backend/routes/admin.js` | Removed duplicate `POST /users/:id/verify-email` route (kept the more complete version with audit logging) |
| 8 | **HIGH-13** | `backend/routes/admin.js` | Added PROJECT_COMPLETED notifications for all investors on project completion |
| 9 | **HIGH-13** | `backend/routes/admin.js` | Added PROJECT_CANCELLED notifications for all investors on project cancellation |

### Backend Medium/Low Fixes

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **MED-07** | `backend/server.js` | Global `express.json({limit: '1mb'})` now skips `/api/upload` path, so the route-level 10MB limit works |
| 2 | **MED** | `backend/routes/support.js` | Fixed subject truncation mismatch — validation now matches DB storage limit (both 100 chars) |
| 3 | **MED** | `backend/routes/support.js` | Confirmation email now uses truncated `ticket.subject` (same as stored in DB) |
| 4 | **LOW** | `backend/routes/wallet.js` | Removed duplicate `accountName` validation (dead code: 200-char check after 100-char check) |
| 5 | **MED** | `backend/services/notifications.js` | Added `PROJECT_CANCELLED` notification type with display name and emoji |

### Android Critical Fixes

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **CRIT-1** | `android/.../NetworkModule.kt` | Disabled fake certificate pin that killed all production HTTPS requests. Added instructions for obtaining real pin. |
| 2 | **CRIT-2** | `android/app/build.gradle.kts` | Added clear documentation about debug keystore in release builds (requires real keystore before Play Store submission) |
| 3 | **CRIT-3** | `android/.../DemonyRepository.kt` | `safeApiCall` now returns `ApiException` with status code (was returning generic `Exception`, losing HTTP status) |
| 4 | **CRIT-4** | `android/.../AuthViewModel.kt` | `refreshUser()` now checks `ApiException.statusCode` instead of `retrofit2.HttpException` (which was dead code since `safeApiCall` never threw it) |
| 5 | **NEW** | `android/.../ApiException.kt` | Created `ApiException` class carrying HTTP status code for proper error propagation |

### Android High Fixes

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **HIGH-5** | `android/.../TokenManager.kt` | `clearAll()` now only removes auth keys (`jwt_token`, `user_data`), preserving user settings (dark mode, biometric, notifications) |
| 2 | **HIGH-6** | `android/AndroidManifest.xml` | Uncommented `POST_NOTIFICATIONS` permission (required for Android 13+ / API 33+) |
| 3 | **HIGH-8** | `android/.../NotificationsViewModel.kt` | `startPolling()` now called in `init{}` block — 30-second background polling was dead code |

### Web Frontend XSS Fixes

| # | Severity | File | Fix |
|---|----------|------|-----|
| 1 | **HIGH** | `web/js/utils.js` | `showNotification()` now escapes message with `escapeHtml()` — affected all pages |
| 2 | **CRIT** | `web/js/pages/admin.js` | Recent activity table: `userName`, `projectName`, `status` now escaped |
| 3 | **CRIT** | `web/js/pages/admin.js` | Investments table: `userName`, `projectName`, `status` now escaped; unsafe `onclick` string injection replaced with `escapeAttr()` |
| 4 | **HIGH** | `web/js/pages/admin.js` | Withdrawals table: `method`, `accountNumber`/`momoNumber`, `provider`, `status` now escaped |
| 5 | **HIGH** | `web/js/pages/admin.js` | Transactions table: `type`, `userId`, `status` now escaped |
| 6 | **HIGH** | `web/js/pages/admin.js` | Credit Wallet modal: `userName` now escaped |
| 7 | **HIGH** | `web/js/pages/admin.js` | Withdraw Investment modal: `userName` and `projectName` now escaped |
| 8 | **HIGH** | `web/js/pages/admin.js` | Complete Project modal: `projectName` now escaped |
| 9 | **HIGH** | `web/js/pages/admin.js` | Distribute Profit modal: `projectName` now escaped |
| 10 | **HIGH** | `web/js/pages/admin.js` | Projects grid `onclick` handlers: replaced unsafe `.replace(/'/g, "\\'")` with `escapeAttr()` |
| 11 | **MED** | `web/js/pages/admin.js` | KYC document URLs now escaped with `escapeAttr()` + added `rel="noopener"` |

---

## Known Issues (Not Fixed — Require Architectural Changes)

| Severity | Area | Issue | Recommendation |
|----------|------|-------|----------------|
| **MED** | Backend | Upload route uses disk storage — files lost on Render restarts | Migrate to Cloudinary, S3, or store in MongoDB GridFS |
| **HIGH** | Web | JWT in localStorage is XSS-accessible | Migrate to httpOnly cookies with SameSite flag |
| **MED** | Web | No CSRF protection on API calls | Add CSRF tokens (less critical with JWT in Authorization header) |
| **HIGH** | Android | SSE not supported — uses polling instead | Consider FCM push notifications for real-time updates |
| **MED** | Android | No runtime permission request for POST_NOTIFICATIONS | Add `ActivityCompat.requestPermissions()` at appropriate launch point |
| **CRIT** | Android | Release build uses debug keystore | Create dedicated release keystore before Play Store submission |

---

## Files Modified (This Session)

### Backend
- `packages/backend/src/server.js` — Upload JSON limit skip
- `packages/backend/src/middleware/auth.js` — Added name to req.user
- `packages/backend/src/routes/admin.js` — Transaction safety, duplicate route removal, project notifications
- `packages/backend/src/routes/investments.js` — Verify notification/email, ownership % fix
- `packages/backend/src/routes/wallet.js` — Removed duplicate validation
- `packages/backend/src/routes/support.js` — Subject truncation alignment
- `packages/backend/src/services/notifications.js` — Added PROJECT_CANCELLED type

### Android
- `packages/android/app/build.gradle.kts` — Signing config documentation
- `packages/android/app/src/main/AndroidManifest.xml` — POST_NOTIFICATIONS enabled
- `packages/android/app/src/main/java/com/demony/invest/data/api/NetworkModule.kt` — Cert pin disabled
- `packages/android/app/src/main/java/com/demony/invest/data/api/ApiException.kt` — NEW: Custom exception
- `packages/android/app/src/main/java/com/demony/invest/data/repository/DemonyRepository.kt` — ApiException propagation
- `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/AuthViewModel.kt` — Fixed error matching
- `packages/android/app/src/main/java/com/demony/invest/data/local/TokenManager.kt` — Selective clear
- `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/NotificationsViewModel.kt` — Start polling

### Web Frontend
- `packages/web/src/js/utils.js` — showNotification XSS fix
- `packages/web/src/js/pages/admin.js` — 11 XSS fixes across tables and modals
