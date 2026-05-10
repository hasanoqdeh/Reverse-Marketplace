
# Merchant Mobile App Backlog

## “Real-Time Bidding & Fast Deal Closing” Experience

App Name:

```text id="m1q8vp"
merchant-mobile-app
```

Primary Responsibility:

* Receive real-time buyer requests
* Submit competitive bids instantly
* Manage active bids & deals
* Chat with buyers
* Track earnings & wallet
* Subscription management
* Performance analytics

Target Platforms:

* Android
* iOS

Recommended Stack:

* Kotlin Multiplatform – Build Cross-Platform Apps (recommended)
* Socket.io client (real-time bids)
* Dio (API layer)
* Firebase Cloud Messaging
* Secure Storage
* Hive / SQLite (offline cache)

---

# Product Positioning

This app is NOT a browsing app.

It is:

* A **live bidding terminal**
* A **sales acceleration tool**
* A **deal execution system**

Think:

> “WhatsApp + Fiverr + Stock trading terminal for merchants”

---

# Core UX Principles

* ⚡ Speed first (bid in < 10 seconds)
* 📡 Real-time everything (no refresh needed)
* 💰 Profit visibility (merchant knows earnings instantly)
* 🎯 High intent only (no browsing, only buyers ready to purchase)

---

# App Architecture

```text id="b8x1kr"
lib/
├── core/
├── features/
│   ├── auth/
│   ├── requests_feed/
│   ├── bidding/
│   ├── deals/
│   ├── chat/
│   ├── wallet/
│   ├── subscription/
│   ├── analytics/
│   └── profile/
├── shared/
└── main.dart
```

---

# EPIC MA-0 — Foundation Layer

---

## MA-001 — App Initialization

### Description

Setup scalable Kotlin Multiplatform – Build Cross-Platform Apps architecture for merchant operations.

### Acceptance Criteria

* Clean architecture enforced
* Multi-environment config (dev/staging/prod)
* API Gateway connected
* Error handling system ready

---

## MA-002 — API Client Setup

### Requirements

* JWT interceptor
* Retry mechanism
* Timeout handling
* Request logging

---

## MA-003 — Secure Storage

### Stores

* JWT token
* Refresh token
* Merchant profile cache

---

## MA-004 — Socket Connection Manager

### Purpose

Real-time request + bid updates

### Features

* Auto reconnect
* Connection health tracking
* Event dispatcher

---

# EPIC MA-1 — Authentication & Merchant Identity

---

## MA-100 — Phone Login Screen

### Flow

1. Enter phone
2. OTP verification
3. Login

---

## MA-101 — Merchant Verification Gate

### Description

Block unverified merchants.

### Rules

* Only verified merchants can bid
* Pending merchants see “verification required”

---

## MA-102 — Role Enforcement (MERCHANT ONLY)

---

## MA-103 — Session Persistence

---

# EPIC MA-2 — Live Requests Feed (Core Feature)

---

## MA-200 — Real-Time Requests Feed

### Description

Live stream of buyer requests.

### API

```http id="p4k9sn"
GET /requests/active
```

### Features

* Auto refresh via WebSocket
* Category filters
* Location filters
* Distance-based sorting

---

## MA-201 — Request Detail View

### Shows

* Description
* Images
* Location
* Time posted
* Existing bids count

---

## MA-202 — Request Priority Scoring

### Logic

* High budget requests first
* Nearby requests first
* Active bidding competition priority

---

## MA-203 — Request Expiry Timer

---

## MA-204 — Request Save (Watch List)

---

# EPIC MA-3 — Bidding System (CORE VALUE ENGINE)

---

## MA-300 — Submit Bid Screen

### API

```http id="x3b7qp"
POST /bids
```

### Fields

* Price
* Delivery time
* Notes
* Warranty option

---

## MA-301 — One-Click Quick Bid

### Feature

Predefined bid templates:

* Cheap offer
* Premium offer
* Fast delivery offer

---

## MA-302 — Bid Validation Rules

### Rules

* Cannot bid twice on same request
* Must have wallet balance (if fee enabled)
* Must be active merchant

---

## MA-303 — Bid Status Tracker

### Status

* Pending
* Accepted
* Rejected
* Expired

---

## MA-304 — Competitive Bid View

### Feature

See:

* Lowest bid
* Average market price
* Competition count

---

## MA-305 — Auto Suggest Pricing (AI Ready)

---

# EPIC MA-4 — Deal Management

---

## MA-400 — Active Deals Dashboard

### Description

All accepted bids (converted deals)

---

## MA-401 — Deal Lifecycle Tracking

### Stages

* Accepted
* In progress
* Completed

---

## MA-402 — Mark Deal as Completed

---

## MA-403 — Request Completion Confirmation

---

# EPIC MA-5 — Chat System

---

## MA-500 — Buyer-Merchant Chat List

---

## MA-501 — Real-Time Chat Screen

### Features

* Socket.io messaging
* Typing indicator
* Read receipts

---

## MA-502 — Image + File Sharing

---

## MA-503 — Quick Reply Templates

### Examples

* “Available”
* “Yes in stock”
* “Delivery today”

---

## MA-504 — Chat-to-Deal Linking

---

# EPIC MA-6 — Wallet System

---

## MA-600 — Merchant Wallet Dashboard

---

## MA-601 — Wallet Balance Tracking

---

## MA-602 — Transaction History

### API

```http id="k7v2md"
GET /wallet/transactions
```

---

## MA-603 — Bid Fee Deduction View

---

## MA-604 — Low Balance Warning System

---

# EPIC MA-7 — Subscription System (Revenue Core)

---

## MA-700 — Subscription Plans Screen

### Plans

* FREE
* BASIC
* PRO
* ENTERPRISE

---

## MA-701 — Upgrade Subscription Flow

---

## MA-702 — Subscription Status Indicator

---

## MA-703 — Feature Unlock System

### Example

* Premium visibility in feed
* Lower bid fees
* Priority matching

---

## MA-704 — Subscription Expiry Alerts

---

# EPIC MA-8 — Notifications (Critical)

---

## MA-800 — Real-Time Bid Notifications

### Events

* new request
* bid accepted
* bid rejected

---

## MA-801 — Push Notifications (FCM)

---

## MA-802 — Notification Center

---

## MA-803 — Deep Linking System

### Routes

* Open request
* Open chat
* Open bid

---

# EPIC MA-9 — Analytics Dashboard (Merchant Intelligence)

---

## MA-900 — Earnings Overview

---

## MA-901 — Conversion Rate Tracking

### Metrics

* bids sent → accepted ratio

---

## MA-902 — Best Performing Categories

---

## MA-903 — Revenue per Day / Week / Month

---

## MA-904 — Competition Insights

---

# EPIC MA-10 — Performance Optimization

---

## MA-1000 — Request Feed Virtualization

---

## MA-1001 — Image Lazy Loading

---

## MA-1002 — Socket Optimization

---

## MA-1003 — Offline Mode (Cache Requests)

---

## MA-1004 — Background Sync

---

# EPIC MA-11 — Security

---

## MA-1100 — JWT Secure Handling

---

## MA-1101 — Anti Fake Bid Protection

---

## MA-1102 — Request Integrity Validation

---

## MA-1103 — Secure Media Uploads

---

# EPIC MA-12 — Observability

---

## MA-1200 — Crash Reporting (Firebase)

---

## MA-1201 — Analytics Tracking

### Events

* request viewed
* bid submitted
* bid accepted

---

## MA-1202 — Performance Metrics Tracking

---

# EPIC MA-13 — Testing

---

## MA-1300 — Unit Tests

---

## MA-1301 — Widget Tests

---

## MA-1302 — Integration Tests

---

## MA-1303 — End-to-End Tests

### Core Flows

* receive request → bid → accepted → chat

---

# EPIC MA-14 — Deployment

---

## MA-1400 — Build Pipeline Setup

---

## MA-1401 — Play Store Release

---

## MA-1402 — App Store Release

---

## MA-1403 — Feature Flags System

---

# Critical User Flows

---

## Flow 1 — Receive & Bid (Core Revenue Flow)

1. Merchant opens app
2. Live request appears
3. Opens request
4. Submits bid
5. Waits for acceptance

---

## Flow 2 — Winning a Deal

1. Bid accepted
2. Notification received
3. Chat opens
4. Deal starts

---

## Flow 3 — Real-Time Reaction Loop

1. New request arrives
2. Merchant reacts instantly
3. Competitive bidding happens

---

## Flow 4 — Earnings Tracking

1. Deal completed
2. Wallet updated
3. Analytics updated

---

# Folder Structure (Final)

```text id="m9v2kp"
lib/
├── core/
│   ├── network/
│   ├── sockets/
│   ├── storage/
│   ├── config/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── requests_feed/
│   ├── bidding/
│   ├── deals/
│   ├── chat/
│   ├── wallet/
│   ├── subscription/
│   ├── analytics/
│   └── profile/
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

| Sprint   | Scope                    |
| -------- | ------------------------ |
| Sprint 1 | Auth + Setup             |
| Sprint 2 | Live Requests Feed       |
| Sprint 3 | Bidding System           |
| Sprint 4 | Chat System              |
| Sprint 5 | Deals Management         |
| Sprint 6 | Wallet System            |
| Sprint 7 | Subscription System      |
| Sprint 8 | Analytics + Optimization |
| Sprint 9 | QA + Release             |

---

# Definition of Done (DoD)

A feature is ONLY done if:

* Works in real-time
* Tested with real socket events
* Handles offline reconnect
* Has loading + empty states
* No UI lag under load
* Connected to real backend
* Metrics tracked
* Crash-free in staging

---