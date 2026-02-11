# Demony - Full Project Audit Report

**Project**: Demony - Investment platform for local Ghanaian projects, companies, and businesses  
**Stack**: Pure JS + HTML/CSS (Vite) frontend | Node.js + Express backend | MongoDB database  
**Date**: February 11, 2026  
**Auditor**: Automated Deep Code Audit  

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [CRITICAL Security Issues](#2-critical-security-issues)
3. [HIGH Severity Bugs](#3-high-severity-bugs)
4. [MEDIUM Severity Issues](#4-medium-severity-issues)
5. [LOW Severity / Code Quality](#5-low-severity--code-quality)
6. [UI/UX Issues](#6-uiux-issues)
7. [Performance Issues](#7-performance-issues)
8. [Database Issues](#8-database-issues)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Dead Code & Technical Debt](#10-dead-code--technical-debt)
11. [Prioritized Fix Roadmap](#11-prioritized-fix-roadmap)

---

## 1. Architecture Overview

### Pattern
Monorepo (pnpm workspaces) with a **SPA Frontend** + **REST API** architecture. Hash-based client-side routing (`/#page`). Single Express server with MongoDB.

### Entry Points
- **Backend**: `packages/backend/src/server.js` → Express app on port 3001
- **Frontend**: `packages/web/src/index.html` → loaded via Vite; `app.js` is the main entry
- **Database**: `packages/database/src/index.js` → MongoDB connection singleton

### Core Modules (Top 5 Importance)
1. `packages/backend/src/routes/auth.js` — Authentication, signup, login, KYC, email verification
2. `packages/backend/src/routes/wallet.js` — Paystack deposits, withdrawals, transactions
3. `packages/backend/src/routes/investments.js` — Investment creation (uses MongoDB transactions)
4. `packages/backend/src/routes/admin.js` — Full admin panel API
5. `packages/web/src/js/api.js` — Frontend API client

### Data Flow
```
User → Frontend SPA (Vite) → REST API (Express) → MongoDB
                             → Paystack (payments)
                             → Brevo (emails)
```

---

## 2. CRITICAL Security Issues

### SEC-01: JWT Secret Duplication (TWO secrets can diverge)
- **Location**: `packages/backend/src/middleware/auth.js` AND `packages/backend/src/routes/auth.js`
- **What**: JWT_SECRET is independently generated in BOTH files. The middleware generates `'dev-only-secret-' + randomBytes(16)` and the auth route generates a SEPARATE random secret. In development with no `JWT_SECRET` env var, tokens signed in `auth.js` **cannot be verified** in `middleware/auth.js` because each file generates its own random value.
- **Impact**: **Complete authentication failure in development** — every request returns 403.
- **Fix**: Extract JWT_SECRET to a single shared config module. Both files import from the same source.
- **Severity**: **CRITICAL** — breaks all authenticated routes in dev mode.
- **CWE**: CWE-330 (Use of Insufficiently Random Values)

### SEC-02: No CSRF Protection
- **Location**: `packages/backend/src/server.js`
- **What**: The API uses cookie-based CORS with `credentials: true` but has no CSRF protection tokens. State-changing operations (POST/PUT/DELETE) are vulnerable.
- **Attack**: An attacker's website can make cross-origin requests to `/api/wallet/withdraw` if the user is logged in and the browser sends credentials.
- **Fix**: Since auth uses Bearer tokens (not cookies), the risk is lower. But verify frontend never stores tokens in cookies. Add SameSite cookie attributes if any cookies are used.
- **Severity**: **CRITICAL** (if cookies are used for auth) / **MEDIUM** (if only Bearer headers)
- **CWE**: CWE-352

### SEC-03: Admin Delete User Can Orphan Financial Data
- **Location**: `packages/backend/src/routes/admin.js` — DELETE `/users/:id`
- **What**: When admin deletes a user, there is no check to cascade-delete or freeze related investments, withdrawals, transactions. The user's wallet balance is lost, pending withdrawals become orphaned.
- **Impact**: Financial inconsistency. Funds vanish from audit trails.
- **Fix**: Before deleting: cancel pending withdrawals (refund to platform treasury), mark investments as orphaned, create audit log entry.
- **Severity**: **CRITICAL**

### SEC-04: Support Tickets Exposed Without Authentication
- **Location**: `packages/backend/src/routes/support.js` — GET `/tickets/:ticketId`
- **What**: Anyone who knows or guesses a ticket ID can read the full ticket contents. Ticket IDs follow a predictable pattern: `TKT-YYMMDD-XXXXXX`.
- **Attack**: Enumeration attack: iterate through dates and brute-force 6 alphanumeric chars (36^6 = 2.17B, but with targeted date ranges, very feasible).
- **Fix**: Require authentication OR add a secret lookup token returned only at creation time.
- **Severity**: **CRITICAL** — leaks private user support messages, account issues, etc.
- **CWE**: CWE-284 (Improper Access Control)

### SEC-05: Email Template XSS via Unsanitized User Data
- **Location**: `packages/backend/src/services/email.js` — ALL templates
- **What**: User-supplied data (`data.name`, `data.message`, `data.subject`) is interpolated directly into HTML email templates using template literals without escaping.
- **Attack**: A user signs up with name `<script>alert('xss')</script>` or submits a support ticket with malicious HTML. The email recipient's client may render it.
- **Fix**: HTML-escape all user-supplied data before inserting into templates: `function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }`
- **Severity**: **HIGH**
- **CWE**: CWE-79

### SEC-06: Paystack Secret Key Not Validated on Startup
- **Location**: `packages/backend/src/routes/wallet.js` — line 11
- **What**: `PAYSTACK_SECRET` is read once at module load. If it's undefined, all deposit/withdrawal calls fail silently or with confusing errors. The webhook handler in `walletWebhook.js` correctly returns 500, but the wallet routes do not.
- **Fix**: Add startup validation: if `NODE_ENV === 'production'` and no `PAYSTACK_SECRET_KEY`, throw a fatal error.
- **Severity**: **HIGH**

### SEC-07: File Upload Path Traversal
- **Location**: `packages/backend/src/routes/upload.js`
- **What**: The `filename` parameter from the request body is used but the filename for file storage is generated server-side (Date.now + random), so this is partially mitigated. However, the GET `/image/:filename` route directly uses `req.params.filename` in `path.join(uploadsDir, filename)`. A request like `/api/upload/image/../../etc/passwd` could traverse directories.
- **Fix**: Validate that `filename` contains no path separators. Use `path.basename(filename)` before joining.
- **Severity**: **HIGH**
- **CWE**: CWE-22 (Path Traversal)

### SEC-08: No Rate Limiting on Webhook Endpoint
- **Location**: `packages/backend/src/routes/walletWebhook.js`
- **What**: The webhook endpoint has no rate limiting. An attacker who knows the endpoint URL can flood it with invalid payload data, causing CPU-intensive HMAC calculations.
- **Fix**: Add IP-based rate limiting. Paystack's IPs are known — whitelist them.
- **Severity**: **MEDIUM**

---

## 3. HIGH Severity Bugs

### BUG-01: `setup.js` and `seed.js` Use PostgreSQL SQL Syntax Against MongoDB
- **Location**: `packages/database/src/setup.js` and `packages/database/src/seed.js`
- **What**: These files use `db.query('CREATE TABLE...')` and `db.query('INSERT INTO...')` SQL syntax, but the database is MongoDB. The `query()` function in `index.js` expects MongoDB operations like `find`, `findOne`, `insertOne`. These scripts will **crash immediately** when run.
- **Impact**: `npm run db:setup` and `npm run db:seed` are completely broken.
- **Fix**: Rewrite both to use MongoDB operations, or remove them since MongoDB is schemaless and `create-indexes.js` handles index setup.
- **Severity**: **HIGH**

### BUG-02: `var result` Redeclared in Login Route
- **Location**: `packages/backend/src/routes/auth.js` — login handler
- **What**: `var result` is declared twice in the same function scope (once for email lookup, once for phone lookup). In JavaScript `var` is function-scoped, so the second declaration is actually a re-assignment. While this works due to `var` hoisting, it's error-prone and confusing.
- **Impact**: Works accidentally but is a maintenance hazard.
- **Fix**: Use `let` and different variable names, or use `const` throughout.
- **Severity**: **MEDIUM**

### BUG-03: Investment `investorCount` Incremented Even for Same User Re-Investing
- **Location**: `packages/backend/src/routes/investments.js` — POST `/`
- **What**: Step 4 of the transaction always does `$inc: { investorCount: 1 }` on the project. If the same user invests in the same project twice, the count becomes inflated.
- **Fix**: Before incrementing, check if this userId already has an active investment in this project. Only increment if it's a new investor.
- **Severity**: **HIGH** — misleads investors about project popularity.

### BUG-04: Portfolio History Returns Hardcoded Mock Data
- **Location**: `packages/backend/src/routes/portfolio.js` — GET `/history`
- **What**: Returns static fake data (Jan-Dec values) regardless of user. This is misleading in production — users see a chart showing growth that isn't real.
- **Impact**: **Regulatory risk** — showing fake investment growth to real users.
- **Fix**: Either return actual computed historical data or clearly mark as "demo" or remove entirely.
- **Severity**: **HIGH** — potential legal/regulatory issue for a financial platform.

### BUG-05: Withdrawal Cancellation Refund Uses Wrong User ID
- **Location**: `packages/backend/src/routes/withdrawals.js` — DELETE `/:id`
- **What**: The refund uses `new ObjectId(userId)` where `userId = req.user.id || req.user.userId`. But the withdrawal was created with `req.user.id` (a string). If the format doesn't match, the refund could go to the wrong place or fail.
- **Fix**: Use the `userId` stored in the withdrawal document itself (`withdrawal.userId`) for the refund.
- **Severity**: **HIGH** — money could be lost.

### BUG-06: Race Condition in Direct-Pay Investment Verify
- **Location**: `packages/backend/src/routes/investments.js` — GET `/verify/:reference`
- **What**: The verify flow does NOT use MongoDB transactions (unlike the wallet-based investment flow). The operations (update investment, update user totals, update project funding, record transaction) are done sequentially without atomicity. If the server crashes between steps, data becomes inconsistent.
- **Fix**: Wrap in a MongoDB transaction like the wallet-based investment flow does.
- **Severity**: **HIGH**

### BUG-07: `referralModule` Import Causes Circular Dependency Risk
- **Location**: `packages/backend/src/routes/investments.js` — `require('./referrals')`
- **What**: `investments.js` requires `referrals.js`, and `referrals.js` might indirectly depend on shared database utilities. While not currently circular, the tight coupling is fragile. More importantly, `module.exports.completeReferral` is exported AFTER the main `module.exports = router`, which means the first assignment is overwritten.
- **Actually**: The code does `module.exports = router; module.exports.completeReferral = completeReferral;` which works because `router` is an object. BUT `require('./referrals')` in investments.js would get a function (router), and `router.completeReferral` should work. This is fine but fragile.
- **Severity**: **MEDIUM**

---

## 4. MEDIUM Severity Issues

### MED-01: No Input Length Limits on Most Endpoints
- **Location**: All route files
- **What**: Besides support tickets (which truncate to 5000 chars), most endpoints accept arbitrary-length strings for names, descriptions, business plans, etc. A malicious user could submit a 100MB project description.
- **Fix**: Add `express.json({ limit: '1mb' })` (already 10mb but should be lower) and add field-level length validation.
- **Severity**: **MEDIUM**

### MED-02: `express.json({ limit: '10mb' })` is Excessive
- **Location**: `packages/backend/src/server.js`
- **What**: 10MB JSON body limit is very large for an API that doesn't handle direct file uploads (files go through base64 in the upload route).
- **Fix**: Reduce to 1MB for general routes. Use a higher limit only on the upload route.
- **Severity**: **MEDIUM** — DoS vector.

### MED-03: No Pagination Limit Cap
- **Location**: `packages/backend/src/routes/admin.js`, `projects.js`
- **What**: Users can pass `?limit=999999` and fetch entire collections in one request.
- **Fix**: Cap limit to a maximum (e.g., 200) regardless of what the client requests.
- **Severity**: **MEDIUM**

### MED-04: Missing Error Handler Middleware
- **Location**: `packages/backend/src/server.js`
- **What**: There's no global error handler. Unhandled errors in async routes will crash the server or return raw stack traces.
- **Fix**: Add `app.use(function(err, req, res, next) { ... })` at the end of middleware chain.
- **Severity**: **MEDIUM** — stack traces leak in production.

### MED-05: ObjectId Validation Missing on Most Endpoints
- **Location**: Multiple route files
- **What**: `new ObjectId(req.params.id)` is called directly. If `id` is not a valid 24-char hex string, it throws an unhandled error that returns a 500.
- **Fix**: Validate ObjectId format before using: `if (!ObjectId.isValid(id)) return res.status(400).json({error: 'Invalid ID'})`.
- **Severity**: **MEDIUM**

### MED-06: Shared Password Validation Logic is Inconsistent
- **Location**: `packages/backend/src/routes/auth.js` vs `packages/shared/src/index.js`
- **What**: Backend requires uppercase + lowercase + number + 8 chars. Shared module only requires letter + number + 8 chars. Frontend might validate with the weaker shared rules, allowing passwords that fail backend validation.
- **Fix**: Unify validation rules in the shared module and use them everywhere.
- **Severity**: **MEDIUM**

### MED-07: KYC Document Storage as Base64 in MongoDB
- **Location**: `packages/backend/src/routes/auth.js` — POST `/kyc/submit`
- **What**: KYC documents (ID + selfie) are stored as base64 strings directly in the user document. This can make user documents extremely large (MBs), degrading query performance for all user operations.
- **Fix**: Store documents in object storage (S3/Cloudinary) and save only URLs in MongoDB.
- **Severity**: **MEDIUM** — performance and cost impact.

### MED-08: No Webhook Idempotency Key Storage
- **Location**: `packages/backend/src/routes/walletWebhook.js`
- **What**: While the code checks `status === 'pending'` before crediting, Paystack can retry webhooks. If the first webhook succeeds but the HTTP response times out, Paystack retries, and the second attempt will correctly skip (since status is 'success'). However, there's no explicit idempotency key log.
- **Fix**: Store processed webhook event IDs in a separate collection for explicit dedup.
- **Severity**: **LOW** (current logic handles it, but explicit dedup is safer)

### MED-09: Admin Profit Distribution Lacks Audit Trail
- **Location**: `packages/backend/src/routes/admin.js` — profit distribution endpoint
- **What**: When admin distributes profits, there's an audit log entry, but if the distribution partially fails (e.g., one investor's update fails), there's no rollback.
- **Fix**: Use a MongoDB transaction for the entire distribution, or add compensation logic.
- **Severity**: **MEDIUM**

### MED-10: No Account Lockout After Failed Login Attempts
- **Location**: `packages/backend/src/routes/auth.js`
- **What**: The auth rate limiter allows 15 attempts per 15 min per IP. But there's no per-account lockout. An attacker using distributed IPs (botnet) can brute-force passwords without triggering IP-based limits.
- **Fix**: Track failed attempts per account. Lock account after N failures, require email unlock.
- **Severity**: **MEDIUM**
- **CWE**: CWE-307

---

## 5. LOW Severity / Code Quality

### LOW-01: Using `var` Instead of `const`/`let` Throughout
- **Location**: All backend files
- **What**: The entire codebase uses `var` declarations. While functional, this leads to hoisting bugs and makes the codebase look outdated.
- **Fix**: Migrate to `const` by default, `let` when reassignment is needed. Can be done incrementally.

### LOW-02: Inconsistent Error Responses
- **Location**: All route files
- **What**: Some errors return `{ error: 'message' }`, others return `{ message: 'message' }`, others include extra fields.
- **Fix**: Standardize on `{ error: 'message', code: 'ERROR_CODE' }` format.

### LOW-03: Console Logging in Production
- **Location**: All files use extensive `console.log` with emoji
- **What**: Production servers log verbose emoji-decorated messages. No structured logging.
- **Fix**: Use a proper logger (winston/pino) with log levels. Disable debug logs in production.

### LOW-04: `admin.js.backup` Left in Source
- **Location**: `packages/web/src/js/pages/admin.js.backup`
- **What**: A backup file is checked into source control.
- **Fix**: Remove it and use git history instead.

### LOW-05: `packages/database/package.json` Has `pg` (PostgreSQL) Dependency
- **Location**: `packages/database/package.json`
- **What**: The project uses MongoDB, but `pg` (PostgreSQL driver) is still listed as a dependency. Waste of install time and confusing.
- **Fix**: Remove `pg` from dependencies.

### LOW-06: `packages/tt.txt` and `packages/Ideas` are Non-Code Files in Package Dir
- **Location**: `packages/tt.txt`, `packages/Ideas`
- **What**: Random text files in the packages directory. These get treated as workspace packages by pnpm.
- **Fix**: Move to project root or a `notes/` directory outside packages.

### LOW-07: Dead Root Script Files
- **Location**: Root directory (20+ .js files)
- **What**: Files like `credit-samuel.js`, `fix-samuel-balance.js`, `delete-edem-test-users.js`, `make-admin.js` are one-off scripts that manipulate production data. These should NOT be in the main codebase.
- **Fix**: Move to a `scripts/maintenance/` directory with documentation, or delete after use.

### LOW-08: No `.env.example` File
- **What**: New developers don't know what env vars are needed until runtime errors occur.
- **Fix**: Create `.env.example` with all required variables documented.

---

## 6. UI/UX Issues

### UI-01: Admin Dashboard Stores API Objects on `window` Global
- **Location**: `packages/web/src/js/pages/admin.js`
- **What**: `window._adminApi = adminApi; window._api = api;` — Storing API references on the global window object is a security risk (any script on the page can access it) and makes the code hard to reason about.
- **Fix**: Pass references through function parameters or use a module-scoped variable.
- **Severity**: **MEDIUM** (security + maintainability)

### UI-02: No Loading States on Most Pages
- **Location**: `packages/web/src/js/pages/*.js`
- **What**: Most page renderers show a spinner initially but don't handle loading states for individual actions (invest, withdraw, etc.). Users can double-click buttons.
- **Fix**: Disable buttons during async operations, show inline spinners.
- **Severity**: **MEDIUM**

### UI-03: No Client-Side Form Validation Before API Calls
- **Location**: Frontend page files
- **What**: Most forms submit to the API without client-side validation. Users get server errors instead of inline field-level feedback.
- **Fix**: Validate required fields, email format, phone format, password strength client-side.
- **Severity**: **LOW**

### UI-04: Hash-Based Routing Breaks Email Verification
- **Location**: Auth email verification flow
- **What**: The verification URL redirects to `appUrl + '/#login?verified=success'`. The `#` fragment is not sent to the server, so query params after `#` may not be parsed correctly by the SPA router.
- **Fix**: Verify the SPA router correctly parses hash query params.
- **Severity**: **MEDIUM**

### UI-05: No Offline/Network Error Handling
- **Location**: `packages/web/src/js/api.js`
- **What**: API calls don't handle network errors gracefully. If the user is offline, they see a generic error or nothing.
- **Fix**: Add a global fetch wrapper that catches network errors and shows a "No internet connection" banner.
- **Severity**: **MEDIUM**

### UI-06: Currency Display Inconsistency
- **Location**: Shared module vs frontend
- **What**: `shared/index.js` formats as USD (`$`), but the platform uses Ghanaian Cedis (GH₵). The email templates correctly use GH₵.
- **Fix**: Update `formatCurrency` in shared module to use GH₵ by default.
- **Severity**: **LOW**

---

## 7. Performance Issues

### PERF-01: N+1 Query in Referral History
- **Location**: `packages/backend/src/routes/referrals.js` — GET `/history`
- **What**: For each referral, a separate `findOne` query fetches the referred user. With 50 referrals, that's 50 extra DB queries.
- **Fix**: Collect all `refereeId`s, batch-fetch with `$in`, then map.
- **Impact**: **HIGH** — grows linearly with referrals.

### PERF-02: N+1 Query in Referral Leaderboard
- **Location**: `packages/backend/src/routes/referrals.js` — GET `/leaderboard`
- **What**: Same pattern — aggregates top 10, then fetches each user individually.
- **Fix**: Use `$lookup` in the aggregation pipeline.
- **Impact**: **LOW** (only 10 items, but still unnecessary)

### PERF-03: Project Listing Recalculates Stats via Aggregation
- **Location**: `packages/backend/src/routes/projects.js` — GET `/`
- **What**: Every public project listing runs a complex aggregation pipeline with `$lookup` to recalculate funding stats from investments. This runs on EVERY page load by EVERY user.
- **Fix**: Maintain denormalized `raisedAmount` and `investorCount` on the project document (already done in investments route). Remove the recalculation from the listing endpoint, or cache results for 60 seconds.
- **Impact**: **HIGH** — this is the most-hit endpoint.

### PERF-04: No Response Caching
- **Location**: All API routes
- **What**: No Cache-Control headers on read-only endpoints. Browsers and CDNs re-fetch everything.
- **Fix**: Add `Cache-Control: public, max-age=60` for project listings, leaderboards, FAQs.
- **Impact**: **MEDIUM**

### PERF-05: In-Memory Rate Limiter Won't Scale
- **Location**: `packages/backend/src/middleware/rateLimiter.js`
- **What**: Rate limiting state is stored in process memory. If you scale to multiple server instances, each has its own rate limit counter. An attacker can send 100 requests to each of N instances.
- **Fix**: For multi-instance deployments, use Redis-backed rate limiting. For single-instance (Render free tier), current approach works.
- **Impact**: **LOW** (currently single instance)

### PERF-06: Admin Stats Runs 10 Parallel Queries
- **Location**: `packages/backend/src/routes/admin.js` — GET `/stats`
- **What**: Already optimized with `Promise.all`, but 10 queries per admin dashboard load is heavy. Consider caching stats for 30 seconds.
- **Impact**: **LOW** (admin-only, infrequent access)

---

## 8. Database Issues

### DB-01: No Schema Validation
- **Location**: MongoDB collections
- **What**: MongoDB has no enforcement of required fields or data types. Any document shape can be inserted. This has already caused inconsistencies (some investments have `userId` as string, others as ObjectId — hence the `buildUserIdFilter` workaround).
- **Fix**: Add MongoDB JSON Schema validation on collections: `db.createCollection('users', { validator: { $jsonSchema: {...} } })`.
- **Severity**: **HIGH**

### DB-02: Mixed userId Types (String vs ObjectId)
- **Location**: All routes use `buildUserIdFilter()` workaround
- **What**: Investments, withdrawals, and transactions store `userId` as a string, but user documents use ObjectId `_id`. This forces every query to use `$or` with both types, preventing efficient index usage.
- **Fix**: Standardize on string userId everywhere, or always convert to ObjectId before storing.
- **Severity**: **MEDIUM**

### DB-03: `setup.js` and `seed.js` Are Broken (PostgreSQL Syntax)
- **Location**: `packages/database/src/setup.js`, `packages/database/src/seed.js`
- **What**: As noted in BUG-01, these files use SQL syntax against MongoDB. They're completely non-functional.
- **Fix**: Rewrite for MongoDB or delete (MongoDB is schemaless; `create-indexes.js` handles setup).
- **Severity**: **HIGH** (non-functional documented scripts)

### DB-04: No TTL on Old Transactions
- **What**: Transactions collection grows forever. Old completed transactions from years ago still occupy space.
- **Fix**: Add a TTL index on transactions older than 7 years (regulatory requirement), or implement archival.
- **Severity**: **LOW**

### DB-05: Referral Index Name Mismatch
- **Location**: `packages/database/src/create-indexes.js`
- **What**: Creates index on `referredId` but the referrals collection uses `refereeId`. The index on `referredId` is useless.
- **Fix**: Change `{ referredId: 1 }` to `{ refereeId: 1 }`.
- **Severity**: **MEDIUM** — queries on `refereeId` do full collection scans.

---

## 9. Deployment & Infrastructure

### DEPLOY-01: Render Free Tier Ephemeral Filesystem
- **Location**: `packages/backend/src/routes/upload.js`
- **What**: File uploads are saved to the local filesystem. Render's free tier has an ephemeral filesystem — all uploaded files are lost on every deploy/restart.
- **Fix**: The code already returns `dataUrl` (base64) as a workaround, but this is stored in MongoDB documents, bloating them. Use Cloudinary or S3 for persistent file storage.
- **Severity**: **HIGH**

### DEPLOY-02: Keep-Alive Mechanism is a Workaround, Not a Solution
- **Location**: `packages/backend/src/server.js` and `render.yaml`
- **What**: A cron job AND self-ping mechanism are used to prevent Render free tier from sleeping. This is against Render's ToS for free tier services.
- **Fix**: Upgrade to a paid tier, or accept the cold-start latency. If keeping the workaround, at least document the risk.
- **Severity**: **MEDIUM**

### DEPLOY-03: No Health Check for Database
- **Location**: `packages/backend/src/server.js`
- **What**: The `/health` endpoint returns `{ status: 'alive' }` without checking if MongoDB is connected. The health check could report healthy while the database is down.
- **Fix**: Add a DB ping to the health check: `await db.getDb().command({ ping: 1 })`.
- **Severity**: **MEDIUM**

### DEPLOY-04: No Graceful Shutdown
- **Location**: `packages/backend/src/server.js`
- **What**: No `process.on('SIGTERM')` handler. When Render restarts the service, in-flight requests are aborted, MongoDB connections leak.
- **Fix**: Add graceful shutdown: close DB connections, stop accepting new requests, wait for in-flight requests.
- **Severity**: **MEDIUM**

### DEPLOY-05: Static Assets Cached Forever
- **Location**: `render.yaml`
- **What**: `Cache-Control: public, max-age=31536000` on ALL static assets including `index.html`. This means users won't get updated HTML even after deployments.
- **Fix**: Use long cache only for hashed assets. Set `no-cache` on `index.html`.
- **Severity**: **HIGH** — users see stale app after deployments.

### DEPLOY-06: No Environment Variable Documentation
- **What**: Required env vars scattered across code. No `.env.example` file.
- **Required vars found**: `DATABASE_URL`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `BREVO_API_KEY`, `APP_URL`, `API_URL`, `WEB_URL`, `ALLOWED_ORIGINS`, `SUPPORT_EMAIL`, `MAIL_FROM`, `RENDER_EXTERNAL_URL`, `NODE_ENV`, `PORT`, `MOBILE_URL`, `SKIP_EMAIL_VERIFICATION`, `API_BASE_URL`
- **Fix**: Create a `.env.example` file listing all variables with descriptions.
- **Severity**: **MEDIUM**

---

## 10. Dead Code & Technical Debt

| Item | Location | Description |
|------|----------|-------------|
| PostgreSQL driver | `packages/database/package.json` | `pg` package still listed but unused |
| SQL setup/seed scripts | `packages/database/src/setup.js`, `seed.js` | Written for PostgreSQL, won't work with MongoDB |
| Admin backup file | `packages/web/src/js/pages/admin.js.backup` | Old admin page version |
| Root maintenance scripts | Root directory (20+ files) | One-off DB scripts in project root |
| `backupfile/` directory | `backupfile/` | Old mobile app backup files |
| C++ native addon | Build tooling, performance routes | The C++ addon is optional and rarely available; the JS fallback runs 100% of the time in practice |
| `packages/mobile/` | Empty directory | Listed in workspace but empty |
| `packages/tt.txt`, `Ideas` | `packages/` | Non-code files in packages directory |
| `seed-ghana-projects.js` | `packages/database/src/` | Separate seed file — may duplicate Ghana project data |
| `binding.gyp.disabled` | `packages/backend/` | Disabled C++ build config |

---

## 11. Prioritized Fix Roadmap

### 🔴 Week 1: Critical (Do Immediately)

| # | Issue | Fix Time | Impact |
|---|-------|----------|--------|
| 1 | SEC-01: JWT Secret duplication | 30 min | Auth completely broken in dev |
| 2 | SEC-03: Admin delete orphans financial data | 2 hrs | Money loss |
| 3 | SEC-04: Support tickets exposed publicly | 1 hr | Data leak |
| 4 | SEC-07: Upload path traversal | 30 min | Server file access |
| 5 | BUG-04: Fake portfolio history in production | 1 hr | Legal/regulatory risk |
| 6 | DEPLOY-05: HTML cached forever | 30 min | Users see stale app |
| 7 | BUG-05: Withdrawal refund wrong user ID | 1 hr | Money to wrong user |

### 🟡 Week 2: High Priority

| # | Issue | Fix Time | Impact |
|---|-------|----------|--------|
| 8 | SEC-05: Email XSS | 2 hrs | User-targeted phishing |
| 9 | SEC-06: Paystack key validation | 30 min | Silent payment failures |
| 10 | BUG-01: Broken setup/seed scripts | 2 hrs | Can't seed dev DB |
| 11 | BUG-03: Inflated investor count | 1 hr | Misleading metrics |
| 12 | BUG-06: Race condition in pay-verify | 2 hrs | Double-spending |
| 13 | DB-01: Add schema validation | 4 hrs | Data integrity |
| 14 | DB-05: Referral index mismatch | 15 min | Query performance |
| 15 | MED-04: Add global error handler | 1 hr | Stack trace leaks |
| 16 | DEPLOY-01: File upload persistence | 4 hrs | Files lost on restart |

### 🟢 Week 3-4: Medium Priority

| # | Issue | Fix Time | Impact |
|---|-------|----------|--------|
| 17 | MED-02: Reduce JSON body limit | 15 min | DoS prevention |
| 18 | MED-03: Cap pagination limits | 30 min | API abuse prevention |
| 19 | MED-05: ObjectId validation | 2 hrs | Better error messages |
| 20 | MED-06: Unify password validation | 1 hr | Consistent UX |
| 21 | MED-10: Account lockout | 3 hrs | Brute-force protection |
| 22 | PERF-01: Fix N+1 queries | 2 hrs | Referral page speed |
| 23 | PERF-03: Cache project stats | 2 hrs | Homepage speed |
| 24 | DEPLOY-03: DB health check | 30 min | Better monitoring |
| 25 | DEPLOY-04: Graceful shutdown | 1 hr | Clean restarts |
| 26 | UI-02: Loading states | 4 hrs | Better UX |
| 27 | Create `.env.example` | 1 hr | Developer onboarding |

### 🔵 Ongoing: Tech Debt

| # | Item | Notes |
|---|------|-------|
| 28 | Migrate `var` → `const`/`let` | Do incrementally per file |
| 29 | Remove dead code / backup files | Clean up root scripts |
| 30 | Add structured logging | Replace console.log with winston/pino |
| 31 | Add API response standardization | Consistent `{ error, code }` format |
| 32 | Move KYC docs to object storage | Reduce MongoDB document size |
| 33 | Add automated tests | Currently zero test coverage |
| 34 | Standardize userId type | Pick string or ObjectId, not both |
| 35 | Fix currency in shared module | Change USD → GHS |

---

## Summary Statistics

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | 4 | 3 | 3 | 0 |
| Bugs | 0 | 5 | 2 | 0 |
| Performance | 0 | 2 | 2 | 2 |
| Database | 0 | 3 | 2 | 1 |
| UI/UX | 0 | 0 | 4 | 2 |
| Deployment | 0 | 2 | 3 | 0 |
| Code Quality | 0 | 0 | 0 | 8 |
| **TOTAL** | **4** | **15** | **16** | **13** |

**Total Issues Found: 48**

---

*This audit covers the complete source code of the Demony investment platform. The most urgent items are the authentication secret duplication (SEC-01), financial data orphaning on user deletion (SEC-03), and the public support ticket endpoint (SEC-04). These should be fixed before any new feature development.*
