# Mobile App — Use Case Document

## Actors

| Actor | Description |
|---|---|
| **Guest** | Unauthenticated user who has installed the app but not logged in |
| **Buyer** | Authenticated user with `role = BUYER`. Posts requests and evaluates bids |
| **Merchant** | Authenticated user with `role = MERCHANT`. Browses requests and submits bids |
| **System** | The app itself — handles token refresh, 401 logout, navigation guards |

---

## Use Case Index

| ID | Use Case | Actor |
|---|---|---|
| UC-01 | View Onboarding | Guest |
| UC-02 | Authenticate via OTP | Guest |
| UC-03 | Complete Profile Setup | Buyer / Merchant (first login) |
| UC-04 | Post a Request | Buyer |
| UC-05 | View My Requests | Buyer |
| UC-06 | View Request Detail | Buyer / Merchant |
| UC-07 | View Bids on a Request | Buyer |
| UC-08 | Accept a Bid | Buyer |
| UC-09 | Decline a Bid | Buyer |
| UC-10 | Browse Open Requests | Merchant |
| UC-11 | Search and Filter Requests | Merchant |
| UC-12 | Submit a Bid | Merchant |
| UC-13 | View My Bids | Merchant |
| UC-14 | View Bid Detail | Merchant |
| UC-15 | View Chat Rooms | Buyer / Merchant |
| UC-16 | Send and Receive Messages | Buyer / Merchant |
| UC-17 | View Notifications | Buyer / Merchant |
| UC-18 | View and Edit Profile | Buyer / Merchant |
| UC-19 | Logout | Buyer / Merchant |
| UC-20 | Auto-Logout on Session Expiry | System |

---

## UC-01 — View Onboarding

**Actor:** Guest  
**Trigger:** App launched for the first time, or after logout when no stored token exists

**Preconditions:**
- No valid access token in `AsyncStorage`

**Main Flow:**
1. Splash screen resolves auth state (no token found) and navigates to Onboarding.
2. Guest views slide 1: "Post Your Request".
3. Guest taps **Next →**, slides to slide 2: "Get the Best Offers".
4. Guest taps **Next →**, slides to slide 3: "Choose & Buy".
5. Guest taps **Get Started**, navigates to `PhoneInput`.

**Alternative Flows:**
- **A1 — Skip:** On slides 1 or 2, guest taps **Skip** → navigates directly to `PhoneInput`, bypassing remaining slides.
- **A2 — Swipe:** Guest swipes horizontally instead of tapping Next; dot indicator and active slide update accordingly.

**Postconditions:**
- Guest lands on `PhoneInputScreen`.

---

## UC-02 — Authenticate via OTP

**Actor:** Guest  
**Trigger:** Guest arrives at `PhoneInputScreen` from Onboarding or a direct app open with no token

**Preconditions:**
- No valid session token
- User has a valid +962 (Jordan) phone number

**Main Flow:**
1. Guest enters a 9-digit local phone number (country code +962 is fixed).
2. The **Continue** button activates once all 9 digits are entered.
3. Guest taps **Continue**; app calls `sendOTP(phone)`.
4. App navigates to `OTPScreen`, displaying the masked phone number.
5. Guest enters the 6-digit OTP received via SMS. Each digit auto-advances the cursor to the next input.
6. Once all 6 digits are filled, guest taps **Verify**; app calls `verifyOTP(phone, otp)`.
7. On success, `accessToken`, `refreshToken`, and `user` are saved to `AsyncStorage`.
8. If `user.profile.firstName` is absent → navigate to `ProfileSetup`.
9. If profile is already complete → navigate to `App`.

**Alternative Flows:**
- **A1 — Wrong OTP:** Server returns an error; error message is displayed in a red box, all digit inputs clear, and focus returns to the first box.
- **A2 — Resend OTP:** After 60-second cooldown, guest taps **Resend Code**; app calls `sendOTP(phone)` again, resets the 6 digits, and restarts the 60-second cooldown.
- **A3 — OTP Expired:** Countdown on screen reaches 0 and shows "Code has expired — please resend". Guest must use A2.
- **A4 — Change Number:** Guest taps **Change phone number** → navigates back to `PhoneInputScreen`.
- **A5 — Wrong Phone Format:** Continue button remains disabled until exactly 9 digits are typed; non-numeric input is stripped automatically.

**Postconditions:**
- User is authenticated and lands on `ProfileSetup` or the role-appropriate `App` navigator.

---

## UC-03 — Complete Profile Setup

**Actor:** Newly authenticated Buyer or Merchant (first login)  
**Trigger:** `needsProfileSetup = true` (authenticated user with no `profile.firstName`)

**Preconditions:**
- User is authenticated
- `user.profile.firstName` is null or empty

**Main Flow:**
1. App navigates to `ProfileSetupScreen`. A 4-segment progress bar is shown.
2. **Step 1 — Role:** User selects either **Buyer** (🛒) or **Merchant** (🏪). Default selection is BUYER. Taps **Continue →**.
3. **Step 2 — Name:** User enters First Name (required) and Last Name (optional). Taps **Continue →**.
4. **Step 3 — Location:** User enters City (required) and Country (optional). Taps **Save Profile →**; app calls `updateProfile({ role, firstName, lastName, city, country })`.
5. **Step 4 — Done:** A summary card displays role, full name, city, and phone. User taps **Go to App →**.
6. App resets navigation to `App`, routing to `BuyerNavigator` or `MerchantNavigator` based on the chosen role.

**Alternative Flows:**
- **A1 — Missing Required Field:** If First Name is empty on step 2 or City is empty on step 3, an inline error is shown and the step does not advance.
- **A2 — API Failure on Step 3:** Error message "Failed to save your profile. Please try again." is displayed; user remains on step 3.
- **A3 — Back Navigation:** Back buttons on steps 2 and 3 return to the previous step with entered values preserved.

**Postconditions:**
- `user.profile` is populated, `needsProfileSetup` becomes false.
- User lands in their role-appropriate navigator and will not see `ProfileSetup` again.

> **Note:** Role is permanent — the UI states "You can only have one role per account." There is no role-switching mechanism in the app.

---

## UC-04 — Post a Request

**Actor:** Buyer  
**Trigger:** Buyer taps **+** on Home tab or the **Post a Request** card

**Preconditions:**
- User is authenticated with `role = BUYER`
- At least one category exists in the system

**Main Flow:**
1. App navigates to `CreateRequestScreen`. A 3-step indicator is shown.
2. **Step 1 — Category:** Buyer browses a 2-column grid of categories and taps one to select it (highlighted with a blue border and ✓ badge). Taps **Continue**.
3. **Step 2 — Details:** Buyer enters Title (up to 255 characters, character count shown) and Description (multiline). Taps **Continue**.
4. **Step 3 — Budget & Publish:** Buyer reviews a summary card showing category, title, and description. Optionally enters a Min and/or Max budget. Taps **Publish Request**; app calls `publishRequest({ title, description, categoryId, budgetMin, budgetMax, expiresInDays: 3 })`.
5. Alert "Request Published!" is shown. Buyer taps **OK** → navigated back.

**Alternative Flows:**
- **A1 — No Category Selected:** On step 1, tapping Continue without a selection shows an alert "Select a category".
- **A2 — Missing Title or Description:** On step 2, validation shows an alert "Title required" or "Description required".
- **A3 — Invalid Budget:** Min > Max shows alert "Minimum budget cannot exceed maximum."
- **A4 — API Error:** Error message from the server is displayed in an alert.
- **A5 — Cancel:** Tapping ✕ on step 1 navigates back. Tapping ← on steps 2–3 goes back one step (data preserved).
- **A6 — No Budget:** Buyer leaves both budget fields blank; request is published as open budget.

**Postconditions:**
- Request created with status `ACTIVE`, expires in 3 days.
- Merchants can now browse and bid on this request.

---

## UC-05 — View My Requests

**Actor:** Buyer  
**Trigger:** Buyer taps the **Requests** tab

**Preconditions:**
- User is authenticated with `role = BUYER`

**Main Flow:**
1. App loads buyer's requests from the API with pagination.
2. Each request card shows title, category, status badge (colour-coded), and bid count.
3. Buyer scrolls through the list.
4. Buyer taps a request → `RequestDetail`.

**Alternative Flows:**
- **A1 — No Requests:** Empty state shown: "No requests yet — Post your first request to get started."
- **A2 — Load Error:** Error message shown in the list area.

**Postconditions:**
- None (read-only).

---

## UC-06 — View Request Detail

**Actor:** Buyer or Merchant  
**Trigger:** Tapping any request card from Home, Requests tab, or Dashboard

**Preconditions:**
- User is authenticated
- Valid `requestId` is passed

**Main Flow:**
1. App loads request data from the API.
2. Screen displays title, category, description, budget range, status, bid count, and expiry.
3. Role-specific CTAs are shown:
   - **Buyer**: **View Bids** button if `bidCount > 0` → `RequestBids`
   - **Merchant**: **Submit Bid** button → `SubmitBid`

**Alternative Flows:**
- **A1 — Load Failure:** App navigates back and shows an error alert.
- **A2 — Request Expired / Cancelled:** Merchant's Submit Bid CTA is hidden or disabled; buyer sees the final status.

**Postconditions:**
- None (read-only, serves as entry point to UC-07, UC-08, UC-09, UC-12).

---

## UC-07 — View Bids on a Request

**Actor:** Buyer  
**Trigger:** Buyer taps **View Bids** on `RequestDetailScreen`

**Preconditions:**
- User is authenticated with `role = BUYER`
- The request belongs to this buyer

**Main Flow:**
1. App loads all bids for the request, sorted by amount ascending.
2. **Market summary bar** shows: Total bids, Pending count, Lowest amount, Average amount.
3. Each bid card displays: status badge, submission date, bid amount, delivery days, delivery notes (if any).
4. Pending bids show **Accept** and **Decline** buttons.
5. Buyer reviews bids and decides to act (UC-08 or UC-09).

**Alternative Flows:**
- **A1 — No Bids:** Empty state: "No bids yet — Merchants haven't submitted bids yet. Pull to refresh."
- **A2 — Pull to Refresh:** Buyer pulls down to reload the list.
- **A3 — Load Error:** Alert shown; buyer is navigated back on OK.

**Postconditions:**
- None (read-only unless buyer proceeds to UC-08 or UC-09).

---

## UC-08 — Accept a Bid

**Actor:** Buyer  
**Trigger:** Buyer taps **Accept** on a bid card in `RequestBidsScreen`

**Preconditions:**
- User is authenticated with `role = BUYER`
- Bid status is `PENDING`

**Main Flow:**
1. Confirmation alert: "Accept the $X.XX bid with N-day delivery? All other bids will be rejected."
2. Buyer taps **Accept** in the alert.
3. App calls `acceptBid(bidId)`.
4. Alert: "Accepted! The bid has been accepted. The merchant will be notified."
5. Buyer taps **OK** → navigated back to `RequestDetail`.

**Alternative Flows:**
- **A1 — Cancel:** Buyer taps **Cancel** in the confirmation alert → no action taken, returns to bids list.
- **A2 — API Error:** Error message shown in an alert; bid list remains unchanged.

**Postconditions:**
- The accepted bid status becomes `ACCEPTED`.
- All other `PENDING` bids on the same request are automatically `REJECTED` (server-side).
- Request status changes to `COMPLETED`.
- Merchant is notified (server-side push/in-app notification).

---

## UC-09 — Decline a Bid

**Actor:** Buyer  
**Trigger:** Buyer taps **Decline** on a bid card in `RequestBidsScreen`

**Preconditions:**
- User is authenticated with `role = BUYER`
- Bid status is `PENDING`

**Main Flow:**
1. Confirmation alert: "Decline the $X.XX bid?"
2. Buyer taps **Decline** (destructive style).
3. App calls `rejectBid(bidId)`.
4. Bid list refreshes; the declined bid now shows status `REJECTED`.

**Alternative Flows:**
- **A1 — Cancel:** Buyer taps **Cancel** → no action, returns to bid list.
- **A2 — API Error:** Error alert shown; list not refreshed.

**Postconditions:**
- Bid status is `REJECTED`.
- Other bids remain `PENDING` and can still be accepted.
- Request remains open for more bids.

---

## UC-10 — Browse Open Requests

**Actor:** Merchant  
**Trigger:** Merchant taps the **Requests** tab or **Browse Requests** quick action on Dashboard

**Preconditions:**
- User is authenticated with `role = MERCHANT`

**Main Flow:**
1. App loads `ACTIVE` and `HAS_BIDS` requests (20 per page), default sort: Newest.
2. Each card displays: category badge, expiry label (turns red ≤ 1 day left), title, description (truncated to 2 lines), budget, bid count, and time since posted.
3. Merchant scrolls through the list.
4. Merchant taps a request → `RequestDetail` (UC-06).

**Alternative Flows:**
- **A1 — Pull to Refresh:** Merchant pulls down → list reloads from page 1.
- **A2 — Load More:** When Merchant scrolls to 30% from bottom, next page is appended automatically.
- **A3 — No Requests:** Empty state: "No requests available — Pull down to refresh."

**Postconditions:**
- None (read-only, entry point to UC-11, UC-12).

---

## UC-11 — Search and Filter Requests

**Actor:** Merchant  
**Trigger:** Merchant interacts with search or sort controls on `BrowseRequestsScreen`

**Preconditions:**
- User is authenticated with `role = MERCHANT`

**Main Flow (Search):**
1. Merchant taps the search bar and types a keyword.
2. The displayed list is filtered client-side (on the already-loaded page) matching title or description.
3. A ✕ clear button appears; tapping it clears the search and restores the full list.

**Main Flow (Sort):**
1. Merchant taps one of three sort chips: **Newest** · **Highest Budget** · **Expiring Soon**.
2. List reloads from page 1 with the new server-side sort applied.

**Alternative Flows:**
- **A1 — Search with No Results:** Empty state: "No matching requests — Try a different search term."
- **A2 — Combine Search + Sort:** Merchant can apply a sort and then search; sort applies on fetch, search filters the fetched results.

**Postconditions:**
- None (read-only filtering).

---

## UC-12 — Submit a Bid

**Actor:** Merchant  
**Trigger:** Merchant taps **Submit Bid** on `RequestDetailScreen`

**Preconditions:**
- User is authenticated with `role = MERCHANT`
- Request status is `ACTIVE` or `HAS_BIDS`
- Merchant has not already bid on this request (server-enforced)

**Main Flow:**
1. App navigates to `SubmitBidScreen` with the request title pre-displayed in a green summary card.
2. Merchant enters **Bid Amount** (required, > 0).
3. Merchant enters **Delivery Days** (required, > 0 integer).
4. Optionally enters **Delivery Notes** and **Special Terms**.
5. A **Bid Summary** preview card appears once amount and days are both valid.
6. Merchant taps **Submit Bid**; app calls `submitBid({ requestId, amount, deliveryDays, deliveryNotes, specialTerms })`.
7. Success alert shows competitive position: "You're #N of M bids." or "You are the first bidder!".
8. Merchant taps **OK** → navigated back.

**Alternative Flows:**
- **A1 — Incomplete Form:** Submit button is disabled (`#D1FAE5` colour) until both required fields are valid; no alert needed.
- **A2 — Duplicate Bid:** Server returns error (merchant already bid on this request); error alert shown.
- **A3 — API Error:** Error message from server displayed in alert; bid not created.
- **A4 — Cancel:** Merchant taps ← back button → navigated back without submitting.

**Postconditions:**
- Bid created with status `PENDING`.
- Buyer's request status changes to `HAS_BIDS` (server-side).
- Buyer receives a notification (server-side).

---

## UC-13 — View My Bids

**Actor:** Merchant  
**Trigger:** Merchant taps the **My Bids** tab

**Preconditions:**
- User is authenticated with `role = MERCHANT`

**Main Flow:**
1. App loads the merchant's submitted bids from the API.
2. Each bid card shows the related request title, bid amount, delivery days, status badge, and submission date.
3. Merchant scrolls through the list.
4. Merchant taps a bid → `BidDetail` (UC-14).

**Alternative Flows:**
- **A1 — No Bids:** Empty state: "No bids yet — Browse requests and start placing bids."

**Postconditions:**
- None (read-only).

---

## UC-14 — View Bid Detail

**Actor:** Merchant  
**Trigger:** Merchant taps a bid from `MyBidsScreen`

**Preconditions:**
- User is authenticated with `role = MERCHANT`
- Valid `bidId` is passed

**Main Flow:**
1. App loads the bid and its parent request details.
2. Screen shows: bid amount, delivery days, notes, special terms, status, submission date, and a summary of the original request.

**Postconditions:**
- None (read-only).

---

## UC-15 — View Chat Rooms

**Actor:** Buyer or Merchant  
**Trigger:** User taps the **Messages** tab

**Preconditions:**
- User is authenticated

**Main Flow:**
1. App loads all chat rooms the user belongs to (`limit: 50`).
2. Each room row shows: room avatar (first letter with role-coloured background), room name, last message preview, timestamp, and an unread count badge (if > 0).
3. User scrolls the list.
4. User taps a room → `ChatRoom` (UC-16).

**Room Type Colour Coding:**

| Type | Background | Text |
|---|---|---|
| DIRECT | Blue-100 | Blue-600 |
| GROUP | Purple-100 | Purple-600 |
| REQUEST | Green-100 | Green-600 |
| BID | Yellow-100 | Amber-700 |
| SUPPORT | Red-100 | Red-600 |

**Alternative Flows:**
- **A1 — No Rooms (Buyer):** "Chat rooms will appear here when merchants contact you."
- **A2 — No Rooms (Merchant):** "Chat rooms will appear here when you contact buyers."
- **A3 — Pull to Refresh:** User pulls down to reload the room list.

**Postconditions:**
- None (read-only list, entry point to UC-16).

---

## UC-16 — Send and Receive Messages

**Actor:** Buyer or Merchant  
**Trigger:** User taps a room in `ChatListScreen`

**Preconditions:**
- User is authenticated
- User is a participant in the chat room

**Main Flow:**
1. App navigates to `ChatRoomScreen` with `roomId` and `roomName`.
2. Historical messages are loaded and displayed in chronological order.
3. User types a message in the input field.
4. User taps **Send**; message is sent via API/socket.
5. Message appears in the conversation with a "You:" prefix in the other participant's preview.
6. Incoming messages appear in real-time.

**Alternative Flows:**
- **A1 — Empty Room:** "No messages yet" placeholder shown.
- **A2 — Message Types:** Rooms can contain `TEXT`, `IMAGE`, `FILE`, `VOICE`, `VIDEO`, `LOCATION`, and `SYSTEM` message types; the type icon is shown next to each message.

**Postconditions:**
- Message created in the room; unread count increments for the other participant.

---

## UC-17 — View Notifications

**Actor:** Buyer or Merchant  
**Trigger:** User taps the **Alerts** tab

**Preconditions:**
- User is authenticated

**Main Flow:**
1. App loads the user's notifications from the API.
2. Each notification shows type, title, content, status, and timestamp.
3. User scrolls through the list.
4. Tapping a notification may deep-link to the related resource (bid, request, chat room).

**Alternative Flows:**
- **A1 — No Notifications:** Empty state shown.

**Postconditions:**
- Notifications may be marked as read (server-side).

---

## UC-18 — View and Edit Profile

**Actor:** Buyer or Merchant  
**Trigger:** User taps the **Profile** tab

**Preconditions:**
- User is authenticated

**Main Flow:**
1. App displays the user's profile: name, phone, role, city, country.
2. User edits any editable field.
3. User saves changes; app calls `updateProfile(payload)`.
4. Updated user object is saved to `AsyncStorage` and the context is refreshed.

**Alternative Flows:**
- **A1 — API Error:** Error message shown; previous values remain.
- **A2 — No Changes:** Save button does nothing if no fields were modified.

**Postconditions:**
- `user` in context and `AsyncStorage` reflect the updated values.
- Display name in the Home/Dashboard header updates immediately.

---

## UC-19 — Logout

**Actor:** Buyer or Merchant  
**Trigger:** User taps **Logout** / **Sign out** on the Profile screen

**Preconditions:**
- User is authenticated

**Main Flow:**
1. App calls `AuthAPI.logout(refreshToken)` to invalidate the server-side refresh token.
2. Regardless of the API result, app calls `AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user'])`.
3. Auth context state is reset: `user = null`, `isAuthenticated = false`.
4. Navigation resets to `Onboarding` (the next fresh launch will go to Onboarding since no token exists).

**Alternative Flows:**
- **A1 — API Unreachable:** Logout API error is silently swallowed; local state and `AsyncStorage` are cleared anyway, ensuring the user is always logged out locally.

**Postconditions:**
- All local session data is cleared.
- User lands on `Onboarding`.
- Server-side refresh token is invalidated (best-effort).

---

## UC-20 — Auto-Logout on Session Expiry

**Actor:** System  
**Trigger:** Any authenticated API call returns HTTP 401

**Preconditions:**
- User is authenticated with an expired or revoked access token
- Token refresh has already failed or is not attempted

**Main Flow:**
1. Axios interceptor in `src/api/client.ts` detects a 401 response.
2. Interceptor calls the registered `logoutCallback` (which is `performLogout`).
3. `performLogout` clears `AsyncStorage` and resets auth context.
4. Navigation resets to `Auth` (directly to `PhoneInputScreen`, skipping Onboarding).

**Postconditions:**
- User is logged out.
- User lands on `PhoneInputScreen` and must re-authenticate.
- Any in-progress action (submitting a bid, publishing a request) is abandoned.

---

## Business Rules Summary

| Rule | Enforced By |
|---|---|
| Country code is fixed to +962 (Jordan) | Client — `PhoneInputScreen` |
| OTP is 6 digits, expires on a server-set timer | Client countdown; server validates |
| Resend OTP cooldown is 60 seconds | Client — `OTPScreen` |
| Each user can only have one role (Buyer or Merchant) | Client UI warning; server-enforced |
| Role is set once during profile setup and cannot be changed | No role-change screen exists |
| Requests expire in exactly 3 days | Client hardcodes `expiresInDays: 3` |
| Budget min cannot exceed budget max | Client validation — `CreateRequestScreen` |
| Accepting a bid rejects all other pending bids automatically | Server-side |
| A merchant cannot submit a duplicate bid on the same request | Server-side |
| Merchants only see ACTIVE and HAS_BIDS requests | Client filters `status: 'ACTIVE,HAS_BIDS'` |
| Chat room unread count ≥ 100 is displayed as "99+" | Client — `ChatListScreen` |
| Session is always terminated locally on logout, regardless of API errors | Client — `performLogout` |
