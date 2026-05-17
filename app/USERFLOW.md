# Mobile App — User Flow & Permission Model

## Overview

React Native 0.72 app. Navigation built on React Navigation with a Root Stack on top of two role-specific Bottom Tab navigators. A single `AuthContext` drives all permission gates; the role stored on the `user` object determines which navigator (and therefore which screens) are loaded after login.

---

## Navigation Stack Map

```
RootStack
├── Splash
├── Onboarding
├── Auth  (AuthStack)
│     ├── PhoneInput
│     └── OTP
├── ProfileSetup
├── App  ──────────── role gate ──────────────────────────────────
│     ├── [BUYER]   BuyerNavigator (bottom tabs)
│     │     ├── Home
│     │     ├── Requests
│     │     ├── Messages  (ChatListScreen)
│     │     ├── Alerts    (NotificationsScreen)
│     │     └── Profile
│     └── [MERCHANT] MerchantNavigator (bottom tabs)
│           ├── Dashboard
│           ├── Requests  (BrowseRequestsScreen)
│           ├── My Bids
│           ├── Messages  (ChatListScreen)
│           ├── Alerts    (NotificationsScreen)
│           └── Profile
├── CreateRequest          ← BUYER only
├── RequestDetail          ← both roles (different CTAs shown per role)
├── RequestBids            ← BUYER only (accept / decline bids)
├── SubmitBid              ← MERCHANT only
├── BidDetail              ← MERCHANT only
└── ChatRoom               ← both roles
```

---

## 1. App Launch (Splash)

**Screen:** `SplashScreen`  
**File:** `src/screens/splash/SplashScreen.tsx`

- Displays animated logo for a minimum of 2 seconds while `AuthContext` resolves the stored token from `AsyncStorage`.
- After both the timer and the auth check complete:
  - **Authenticated** → `App`
  - **Not authenticated** → `Onboarding`

No user action is required.

---

## 2. Onboarding

**Screen:** `OnboardingScreen`  
**File:** `src/screens/onboarding/OnboardingScreen.tsx`

Shown only to unauthenticated users (first launch or after logout).

Three horizontal slides:
| Slide | Title | Description |
|---|---|---|
| 1 | Post Your Request | Describe what you need; merchants come to you |
| 2 | Get the Best Offers | Merchants compete by sending quotes |
| 3 | Choose & Buy | Compare, chat, pick the best deal |

Controls:
- **Skip** button (slides 1–2) — jumps straight to Auth
- **Next →** (slides 1–2) / **Get Started** (slide 3) — advances or goes to Auth

---

## 3. Authentication

### 3a. Phone Input

**Screen:** `PhoneInputScreen`  
**File:** `src/screens/auth/PhoneInputScreen.tsx`

- Country code is hardcoded to `+962` (Jordan).
- User enters a 9-digit local number. Continue button is disabled until all 9 digits are entered.
- On submit, calls `sendOTP(phone)` which sets `loginStep = 'otp'` in context, triggering navigation to `OTPScreen`.

### 3b. OTP Verification

**Screen:** `OTPScreen`  
**File:** `src/screens/auth/OTPScreen.tsx`

- Six individual digit inputs with auto-advance and backspace-to-previous behaviour.
- **Expiry countdown** — shows time remaining from `otpExpiresAt`; when it hits 0 shows "Code has expired — please resend".
- **Resend cooldown** — 60-second timer before "Resend Code" becomes tappable again.
- On successful `verifyOTP`:
  - Tokens and user object stored in `AsyncStorage`.
  - If `needsProfileSetup` (user has no `profile.firstName`) → `ProfileSetup`.
  - Otherwise → `App`.

---

## 4. Profile Setup (First-Time Only)

**Screen:** `ProfileSetupScreen`  
**File:** `src/screens/profile/ProfileSetupScreen.tsx`

Triggered when `needsProfileSetup = true` (authenticated but `user.profile.firstName` is absent). A segmented progress bar shows 4 steps.

| Step | Content | Required |
|---|---|---|
| 1 — Role | Choose **Buyer** or **Merchant** (one per account, cannot be changed later) | Yes |
| 2 — Name | First name, Last name | First name only |
| 3 — Location | City, Country | City only |
| 4 — Done | Summary card with all entered data | — |

- Steps 1–2 are local state only.
- Step 3 calls `updateProfile({ role, firstName, lastName, city, country })` which persists the user object to `AsyncStorage` and updates the context.
- Step 4 calls `navigation.reset` to `App`, routing through the role gate.

**Back navigation:** Steps 2 and 3 show a Back button to return to the previous step. Step 1 has no back (can't go to Auth from here).

---

## 5. Role Gate (AppNavigator)

**File:** `src/navigation/AppNavigator.tsx`

```
if (!isAuthenticated) → reset to Auth
if (user.role === 'MERCHANT') → MerchantNavigator
else → BuyerNavigator   (covers BUYER and any edge case with no role yet)
```

This check runs on every render and on every auth state change. A 401 from the API triggers the axios interceptor → `performLogout` → resets to Auth.

---

## 6. Buyer Flow

Accent colour: **`#2563EB`** (blue)

### 6a. Home Tab

**Screen:** `HomeScreen`  
**File:** `src/modules/buyer/screens/HomeScreen.tsx`

- Personalised greeting (Good morning / afternoon / evening) with first name.
- **Post a Request** card with `+` button → `CreateRequest`.
- "How it works" 3-step explainer (static).
- **Recent Requests** — last 3 requests, tappable → `RequestDetail`.

### 6b. Requests Tab

**Screen:** `RequestsScreen`  
**File:** `src/modules/buyer/screens/RequestsScreen.tsx`

Full list of the buyer's own requests with pagination.

Status colours shown on request cards:
| Status | Colour |
|---|---|
| ACTIVE | green |
| HAS_BIDS | blue |
| DRAFT | grey |
| COMPLETED | dark green |
| CANCELLED | red |
| EXPIRED | amber |

### 6c. Create Request (Stack)

**Screen:** `CreateRequestScreen`  
**File:** `src/modules/buyer/screens/CreateRequestScreen.tsx`  
**Access:** Buyer only — navigated from Home and Requests tab.

Three-step wizard:

| Step | Content | Validation |
|---|---|---|
| 1 — Category | Grid of available categories (loaded from API) | Must select one |
| 2 — Details | Title (max 255), Description (multiline) | Both required |
| 3 — Budget | Review summary + optional min/max budget; 3-day expiry info | min ≤ max if both provided |

Footer action: **Continue** on steps 1–2, **Publish Request** on step 3 (calls `publishRequest` with `expiresInDays: 3`).

On success: alert "Request Published!" → `goBack()`.

### 6d. Request Detail (Stack)

**Screen:** `RequestDetailScreen`  
**File:** `src/modules/buyer/screens/RequestDetailScreen.tsx`  
**Access:** Both roles. Params: `{ requestId }`.

Shows request metadata, description, category, budget, status, bid count.  
Buyer-specific CTA: **View Bids** → `RequestBids`.

### 6e. Request Bids (Stack)

**Screen:** `RequestBidsScreen`  
**File:** `src/modules/buyer/screens/RequestBidsScreen.tsx`  
**Access:** Buyer only. Params: `{ requestId, requestTitle }`.

- **Market summary bar**: Total bids, Pending count, Lowest amount, Average amount.
- Bid cards sorted by amount (ascending). Each card shows: status badge, date, amount, delivery days, notes.
- Pending bids have **Accept** / **Decline** actions.
  - **Accept**: Confirmation alert warns all other bids will be rejected → calls `acceptBid` → alert → `goBack()`.
  - **Decline**: Confirmation alert → calls `rejectBid` → refreshes list.

Bid statuses: `PENDING`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `WITHDRAWN`.

---

## 7. Merchant Flow

Accent colour: **`#16A34A`** (green)

### 7a. Dashboard Tab

**Screen:** `DashboardScreen`  
**File:** `src/modules/merchant/screens/DashboardScreen.tsx`

- Welcome card with name and phone.
- **Stats row** (3 cards):
  - Open Requests — live count from API
  - My Active Bids — count of merchant's PENDING bids
  - Won This Month — static `0` (placeholder)
- **Quick Actions** card → navigates to Requests tab.
- **Latest Requests** — 5 most recent ACTIVE/HAS_BIDS requests; tappable → `RequestDetail`; "View All" → Requests tab.
- Pull-to-refresh.

### 7b. Requests Tab (Browse)

**Screen:** `BrowseRequestsScreen`  
**File:** `src/modules/merchant/screens/BrowseRequestsScreen.tsx`

- Filters only `ACTIVE` and `HAS_BIDS` requests (merchant cannot see DRAFT/CANCELLED/EXPIRED).
- **Search**: client-side filter on title and description of the loaded page.
- **Sort chips**: Newest · Highest Budget · Expiring Soon.
- Infinite scroll (20 per page), pull-to-refresh.
- Each card shows: category badge, expiry (turns red when ≤ 1 day left), title, description, budget, bid count.
- Tap → `RequestDetail`.

### 7c. Request Detail → Submit Bid (Stack)

**Screen:** `RequestDetailScreen` (shared)  
Merchant-specific CTA: **Submit Bid** → `SubmitBid`.

**Screen:** `SubmitBidScreen`  
**File:** `src/modules/merchant/screens/SubmitBidScreen.tsx`  
**Access:** Merchant only. Params: `{ requestId, requestTitle }`.

Fields:
| Field | Required | Notes |
|---|---|---|
| Amount | Yes | Decimal, must be > 0 |
| Delivery Days | Yes | Integer, must be > 0 |
| Delivery Notes | No | Multiline |
| Special Terms | No | Multiline |

Live preview card appears when amount and days are both valid.

On success: Alert shows competitive position ("You're #N of M bids" / "You are the first bidder!") → `goBack()`.

### 7d. My Bids Tab

**Screen:** `MyBidsScreen`  
**File:** `src/modules/merchant/screens/MyBidsScreen.tsx`

Merchant's own bids with status. Tappable → `BidDetail`.

### 7e. Bid Detail (Stack)

**Screen:** `BidDetailScreen`  
**File:** `src/modules/merchant/screens/BidDetailScreen.tsx`  
**Access:** Merchant only. Params: `{ bidId }`.

Shows submitted bid details, status, and the original request context.

---

## 8. Shared Screens (Both Roles)

### Chat

**ChatListScreen** (`src/screens/chat/ChatListScreen.tsx`)
- Shows all the user's chat rooms sorted by last message time.
- Room types (with colour coding): `DIRECT`, `GROUP`, `REQUEST`, `BID`, `SUPPORT`.
- Unread count badge on rooms with unread messages.
- Accent colour is role-aware (blue for buyer, green for merchant).
- Empty state message is role-aware.
- Tap any room → `ChatRoom` stack screen with `{ roomId, roomName }`.

**ChatRoomScreen** (`src/screens/chat/ChatRoomScreen.tsx`)
- Real-time messaging for both roles in the same room.

### Notifications

**NotificationsScreen** (`src/screens/notifications/NotificationsScreen.tsx`)
- Inbox of in-app notifications.

### Profile

**ProfileScreen** (`src/screens/profile/ProfileScreen.tsx`)
- Displays and allows editing of user profile data.
- Contains logout action → `performLogout` → clears `AsyncStorage` → resets to Auth.

---

## 9. Permission Summary

| Capability | Guest | Buyer | Merchant |
|---|---|---|---|
| View onboarding | ✓ | — | — |
| Authenticate (OTP) | ✓ | — | — |
| Complete profile setup | — | ✓* | ✓* |
| Post a request | — | ✓ | — |
| View own requests | — | ✓ | — |
| View bids on own request | — | ✓ | — |
| Accept / decline a bid | — | ✓ | — |
| Browse open requests | — | — | ✓ |
| Submit a bid | — | — | ✓ |
| View own bids | — | — | ✓ |
| View bid detail | — | — | ✓ |
| Send / receive messages | — | ✓ | ✓ |
| View notifications | — | ✓ | ✓ |
| View / edit profile | — | ✓ | ✓ |
| Logout | — | ✓ | ✓ |

*Only required on first login when `profile.firstName` is absent.

---

## 10. Auth State Machine

```
[Cold Start]
     │
     ▼
  SplashScreen (≥2s + AsyncStorage check)
     │
     ├─ token found ──────────────────────────► [App]
     │                                             │
     └─ no token ──► OnboardingScreen              │
                          │                        │
                     PhoneInputScreen        needsProfileSetup?
                          │                   yes ┤  no
                     OTPScreen               ProfileSetupScreen
                          │                        │
                     verifyOTP OK ─────────────────┘
                                                   │
                                             role === 'MERCHANT'?
                                              yes ┤  no
                                     MerchantNavigator  BuyerNavigator
```

---

## 11. Token Lifecycle

- `accessToken` and `refreshToken` stored in `AsyncStorage` under those keys.
- `user` JSON stored under `'user'` key and kept in sync by `updateProfile`.
- Axios interceptor in `src/api/client.ts` calls `performLogout` on any 401 response, clearing all three keys and resetting the navigation stack to Auth.
- Explicit logout (from Profile screen) calls `AuthAPI.logout(refreshToken)` then clears storage regardless of whether the API call succeeds.
