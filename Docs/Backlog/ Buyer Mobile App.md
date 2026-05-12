
# Buyer Mobile App Backlog

## “Post a Request in 3 Clicks” Experience

App Name:

```text id="b1k7qp"
buyer-mobile-app
```

Primary Responsibility:

* Create purchase requests (Reverse Marketplace)
* Browse bids from merchants
* Accept/reject offers
* Real-time notifications
* Chat with merchants
* Track request lifecycle
* Wallet usage (if applicable)

Target Platforms:

* iOS (React Native)
* Android (React Native)

Recommended Stack:

* React Native (preferred for speed + UI consistency)
* Riverpod / Bloc
* Socket.io client
* REST API Gateway
* Firebase (FCM)
* Secure Storage
* Offline caching (Hive / SQLite)

---

# Product Principles

## UX Principles

* “3 taps to publish request”
* WhatsApp-like chat experience
* Zero technical complexity for merchants interaction
* Instant feedback for every action

## Performance Goals

* App launch < 2s
* Request publish < 3s
* Bid update real-time < 1s latency

---

# App Modules Structure

```text id="q7m2zv"
lib/
├── core/
├── features/
│   ├── auth/
│   ├── requests/
│   ├── bids/
│   ├── chat/
│   ├── notifications/
│   ├── profile/
│   ├── wallet/
│   └── settings/
├── shared/
└── main.dart
```

---

# EPIC BA-0 — App Foundation

---

## BA-001 — App Initialization

### Description

Setup React Native project with scalable architecture.

### Acceptance Criteria

* Clean architecture implemented
* Environment config (dev/staging/prod)
* API client configured
* Error handling system ready

---

## BA-002 — API Integration Layer

### Description

Connect to backend API Gateway.

### Acceptance Criteria

* REST client (Dio)
* Token interceptor
* Retry mechanism
* Error mapping

---

## BA-003 — Secure Storage Setup

### Description

Store JWT tokens securely.

### Acceptance Criteria

* Encrypted storage enabled
* Auto logout on token expiry

---

## BA-004 — State Management Setup

### Options

* Riverpod (recommended)
* Bloc (alternative)

---

# EPIC BA-1 — Authentication

---

## BA-100 — Phone Login Screen

### Description

Login via phone number (Jordan/Oman format ready).

### Flow

1. Enter phone
2. Receive OTP
3. Verify OTP
4. Login

---

## BA-101 — OTP Verification Screen

### Acceptance Criteria

* Auto-read OTP (Android)
* Timer resend
* Error handling

---

## BA-102 — Session Management

### Acceptance Criteria

* Auto login
* Token refresh
* Logout handling

---

## BA-103 — Role Handling (Buyer Only)

---

# EPIC BA-2 — Request Creation (Core Feature)

---

## BA-200 — Create Request Wizard (3-Step Flow)

### Step 1: Category Selection

* Spare parts
* Electronics
* Furniture
* Custom category

---

### Step 2: Description Input

### Features

* Text input
* Image upload
* Voice note (future)

---

### Step 3: Publish Request

### API

```http id="d2x9qp"
POST /requests/draft
PATCH /requests/{id}/publish
```

---

## BA-201 — Image Upload Integration

### Features

* Multiple images
* Compression before upload
* Gallery + camera support

---

## BA-202 — Location Picker

### Features

* GPS auto-detect
* Manual selection
* City-based tagging

---

## BA-203 — Draft Saving

### Description

Auto-save request while typing.

---

## BA-204 — Request Publish Confirmation

---

# EPIC BA-3 — Home Dashboard

---

## BA-300 — Active Requests Feed

### Description

List of buyer’s active requests.

---

## BA-301 — Request Status Tracking

### States

* Draft
* Active
* Has bids
* Completed
* Cancelled

---

## BA-302 — Request Analytics Card

### Info

* Number of bids
* Lowest price
* Time remaining

---

## BA-303 — Trending Categories (Future)

---

# EPIC BA-4 — Bid Management

---

## BA-400 — View Bids for Request

### API

```http id="r1b8kq"
GET /bids/request/{requestId}
```

---

## BA-401 — Bid Comparison UI

### Features

* Sort by price
* Sort by delivery time
* Sort by merchant rating

---

## BA-402 — Accept Bid Flow

### Flow

1. Tap bid
2. Confirm acceptance
3. Lock request

---

## BA-403 — Reject Bid Flow

---

## BA-404 — Bid Details Screen

### Info

* Price
* Merchant profile
* Delivery time
* Chat button

---

# EPIC BA-5 — Chat System

---

## BA-500 — Chat List Screen

### Description

List of all active conversations.

---

## BA-501 — Real-Time Chat Screen

### Features

* Socket.io connection
* Typing indicator
* Read receipts

---

## BA-502 — Message Types Support

* Text
* Image
* Location
* System messages

---

## BA-503 — Media Upload in Chat

---

## BA-504 — Message Delivery Status

---

## BA-505 — Offline Message Sync

---

# EPIC BA-6 — Notifications

---

## BA-600 — Push Notification Integration

### Firebase Cloud Messaging

---

## BA-601 — In-App Notifications Center

---

## BA-602 — Notification Deep Linking

### Examples

* Open bid
* Open chat
* Open request

---

## BA-603 — Notification Preferences

---

# EPIC BA-7 — Profile & Wallet

---

## BA-700 — Buyer Profile Screen

---

## BA-701 — Wallet Balance Screen (Optional)

---

## BA-702 — Transaction History (Optional)

---

## BA-703 — Account Settings

---

# EPIC BA-8 — Real-Time System

---

## BA-800 — Socket Connection Manager

---

## BA-801 — Event Listener System

### Events

* bid updates
* chat messages
* request updates

---

## BA-802 — Reconnect Strategy

---

## BA-803 — Offline Mode Handling

---

# EPIC BA-9 — UX & Performance

---

## BA-900 — Skeleton Loading UI

---

## BA-901 — Image Optimization Pipeline

---

## BA-902 — Pagination System

---

## BA-903 — Cache Layer (Offline First)

---

## BA-904 — App Startup Optimization

---

# EPIC BA-10 — Security

---

## BA-1000 — JWT Secure Storage

---

## BA-1001 — API Request Signing (Optional)

---

## BA-1002 — Anti-Tampering Protection

---

## BA-1003 — Secure Media Handling

---

# EPIC BA-11 — Observability

---

## BA-1100 — Crash Reporting (Firebase Crashlytics)

---

## BA-1101 — Analytics Integration

### Events

* request created
* bid accepted
* chat opened

---

## BA-1102 — Performance Monitoring

---

# EPIC BA-12 — Testing

---

## BA-1200 — Unit Tests

---

## BA-1201 — Widget Tests

---

## BA-1202 — Integration Tests

---

## BA-1203 — E2E User Flow Tests

### Core Flows

* Create request
* Receive bids
* Accept bid
* Chat with merchant

---

# EPIC BA-13 — Deployment

---

## BA-1300 — App Build Pipeline

---

## BA-1301 — Play Store Release Pipeline

---

## BA-1302 — App Store Release Pipeline

---

## BA-1303 — Feature Flags System

---

# Key User Flows (Critical Paths)

---

## Flow 1 — Post Request (Core Value)

1. Open app
2. Select category
3. Add description + images
4. Publish
5. Receive bids

---

## Flow 2 — Accept Offer

1. Open request
2. View bids
3. Compare offers
4. Accept best bid
5. Chat starts

---

## Flow 3 — Real-Time Chat

1. Open chat
2. Send message
3. Receive merchant reply instantly

---

## Flow 4 — Notification Loop

1. Merchant sends bid
2. Buyer receives push
3. Opens bid screen

---

# Folder Architecture (Final Recommended)

```text id="k9x2mp"
lib/
├── core/
│   ├── network/
│   ├── storage/
│   ├── sockets/
│   ├── config/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── requests/
│   ├── bids/
│   ├── chat/
│   ├── notifications/
│   ├── wallet/
│   ├── profile/
│   └── settings/
│
├── shared/
│   ├── widgets/
│   ├── models/
│   └── constants/
│
└── main.dart
```

---

# Sprint Breakdown

| Sprint   | Scope                   |
| -------- | ----------------------- |
| Sprint 1 | Auth + App Foundation   |
| Sprint 2 | Request Creation (Core) |
| Sprint 3 | Bid Viewing             |
| Sprint 4 | Bid Acceptance          |
| Sprint 5 | Chat System             |
| Sprint 6 | Notifications           |
| Sprint 7 | Optimization + Offline  |
| Sprint 8 | QA + Release            |

---

# Definition of Done (DoD)

Feature is complete only if:

* Connected to real backend
* Works on both iOS + Android
* Handles offline state
* Has loading + error states
* Tested on real devices
* No UI blocking issues
* Push notifications working
* Socket reconnect stable

---