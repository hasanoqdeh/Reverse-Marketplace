# Validation Audit — Reverse Marketplace Mobile App (`app/`)

**Prepared for:** Development team & engineering leadership
**Scope:** React Native 0.72 mobile client (`app/src`, 43 TS/TSX files). Backend, admin panel, and infra reviewed only where they affect app behavior.
**Stage:** MVP, AI-assisted build.
**Date:** 2026-06-05

> **Note on this document.** This is a *validation report*, not an implementation plan — the deliverable is the assessment itself. It was written by directly reading the source (not just locating it), so findings cite `file:line`. A short remediation backlog is included at the end.

---

## Context

The product is a **reverse marketplace**: buyers post requests, merchants bid, the buyer accepts one bid, the merchant fulfills it through a 5-stage delivery flow, and both sides rate each other. The brief framed this as "e-commerce + social/communication." In practice:

- **"E-commerce" = the reverse-marketplace loop** (request → bids → accept → fulfillment → review). There is **no checkout/payment in the app** — money appears to change hands off-platform.
- **"Social/communication" = transactional 1:1 chat** (text/image/voice) bound to an accepted bid, plus push + in-app notifications. There is **no social graph** (no profiles feed, following, comments, public posting). Leadership should reset expectations here: this is a *messaging layer attached to transactions*, not a social network.

The core transactional loop is **functionally complete and surprisingly cohesive for an MVP** — this is the product's main strength. The gaps are concentrated in **security hygiene, deployability, quality infrastructure, design consistency, and localization** — exactly the areas where AI-generated scaffolding tends to leave debt.

---

## Executive Summary

**Current state:** The end-to-end happy path works and is well-structured. A buyer can register (phone+OTP), set up a profile, post a request with images/budget/category, receive bids with market analysis, accept/decline, chat with the merchant, track fulfillment, and leave a review. The merchant side mirrors this with a discovery feed, quick-bid, activity/order management, and fulfillment controls. Real-time chat (Socket.IO) with typing indicators, read receipts, image and voice messages is implemented and is genuinely above MVP baseline.

**Key strengths**
- Complete, coherent two-sided marketplace loop with role-based navigation.
- Solid auth token lifecycle: refresh-token interceptor with request queuing during refresh (`api/client.ts:51-129`).
- Rich chat feature set (voice notes, image upload, typing, read receipts, archived rooms).
- Thoughtful UX touches: optimistic bid updates, market/competition stats, fulfillment progress bar, pull-to-refresh and pagination on feeds.

**Critical gaps (block any external testing/launch)**
1. **A test-account auth bypass is shipped in the production UI.** `AppHeader` renders a "Switch Account" list of four hardcoded `TEST_ACCOUNTS` (real phone numbers) → `switchAccount()` → `verifyOTP(phone, '123456')` with a hardcoded OTP. Any user can become any of these accounts with no verification. (`components/AppHeader.tsx:21-26,82-93`; `context/AuthContext.tsx:174-197`)
2. **Not deployable beyond the local Android emulator.** API base URLs are hardcoded to `10.0.2.2`/`localhost` with no env config (`api/client.ts:10-16`), and `ChatRoomScreen` hardcodes its own `API_BASE = 'http://10.0.2.2:3000'` (`:32`), so **chat/sockets only work on an Android emulator** — broken on iOS and all physical devices.
3. **Zero automated tests.** Jest is configured (`package.json:66-68`) but there are no `.test`/`.spec` files anywhere. No safety net for a money-adjacent marketplace.
4. **No error boundary.** Any render-time exception crashes the whole app; there is no `componentDidCatch`/fallback anywhere in `src`.

**Overall validation conclusion:** **Needs significant work before external validation.** The product *concept and core flows* are demonstrably ready for stakeholder demos on a controlled emulator. It is **not** ready for outside testers or a store build until the shipped auth bypass is removed, real environments are configurable, and basic crash-resilience + a smoke-test layer exist. Effort to clear the blockers is modest (days, not weeks); the design-consistency and localization work is larger but non-blocking.

---

## Detailed Findings

### 1. Functionality & Technical Quality

**Working as intended**
- Phone+OTP auth with expiry countdown, resend cooldown, masked number, auto-advance digit inputs (`screens/auth/OTPScreen.tsx`).
- Token refresh + 401 retry queue (`api/client.ts:72-129`) — correct single-flight refresh pattern.
- Request creation with image upload (up to 4, `Promise.allSettled` so one failed upload doesn't sink the post), category sheet, optional budget with min>max validation (`CreateRequestScreen.tsx:83-112`).
- Bid lifecycle: submit (two entry points), accept (rejects others), decline, withdraw, fulfillment state machine `AWAITING→PREPARING→IN_DELIVERY→DELIVERED→CONFIRMED` (`MerchantActivityScreen.tsx:33-49`).
- Real-time chat with socket + REST fallback (`ChatRoomScreen.tsx:227-242`), voice record/playback, image viewer.

**Issues**
- **[HIGH] Platform compatibility — iOS/physical devices unsupported.** Emulator-only base URLs (above). `KeyboardAvoidingView` behavior is correctly branched for iOS, but the network layer and socket endpoint will fail outside Android emulator. Until an env-based config exists, iOS validation is impossible.
- **[MEDIUM] Pervasive silent error swallowing.** Many `catch {}` / `catch { /* silently ignore */ }`: chat load (`ChatRoomScreen.tsx:178`), feed/bids fetches (`MerchantDiscoverScreen.tsx:338,347`), `RequestsScreen.tsx:80`, `MerchantActivityScreen.tsx:431,450`. Network failures render as empty lists with no error state or retry — users (and support) cannot distinguish "no data" from "backend down."
- **[MEDIUM] Optimistic bid uses fabricated fields.** After a quick bid, the local `Bid` is built with `merchantId: ''` and `priorityScore: 0` (`MerchantDiscoverScreen.tsx:376-380`); until refresh, downstream consumers see placeholder data.
- **[MEDIUM] Audio subsystem stability.** `AudioRecorderPlayer` is a module-level singleton (`ChatRoomScreen.tsx:34`) shared across all chat instances, with playback listeners added per message. Rapid navigation, replaying, or returning to a room can leak listeners / leave the recorder in a bad state. Recording assumes `audio/mp4` (`:327`) — codec/path assumptions are not validated cross-platform.
- **[LOW] Socket not re-authenticated on token refresh.** Token is read once at mount (`ChatRoomScreen.tsx:185-186`); a mid-session refresh won't update the socket auth.
- **[LOW] Chat history not paginated.** Loads the latest 50 messages with no "load earlier" (`ChatRoomScreen.tsx:172`).

**Code-quality indicators**
- Strong: consistent module structure, typed navigation params, `Promise.allSettled`/`Promise.all` used appropriately, `useCallback` discipline.
- Weak: AI-generation fingerprints — duplicated logic (two bid forms), inconsistent helper duplication (two `formatBudget`, two category-emoji maps), and `// eslint-disable-line` on effect deps (`MerchantDiscoverScreen.tsx:358-359`) masking dependency-array smells.

### 2. User Experience & Design

- **[CRITICAL→UX] Auth bypass exposed as a feature.** Beyond the security issue, the "Switch Account" drawer presents internal test users to real users — confusing and unprofessional in any external build.
- **[MEDIUM] Design-system fragmentation.** `CLAUDE.md` mandates theme tokens and "no raw hex," yet **12 of 31 screen/component files don't import the theme** and there are ~400 raw hex literals. Two competing blues are in use: theme `#1877F2` vs `#2563EB` (`OTPScreen`, `BuyerDiscoverScreen`, `RateTransactionScreen`). `SubmitBidScreen` and `RateTransactionScreen` use a **leftover green palette** (`#16A34A`, `#F0FDF4`, `#166534`). Net effect: the buyer's main Discover screen, the OTP screen, and the bid-submit screen look like a different app than the merchant feed/chat. Highest-density offenders: `BidDetailScreen` (45), `RequestDetailScreen` (41), `SubmitBidScreen` (32), `OTPScreen` (29).
- **[MEDIUM] Misleading buyer affordance.** On `BuyerDiscoverScreen`, both the hero CTA *and every category tile* call `goCreate` (`:187,258`). Tapping "Electronics" opens the New Request composer rather than browsing — categories are decorative, not navigable.
- **[MEDIUM] Asymmetric navigation.** Buyers get a 3-item tab bar (Discover / New / My Requests) with **no unified chat list** — they reach conversations only via RequestBids → "Open Chat." Merchants get Discover / Activity / Messages / Profile. Profile & Notifications are reachable for both via the header drawer/bell, but buyers have no single place to see all chats.
- **[MEDIUM] Accessibility largely absent.** Icon-only controls (send `↑`, mic `🎤`, attach `📎`, back `←`, close `✕`, burger, tab glyphs `⊕ ☰ ⊞ ⊛`) have no `accessibilityLabel`/`accessibilityRole`. Fonts are fixed-size (no Dynamic Type). Emoji-as-icons render inconsistently across OS versions despite `react-native-vector-icons` being a dependency.
- **[LOW] Navigation tech inconsistency.** `AuthNavigator` uses legacy `createStackNavigator` while the rest uses `native-stack`.
- **Onboarding:** Splash → Onboarding → phone/OTP → ProfileSetup (role + name + city) → App. Clear and conventional. Role is fixed at setup; the only "role switch" is the test backdoor — there is no legitimate role-switch path.

### 3. Feature Completeness (vs. MVP scope)

**E-commerce / marketplace — largely complete**
- ✅ Request CRUD-lite (create + view + status tabs), image upload, categories, budget.
- ✅ Bidding: submit, quick-bid sheet, market analysis (lowest/avg/position), accept/decline/withdraw.
- ✅ Fulfillment tracking (5 stages) for both sides; merchant order management (`MerchantActivityScreen`).
- ✅ Reviews/ratings (`RateTransactionScreen`), merchant store/profile, public platform stats.
- ❌ **No in-app payment/checkout** — significant for a marketplace; clarify whether intentional (cash/off-platform) for MVP.
- ❌ **No buyer-side delivery-confirmation surfaced clearly** (merchant marks DELIVERED and "awaits buyer confirmation," but the buyer's CONFIRM action wasn't found in the reviewed screens — verify `RequestDetailScreen`).
- ❌ No real buyer-side category/search browsing (see UX above).

**Social/communication — complete for its (narrow) scope**
- ✅ 1:1 chat: text, image, voice, typing, read receipts, message deletion, archived rooms.
- ✅ Push (FCM via `usePushNotifications`) + in-app notification feed and bell with badge context.
- ❌ No group chat, profiles feed, following, or any non-transactional social surface (expected — reframe the "social app" label).

**Dead/duplicate code**
- `modules/buyer/screens/HomeScreen.tsx` is defined but **never imported or registered** (dead code, same pattern as the cleanup list in `CLAUDE.md`).
- Two bid-submission implementations: full-screen `SubmitBidScreen` (registered, green-themed) and the in-feed `QuickBidSheet`. The merchant feed uses the sheet; `SubmitBidScreen` may be effectively unreachable — duplicated validation/logic and a maintenance hazard.

### 4. Business Viability

- **Market readiness:** Demo-ready on a controlled emulator; **not** ready for external users due to the shipped auth bypass, emulator-only networking, and visible test accounts.
- **Market fit / localization (MEDIUM):** Target market appears to be Jordan (phone mask hardcoded to `+962`, `OTPScreen.tsx:164`; placeholder `7XXXXXXXX`), yet currency is hardcoded `$` everywhere (should likely be JOD), dates/times use `en-US` locale, and there is **no Arabic / RTL support**. This is a real adoption blocker for the apparent audience.
- **AI-generated tech debt / maintenance concerns:** design fragmentation, duplicated helpers and flows, silent error handling, and the absence of tests are classic AI-scaffold residue. They won't block a demo but will compound maintenance cost and reliability as the team iterates.
- **Fitness for MVP feedback collection:** Adequate for moderated, on-device demos to gather directional feedback on the *flow*. Not yet fit for unmoderated beta (crash risk, no error visibility, security exposure).

### 5. Quality Assurance Findings

- **[CRITICAL] Auth bypass** (test accounts + hardcoded OTP) — see Executive Summary #1.
- **[HIGH] Token storage in AsyncStorage (plaintext).** `react-native-keychain` is a dependency but tokens live in AsyncStorage (`api/client.ts`, `AuthContext.tsx:104-105,124-127`). On a rooted/jailbroken or backed-up device, tokens are readable.
- **[HIGH] No error boundary / crash resilience.**
- **[MEDIUM] Input/edge cases:** budget accepts only `min>max` check (no NaN/negative guard beyond `parseFloat`); `formatBudget` differs between screens for min-only cases; category-emoji maps mismatch real backend category names (`CreateRequestScreen` keys like `'Electronics'` vs `BuyerDiscoverScreen` keyword matching) → emojis likely fall back to default.
- **[MEDIUM] State management:** silent catches leave screens in indistinguishable loading-vs-empty-vs-error states; optimistic placeholders (`merchantId:''`).
- **[LOW] Repo hygiene:** `@react-native-community/cli` is duplicated in `package.json` (deps `:14,16`; devDeps `:47,51`).

---

## Recommendations (prioritized by impact ÷ effort)

**P0 — Blockers (do before any external build; ~1–3 days)**
1. **Remove the test-account switcher and hardcoded OTP.** Delete `TEST_ACCOUNTS`/Switch-Account UI from `AppHeader`, remove `switchAccount`'s `'123456'` path from `AuthContext`. Gate any dev helper behind `__DEV__` + a build flag, never in shipped UI.
2. **Externalize configuration.** Introduce env-based API/socket URLs (`react-native-config` or a single `config.ts` with build variants); delete the inline `API_BASE` in `ChatRoomScreen` and reuse `api/client`'s `SERVER_URL`.
3. **Add a top-level Error Boundary** with a friendly fallback + reload.
4. **Stand up a smoke-test layer.** A few Jest + RTL tests on auth context, the API client interceptor, and one render test per primary screen; wire `npm test` into CI.

**P1 — High value (1–2 weeks)**
5. Move tokens to Keychain (the dependency is already present).
6. Replace silent `catch {}` with visible error + retry states on all data screens.
7. Localization pass: configurable currency (JOD), locale-aware dates, generalized phone formatting, and an RTL/Arabic plan.
8. Consolidate the two bid flows; delete `HomeScreen.tsx` dead code.

**P2 — Polish / debt (ongoing)**
9. Theme conformance sweep: migrate the 12 non-theme files, eliminate the green palette and the `#2563EB` blue, enforce "no raw hex" via lint.
10. Swap emoji nav/action icons for `react-native-vector-icons`; add `accessibilityLabel`/`role` to icon-only controls.
11. Make buyer categories actually browse a filtered feed; add a buyer chat list.
12. Harden the audio player (per-screen instance, listener cleanup); re-auth socket on token refresh; add chat "load earlier."

---

## Verification (how to re-test after fixes)

- **Functional smoke (emulator):** run backend (`cd backend && npm run dev`) + Metro (`cd app && npx react-native start`) + `run-android`; walk buyer→merchant loop end-to-end across two emulators (`emulator-5554`/`-5556`) per `CLAUDE.md`.
- **Security:** confirm no auth path accepts a static OTP and the drawer shows no test accounts in a release build; grep for `123456`, `TEST_ACCOUNTS`, `10.0.2.2`.
- **Deployability/iOS:** point env config at a LAN/staging backend, run on a physical device and iOS sim; verify chat sockets connect.
- **Crash resilience:** throw inside a screen render; confirm the error boundary catches it.
- **Tests/CI:** `cd app && npm test` green; lint passes with the no-raw-hex rule enabled.
