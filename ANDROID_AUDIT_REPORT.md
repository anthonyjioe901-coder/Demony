# 🔍 DEMONY ANDROID APP — COMPREHENSIVE AUDIT REPORT

**Date:** June 2025  
**Scope:** Every screen, ViewModel, model, component, navigation, and API service in the Android app  
**Compared Against:** Web app (`packages/web/`) and Backend API (`packages/backend/`)

---

## EXECUTIVE SUMMARY

## REMEDIATION UPDATE (FEB 2026)

The following high-impact issues from the initial audit have now been fixed in code:

- **Settings Delete Account flow** now calls live API and logs user out on success.
- **Settings Change Password validation** now matches backend password policy (8+ chars, upper/lower/number).
- **Support ticket submission parity** fixed (valid backend categories, priority, required email).
- **Support "My Tickets"** now loads authenticated user's real tickets from backend (`GET /support/tickets/my`).
- **Onboarding risk wording** updated to remove absolute/guaranteed marketing claims.
- **Support FAQ parity** improved with in-app FAQ search and live backend system status display.
- **Referrals parity** improved with Top Referrers leaderboard section in Android.
- **Project Detail parity** improved with native project share action and backend-powered ROI calculation.
- **Portfolio parity** improved with Risk Level and Diversification Score cards from backend data.
- **Portfolio stat cards** now support drilldown navigation to Investments.
- **Referrals sharing parity** improved with WhatsApp, Twitter, and Facebook deep-link buttons.
- **Support ticket UX parity** improved with authenticated ticket detail modal and response thread viewing.
- **Portfolio referral parity** improved with qualification progress and locked/unlocked earnings widget.
- **Settings dead-action cleanup** applied: 2FA now renders as explicit non-clickable "Soon" info row instead of actionable-looking control.
- **Signup UX polish (Achieve-style guidance)** applied: step-based sectioning, welcoming setup guidance, and completion readiness indicator.
- **Support FAQ parity** further improved with richer multi-category FAQ coverage and category filtering.
- **Support contact config cleanup** applied by centralizing contact endpoints used by email/phone/WhatsApp actions.
- **Referrals metrics parity** improved with Pending Rewards display alongside total referrals and earned rewards.
- **Login legal UX parity** improved by opening hosted Terms and Privacy pages instead of inline hardcoded legal dialogs.

### Newly Added Endpoint

- `GET /api/support/tickets/my` (authenticated): returns current user's support tickets ordered by newest first.

### Remaining Priority Gaps (next pass)

- Device-level runtime verification on physical Android phone (adb environment still required).
- Achieve-style registration/onboarding UX polish beyond copy/legal hardening.
- Remaining parity features from initial list (ROI calculator UI, referrals leaderboard UI, support FAQ search depth, portfolio parity widgets).

| Priority | Count |
|----------|-------|
| 🔴 CRITICAL | 7 |
| 🟠 HIGH | 14 |
| 🟡 MEDIUM | 18 |
| 🔵 LOW | 10 |
| **TOTAL** | **49** |

**Overall Assessment:** The Android app is a solid Jetpack Compose implementation with working auth, wallet (Paystack), investments, and KYC flows. However, there are **7 critical bugs** (broken features, hardcoded data, missing backend endpoints), **14 high-priority gaps** vs the web app, and numerous medium/low polish items.

---

## 🔴 CRITICAL ISSUES

### C-1. SignupScreen — Phone Marked "Optional" but Backend Requires It
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/auth/SignupScreen.kt` **Line 300**
- **What's wrong:** Label says `"Phone Number (Optional)"` but the backend (`auth.js` line 62-63) returns `400: "Phone number is required"` if phone is empty.
- **Impact:** **Signup will FAIL** for any user who skips the phone field.
- **Fix:** Change label to `"Phone Number *"` and add validation that phone is non-empty before calling signup API.

### C-2. SettingsScreen — Change Password Is a Stub / TODO
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/SettingsViewModel.kt`
- **What's wrong:** `changePassword()` function only shows a toast `"Password change feature coming soon"` — it never calls any API. The web app (`settings.js` line 134) fully implements change password via `POST /auth/change-password`.
- **Backend gap:** The backend `auth.js` has **NO** `/auth/change-password` route at all (grep returned 0 results). Neither platform can actually change passwords through the API.
- **Impact:** Users **cannot change their password** on either platform. This is a security concern.
- **Fix:** Create `POST /auth/change-password` backend route, then implement in SettingsViewModel.

### C-3. SettingsScreen — Delete Account Is a Stub
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/settings/SettingsScreen.kt`
- **What's wrong:** Delete Account button shows toast `"Coming soon"`. Web app (`settings.js` line 194) calls `DELETE /auth/delete-account`, but this route **does not exist** in the backend either.
- **Impact:** Users **cannot delete their account** — potential GDPR/data privacy violation.
- **Fix:** Create `DELETE /auth/delete-account` backend route, then implement in Android.

### C-4. SupportScreen — "My Tickets" Tab Never Loads Existing Tickets
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt`
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/SupportViewModel.kt`
- **What's wrong:** SupportViewModel only has `submitTicket()`. There is **no function to fetch existing tickets**. The "My Tickets" tab always shows the empty state `"No tickets yet"`.
- **Impact:** Users submit tickets but can **never see their ticket status or history**.
- **Fix:** Add `GET /support/tickets` API call in SupportViewModel and display results in the My Tickets tab.

### C-5. ProjectsScreen — Filter/Sort Never Applied to Data
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectsScreen.kt`
- **What's wrong:** The sort/filter bottom sheet has `selectedSortBy`, `minReturn`, `maxReturn` as local `remember` state variables, but **they are never passed to the ViewModel or used to filter/sort the project list**. The "Apply Filters" button just closes the sheet.
- **Impact:** Users think they're filtering but see the same unfiltered list.
- **Fix:** Pass filter/sort params to `ProjectsViewModel.loadProjects()` and apply them in the API query or client-side.

### C-6. HomeScreen — Notifications Are 100% Hardcoded
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/home/HomeScreen.kt` **Lines ~44-49**
- **What's wrong:** Notification list contains static sample data (`"Welcome to Demony!"`, `"New project available"`, `"Your deposit was successful"`). These are never fetched from any API.
- **Impact:** Users see fake notifications that don't reflect real activity. Misleading UX.
- **Fix:** Either fetch real notifications from a backend endpoint or remove the notification feature until it's backed by real data.

### C-7. WalletScreen — Withdrawal Doesn't Await Result
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/wallet/WalletScreen.kt` **Lines ~858-870**
- **What's wrong:** The withdrawal confirm button calls `viewModel.requestWithdrawal(...)` and then **immediately calls `onSuccess()`** without waiting for the API response. If the withdrawal fails, the user still sees success.
- **Impact:** Users may think withdrawal succeeded when it actually failed.
- **Fix:** Await the ViewModel result or observe a success state before calling `onSuccess()`.

---

## 🟠 HIGH PRIORITY ISSUES

### H-1. ProjectDetailScreen — Missing ROI Calculator
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectDetailScreen.kt`
- **Web comparison:** Web (`projects.js` lines 425-600) has a full ROI Calculator modal that calls `POST /projects/:id/calculate-returns` with pessimistic/optimistic/worst-case scenarios.
- **Android:** The API endpoint exists in `DemonyApiService.kt` line 48 (`calculateReturns`), but **no screen ever calls it**. No calculator UI exists.
- **Impact:** Key investment decision tool missing on Android.
- **Fix:** Add an ROI Calculator dialog in ProjectDetailScreen that calls `calculateReturns()`.

### H-2. ProjectDetailScreen — Missing Share Project
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectDetailScreen.kt`
- **Web comparison:** Web (`projects.js` lines 601-656) has a Share modal with WhatsApp, Twitter, Facebook, and Copy Link buttons.
- **Android:** No share functionality exists on the project detail page.
- **Fix:** Add a share button that uses Android's native share intent (like ReferralsScreen already does).

### H-3. ReferralsScreen — Missing Leaderboard
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/referrals/ReferralsScreen.kt`
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/ReferralsViewModel.kt`
- **Web comparison:** Web (`referrals.js` lines 186-230) loads and displays a "🏆 Top Referrers" leaderboard via `getReferralLeaderboard()`.
- **Android:** The API endpoint exists in `DemonyApiService.kt` line 122 (`getReferralLeaderboard`), but **ReferralsViewModel never calls it** and the screen has no leaderboard UI.
- **Fix:** Add leaderboard fetch to ViewModel and render a leaderboard section in ReferralsScreen.

### H-4. ReferralsScreen — Missing Social Share Buttons
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/referrals/ReferralsScreen.kt`
- **Web comparison:** Web has dedicated WhatsApp and Twitter share buttons with pre-crafted messages.
- **Android:** Has generic Android share intent and clipboard copy, but **no WhatsApp/Twitter/Facebook deep-link share buttons** for targeted sharing.
- **Fix:** Add WhatsApp (`wa.me`), Twitter (`twitter.com/intent/tweet`), and Facebook share buttons.

### H-5. ReferralsScreen — Missing "How It Works" Section
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/referrals/ReferralsScreen.kt`
- **Web comparison:** Web has a 3-step "How It Works" guide (Share Code → Friend Signs Up → First Investment).
- **Android:** No explanation of the referral program mechanics.
- **Fix:** Add a "How It Works" section with numbered steps.

### H-6. PortfolioScreen — Missing Referral Widget
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/portfolio/PortfolioScreen.kt`
- **Web comparison:** Web (`portfolio.js`) prominently displays a referral earnings widget showing locked vs unlocked earnings, qualification progress bar, and social share buttons.
- **Android:** No referral information on the Portfolio page at all.
- **Fix:** Add a referral earnings card with progress tracking.

### H-7. PortfolioScreen — Missing Risk Level & Diversification Score
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/portfolio/PortfolioScreen.kt`
- **Web comparison:** Web shows "Risk Level" and "Diversification Score" as computed metrics in the portfolio overview.
- **Android:** Only shows basic stats (total value, total invested, total earnings, number of investments).
- **Fix:** Compute and display risk level and diversification score based on portfolio composition.

### H-8. PortfolioScreen — Stat Cards Not Clickable
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/portfolio/PortfolioScreen.kt`
- **Web comparison:** Web stat cards are clickable and navigate to the investments page.
- **Android:** Stat cards are static, non-interactive.
- **Fix:** Make stat cards clickable with `navController.navigate(Screen.Investments.route)`.

### H-9. ProfileScreen — No Profile Edit Functionality
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/profile/ProfileScreen.kt`
- **Web comparison:** Web (`settings.js` lines 58-85) has an "Update Profile" form where users can change their name, phone, and business details via `PUT /auth/update-profile`.
- **Android:** Profile is read-only. Users cannot edit their name or phone number.
- **Backend gap:** `PUT /auth/update-profile` route **does not exist** in the backend. Web calls it but it would fail.
- **Fix:** Create the backend route, then add an edit profile dialog/screen on Android.

### H-10. SettingsScreen — 2FA Shows "Coming Soon" Chip
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/settings/SettingsScreen.kt`
- **What's wrong:** Two-Factor Authentication shows a "Coming soon" chip instead of a functional toggle.
- **Impact:** Security feature promised but not delivered.
- **Fix:** Either implement 2FA or remove the option to avoid confusion.

### H-11. HomeScreen — All Stats Are Hardcoded Marketing Numbers
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/home/HomeScreen.kt`
- **What's wrong:** Stats section shows:
  - `"GH₵500K+"` (hardcoded)
  - `"1,000+ Investors"` (hardcoded)
  - `totalProjects` falls back to `"10+"` if API returns 0
  - `"8-15%"` average returns (hardcoded)
- **Impact:** Users see misleading numbers not backed by real data.
- **Fix:** Fetch actual platform stats from a backend endpoint, or clearly label as marketing/aspiration.

### H-12. ProjectsScreen — Categories Are Hardcoded
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectsScreen.kt`
- **Web comparison:** Web (`projects.js` lines 15-35) dynamically fetches categories from the loaded projects using `Set` to extract unique categories.
- **Android:** Uses a hardcoded list: `"All", "Agriculture", "Technology", "Real Estate", "Manufacturing", "Retail"`.
- **Impact:** If new categories are added to projects, Android won't show them.
- **Fix:** Extract unique categories from the loaded projects list dynamically.

### H-13. ProjectsScreen — Search Is Client-Side Only
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectsScreen.kt`
- **Web comparison:** Web implements search with debounce and filters through the full project list.
- **Android:** Search filters only the **already-loaded** projects in memory. If only the first page is loaded (due to pagination), search won't find projects on later pages.
- **Fix:** Either load all projects before filtering, or send search query to the API.

### H-14. Web Has Notification Preferences API — Android Stores Locally Only
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/SettingsViewModel.kt`
- **Web comparison:** Web (`settings.js` line 169) saves notification preferences to the backend via `PUT /auth/notification-preferences`.
- **Android:** Notification toggle states are stored only in local DataStore — they never sync to the backend.
- **Backend gap:** `PUT /auth/notification-preferences` route **does not exist** in backend.
- **Fix:** Create the backend route and sync preferences from Android.

---

## 🟡 MEDIUM PRIORITY ISSUES

### M-1. SupportScreen — FAQs Are Hardcoded
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt`
- **What's wrong:** All FAQ questions and answers are defined inline in the Kotlin code (7 Q&A items).
- **Web comparison:** Web (`support.js` lines 4-110) has a much richer FAQ set organized by 6 categories (Getting Started, Deposits, Investments, Withdrawals, Account & Security, Business Owners) with ~20 Q&A pairs.
- **Fix:** At minimum, match the web's FAQ content. Ideally, load from an API.

### M-2. SupportScreen — Missing FAQ Search
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt`
- **Web comparison:** Web has a search input that filters FAQ items in real-time.
- **Android:** No search functionality for FAQs.
- **Fix:** Add a search TextField that filters the FAQ list.

### M-3. SupportScreen — Missing Priority Field in Ticket Form
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt`
- **Web comparison:** Web (`support.js` line 253) has a Priority dropdown (Low, Medium, High) in the ticket form.
- **Android:** Only has Subject and Message fields — no priority selection.
- **Fix:** Add a priority dropdown to the ticket form.

### M-4. SupportScreen — Missing "System Status" Display
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt`
- **Web comparison:** Web shows "System Status: All Systems Operational" at the bottom.
- **Android:** No system status indicator.
- **Fix:** Add a status card at the bottom of the Support page.

### M-5. WalletScreen — No Transaction Type Filter
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/wallet/WalletScreen.kt`
- **Web comparison:** Web wallet has filter tabs for transaction types (All, Deposits, Withdrawals, Investments, Profits).
- **Android:** Shows all transactions with no filtering capability.
- **Fix:** Add filter chips or tabs above the transaction list.

### M-6. InvestmentsScreen — No Navigation to Project Detail
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/investments/InvestmentsScreen.kt`
- **What's wrong:** `InvestmentCard` is not clickable. Users can see their investments but cannot tap to navigate to the project detail for more information.
- **Fix:** Add `onClick` handler that navigates to `ProjectDetail/{projectId}`.

### M-7. InvestmentsScreen — No Status Filter
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/investments/InvestmentsScreen.kt`
- **What's wrong:** All investments are shown in a single flat list with no way to filter by status (active, completed, etc.).
- **Fix:** Add filter chips for Active / Completed / All.

### M-8. ProfileScreen — KYC Status Not Refreshed After Submission
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/profile/ProfileScreen.kt`
- **What's wrong:** After completing the KYC flow, the KYC status display may still show "Pending" until the user manually navigates away and back or restarts the app.
- **Fix:** Call `authViewModel.refreshUser()` after KYC submission completes.

### M-9. OnboardingScreen — Hardcoded Marketing Claims
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/onboarding/OnboardingScreen.kt`
- **What's wrong:** Onboarding slides claim:
  - `"Invest from just GH₵20"` — but many projects have higher minimums
  - `"150+ verified projects"` — unverified claim
  - `"Up to 15% returns"` — could be misleading
  - `"100% secure transactions"` — no system is 100% secure
  - `"5% of their investments"` referral earnings — may not match actual referral policy
- **Impact:** Potentially misleading claims that could create legal liability.
- **Fix:** Review claims with business team and add appropriate disclaimers.

### M-10. LoginScreen — No Phone Login on Android
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/auth/LoginScreen.kt`
- **Backend:** `auth.js` login route (line 195) supports login by **either email or phone**.
- **Android:** Only has email + password fields. No option to log in with phone number.
- **Fix:** Add a toggle or tab to switch between email and phone login.

### M-11. BottomNavigationBar — Missing Portfolio Tab
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/components/BottomNavigationBar.kt`
- **What's wrong:** Bottom nav has: Home, Projects, Wallet, Investments, Profile. **Portfolio is missing** from the bottom nav — it's only accessible from Profile's quick actions.
- **Web comparison:** Web bottom nav includes Portfolio.
- **Fix:** Consider replacing one tab (e.g., Investments could be merged into Portfolio) or adding Portfolio as a tab.

### M-12. HomeScreen — "View All" on Featured Projects Doesn't Filter
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/home/HomeScreen.kt`
- **What's wrong:** The "View All" button next to "Featured Projects" navigates to the Projects screen but doesn't set a filter to show only featured projects.
- **Fix:** Pass a filter parameter or set the Projects screen to show featured first.

### M-13. ProjectCard — Potential Memory Issue with Base64 Images
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/components/ProjectCard.kt` **Lines 28-50**
- **What's wrong:** `Base64Image` decodes the full base64 string to a `Bitmap` in memory via `remember`. If there are many projects with large base64-encoded images, this could cause OOM crashes in a `LazyColumn`.
- **Fix:** Cache decoded bitmaps or convert to URL-based images on the backend. Consider using a custom Coil decoder for base64.

### M-14. WalletScreen — Min Withdrawal Validation Inconsistency
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/wallet/WalletScreen.kt` **Line ~855**
- **What's wrong:** Withdrawal validation checks `amount >= 20` (GH₵20 minimum), but the backend and web both reference a GH₵100 minimum for withdrawals.
- **Fix:** Change Android validation to match backend: `amount >= 100`.

### M-15. SettingsScreen — Biometric Auth Toggle Does Nothing
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/settings/SettingsScreen.kt`
- **What's wrong:** Biometric authentication toggle saves to DataStore but **no biometric prompt is ever shown** at login or for sensitive actions.
- **Fix:** Implement actual Android BiometricPrompt integration or remove the toggle.

### M-16. InvestmentsViewModel — Summary Calculated Client-Side
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/viewmodels/InvestmentsViewModel.kt`
- **What's wrong:** `totalInvested`, `totalEarnings`, `activeInvestments` are computed by iterating client-side investments. If pagination only loads the first page, summary is incomplete.
- **Fix:** Get summary stats from a dedicated API endpoint or ensure all investments are loaded.

### M-17. Web Has "Investments" Page in Projects — Android Does Not
- **File:** `packages/web/src/js/pages/projects.js`
- **Web comparison:** Web project cards have an "Investment Terms" section showing lock-in period and profit distribution inline.
- **Android:** `ProjectCard.kt` shows Duration and Returns but not lock-in period or profit distribution terms.
- **Fix:** Add lock-in and profit distribution info to ProjectCard or ProjectDetailScreen.

### M-18. Web Settings Has Update Profile Form — Android Only Shows Read-Only
- **File:** `packages/web/src/js/pages/settings.js` **Lines 51-84**
- **Web comparison:** Web settings lets users edit name, phone, business name inline.
- **Android:** Settings page has no profile editing capability (this is covered in ProfileScreen which is also read-only — see H-9).

---

## 🔵 LOW PRIORITY ISSUES

### L-1. HomeScreen — Referral Banner Not Personalized
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/home/HomeScreen.kt`
- **What's wrong:** Referral banner shows generic `"Give GH₵20, Get GH₵20"` text. Web portfolio page shows the user's actual referral code and earnings.
- **Fix:** Show user's referral code directly on the home page banner.

### L-2. SupportScreen — WhatsApp Link Hardcoded
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/support/SupportScreen.kt` **Line ~240**
- **What's wrong:** WhatsApp number is hardcoded as `"+233249251305"`. Should come from a config or backend.
- **Fix:** Centralize contact info in a config object.

### L-3. LoginScreen — Terms/Privacy Are Inline Dialogs
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/auth/LoginScreen.kt`
- **What's wrong:** Terms of Service and Privacy Policy are displayed as inline text dialogs with hardcoded legal text. Should link to actual hosted documents.
- **Fix:** Open a WebView or browser with the actual terms/privacy URL.

### L-4. ProjectCard — `getCategoryIcon()` May Not Cover All Categories
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/components/ProjectCard.kt`
- **What's wrong:** `getCategoryIcon()` function has a finite list of category-to-icon mappings. New categories from the backend would get a generic icon.
- **Fix:** Add a comprehensive fallback or use the category's first letter as a badge.

### L-5. ReferralsScreen — No Pending Rewards Display
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/referrals/ReferralsScreen.kt`
- **Web comparison:** Web shows separate "Pending Rewards" stat alongside Total Referrals and Total Earned.
- **Android:** Only shows Total Referrals and Total Earnings — no pending rewards.
- **Fix:** Add pending rewards to the stats section.

### L-6. WalletScreen — No Empty State for Transactions
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/wallet/WalletScreen.kt`
- **What's wrong:** When there are no transactions, the section is just blank with no helpful message.
- **Fix:** Add an empty state illustration/message like "No transactions yet".

### L-7. ProjectDetailScreen — Investment Dialog Lacks Projected Returns
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/projects/ProjectDetailScreen.kt`
- **Web comparison:** Web invest modal shows projected monthly/annual/total returns inline as user types an amount.
- **Android:** Investment dialog only has amount field and risk checkboxes — no projected returns preview.
- **Fix:** Add a real-time returns preview that calls `calculateReturns` as the user types.

### L-8. Dark Mode — No System Default Option
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/screens/settings/SettingsScreen.kt`
- **What's wrong:** Dark mode is a simple on/off toggle. Android convention is to offer "System default" as a third option.
- **Fix:** Add a 3-way selector: Light / Dark / System Default.

### L-9. Navigation — No Deep Link Support
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/navigation/Navigation.kt`
- **What's wrong:** No deep links are defined for any route. Push notifications or referral links can't open specific screens.
- **Fix:** Add `deepLinks` to route definitions, especially for project detail and referral pages.

### L-10. BottomNavigationBar — No Badge for Unread Items
- **File:** `packages/android/app/src/main/java/com/demony/invest/ui/components/BottomNavigationBar.kt`
- **What's wrong:** No notification badges on any tab (e.g., unread notifications count on Home, pending transactions on Wallet).
- **Fix:** Use Material3 `BadgedBox` to show notification counts.

---

## MISSING SCREENS / FEATURES COMPARISON

| Feature | Web ✅ | Android | Status |
|---------|--------|---------|--------|
| ROI Calculator | ✅ Full modal | ❌ Not built | **Missing** |
| Share Project | ✅ Social share modal | ❌ Not built | **Missing** |
| Change Password | ✅ Form (but no backend) | ❌ Stub only | **Both broken** |
| Delete Account | ✅ Form (but no backend) | ❌ Stub only | **Both broken** |
| Update Profile | ✅ Form (but no backend) | ❌ Not built | **Both broken** |
| Notification Prefs API | ✅ Form (but no backend) | ❌ Local only | **Both broken** |
| Referral Leaderboard | ✅ Full leaderboard | ❌ API exists, no UI | **Missing UI** |
| FAQ Search | ✅ Real-time filter | ❌ Not built | **Missing** |
| FAQ Categories (rich) | ✅ 6 categories, ~20 Q&A | ⚠️ 7 simple Q&A | **Incomplete** |
| Support Ticket Priority | ✅ Low/Medium/High | ❌ Not in form | **Missing** |
| View Existing Tickets | ⚠️ Not in web either | ❌ Not built | **Both missing** |
| Transaction Type Filter | ✅ Tabs for each type | ❌ Not built | **Missing** |
| Phone Login | ✅ Backend supports | ❌ Email only | **Missing** |
| Portfolio Risk Score | ✅ Shown | ❌ Not computed | **Missing** |
| Portfolio Diversification | ✅ Shown | ❌ Not computed | **Missing** |
| Referral Progress Bar | ✅ Qualification tracker | ❌ Not built | **Missing** |
| Social Share (referrals) | ✅ WA/Twitter buttons | ⚠️ Generic share only | **Incomplete** |
| 2FA | ❌ Not in web either | ⚠️ "Coming soon" | **Both missing** |
| Biometric Auth | ❌ N/A (web) | ⚠️ Toggle only, no impl | **Stub only** |

---

## BACKEND API GAPS AFFECTING BOTH PLATFORMS

These backend routes are called by the web but **do not exist** in `auth.js`:

| Missing Route | Web calls it? | Android calls it? |
|---|---|---|
| `POST /auth/change-password` | ✅ Yes | ❌ Stub |
| `DELETE /auth/delete-account` | ✅ Yes | ❌ Stub |
| `PUT /auth/update-profile` | ✅ Yes | ❌ N/A |
| `PUT /auth/notification-preferences` | ✅ Yes | ❌ N/A |

> **These web features silently fail** since the backend returns 404. Priority: create these routes.

---

## WHAT WORKS WELL ✅

1. **Authentication flow** — Login, Signup, Email Verification, Forgot Password all work
2. **Wallet / Paystack integration** — Deposit via WebView, withdrawal with bank/MoMo both functional
3. **KYC flow** — Multi-step ID + selfie upload with status tracking works
4. **Investment flow** — Risk acknowledgment checkboxes, wallet deduction, investment creation all work
5. **Project browsing** — Categories, pagination, featured projects, image handling (base64 + URL) all work
6. **Onboarding** — Clean 5-page pager with skip/get started flow
7. **Dark mode** — Properly persisted via DataStore and applied app-wide
8. **Error handling** — `DemonyRepository.safeApiCall()` provides user-friendly error messages for network failures
9. **Navigation** — Proper NavHost with auth state-based start destination
10. **Material3 theming** — Consistent use of Material Design 3 components throughout

---

## RECOMMENDED FIX ORDER

### Sprint 1 (Critical — Do First)
1. **C-1** Fix phone field required validation on signup
2. **C-5** Connect filter/sort to actual data in ProjectsScreen
3. **C-7** Await withdrawal API result before showing success
4. **C-4** Add fetch existing tickets in SupportViewModel
5. **C-6** Replace hardcoded notifications with real data or remove

### Sprint 2 (Critical Backend + High)
6. **C-2** Create `POST /auth/change-password` route + implement on Android
7. **C-3** Create `DELETE /auth/delete-account` route + implement on Android
8. **H-9** Create `PUT /auth/update-profile` route + add edit profile on Android
9. **H-1** Build ROI Calculator dialog on Android
10. **H-2** Add Share Project functionality

### Sprint 3 (High Priority Features)
11. **H-3** Add Referral Leaderboard
12. **H-4** Add social share buttons to Referrals
13. **H-5** Add "How It Works" section to Referrals
14. **H-6** Add referral widget to Portfolio
15. **H-7** Add risk/diversification to Portfolio
16. **H-11** Replace hardcoded home stats with real data
17. **H-12** Dynamic categories from projects data

### Sprint 4 (Medium Polish)
18. All remaining Medium issues (M-1 through M-18)

### Sprint 5 (Low Priority Polish)
19. All remaining Low issues (L-1 through L-10)

---

*End of Audit Report — 49 issues identified across 15 files*
