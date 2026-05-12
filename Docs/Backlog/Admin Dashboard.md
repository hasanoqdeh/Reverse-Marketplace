
# Admin Dashboard Backlog

## “Control Tower for the Entire Reverse Marketplace”

App Name:

```text id="ad1k8qp"
admin-dashboard
```

Primary Responsibility:

* Monitor entire marketplace in real-time
* Manage users (buyers + merchants)
* Approve/ban merchants
* Observe requests & bids flow
* Resolve disputes
* Monitor revenue & payments
* System health monitoring
* Audit everything (full traceability)

Target Type:

* Web Application (Desktop-first)

Recommended Stack:

* Next.js (React)
* TailwindCSS
* React Query
* WebSockets (Socket.io)
* Recharts / ECharts
* Auth (JWT + RBAC)
* Role-based access system

---

# Product Vision

This is NOT a normal admin panel.

It is:

> A **real-time financial + marketplace control system**

Like:

* Stripe Dashboard
* Uber Control Center
* Amazon Ops Console

All combined.

---

# System Roles (RBAC Model)

```text id="rbac1"
ADMIN
SUPPORT_AGENT
FINANCE_MANAGER
OPERATIONS_MANAGER
SYSTEM_VIEWER
```

---

# Core Modules Structure

```text id="adm9xq"
apps/admin-dashboard/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── merchants/
│   │   ├── requests/
│   │   ├── bids/
│   │   ├── payments/
│   │   ├── disputes/
│   │   ├── analytics/
│   │   ├── system-health/
│   │   └── audit-logs/
│   ├── components/
│   ├── layouts/
│   └── pages/
```

---

# EPIC AD-0 — Foundation Layer

---

## AD-001 — Admin Authentication System

### Description

Secure login system for internal staff only.

### Features

* JWT authentication
* Role-based login
* 2FA (optional)
* Session timeout

---

## AD-002 — Admin Layout System

### Includes

* Sidebar navigation
* Top status bar
* Notification center
* Global search

---

## AD-003 — Permission Middleware (RBAC)

### Rules

* Route-level protection
* Component-level permissions
* API access control

---

## AD-004 — Global API Layer

---

## AD-005 — WebSocket Admin Channel

### Purpose

Real-time system monitoring

---

# EPIC AD-1 — Real-Time Marketplace Monitoring

---

## AD-100 — Live Requests Feed

### Description

See every request created in real-time.

### Features

* Auto-refresh via WebSocket
* Filters:

  * Category
  * Location
  * Status
* Request lifecycle tracking

---

## AD-101 — Request Detail Inspector

### Shows

* Buyer info
* Images
* Location
* All bids
* Timeline events

---

## AD-102 — Request Heatmap (Oman Map)

### Features

* Geographic demand visualization
* Hot zones per category

---

## AD-103 — Request Status Timeline

---

# EPIC AD-2 — User Management System

---

## AD-200 — User List (Buyers & Merchants)

### Features

* Search
* Filter by role
* Status (active/banned/pending)

---

## AD-201 — User Profile Inspector

### Shows

* Activity history
* Requests created
* Bids submitted
* Wallet balance

---

## AD-202 — Ban / Unban Users

---

## AD-203 — Merchant Verification System

### Features

* Upload documents review
* Approval workflow
* Manual verification

---

## AD-204 — Trust Score System Viewer

---

# EPIC AD-3 — Merchant Management

---

## AD-300 — Merchant Overview Dashboard

### Metrics

* Active merchants
* Bid rate
* Conversion rate

---

## AD-301 — Merchant Performance Ranking

---

## AD-302 — Merchant Category Distribution

---

## AD-303 — Merchant Subscription Status

---

## AD-304 — Merchant Activity Timeline

---

# EPIC AD-4 — Bidding System Monitoring

---

## AD-400 — Live Bids Feed

### Features

* Real-time bid stream
* Request → bid mapping

---

## AD-401 — Bid Inspector

### Shows

* Bid amount
* Merchant info
* Timestamp
* Status

---

## AD-402 — Fraud Detection Panel

### Rules

* Spam bidding detection
* Duplicate bid detection
* Abnormal pricing patterns

---

## AD-403 — Bid Acceptance Tracking

---

# EPIC AD-5 — Payment & Revenue Control

---

## AD-500 — Revenue Dashboard

### Metrics

* Daily revenue
* Monthly revenue
* Subscription revenue
* Bid fees

---

## AD-501 — Wallet Transactions Monitor

---

## AD-502 — Payment Gateway Logs

### Includes

* Stripe logs
* Thawani logs
* Failures
* retries

---

## AD-503 — Refund Management Panel

---

## AD-504 — Financial Reconciliation Tool

---

# EPIC AD-6 — Disputes & Support System

---

## AD-600 — Dispute Ticket System

### Flow

* Buyer opens dispute
* Admin reviews
* Decision taken

---

## AD-601 — Chat Inspection Tool

### Admin access to chats (restricted)

---

## AD-602 — Evidence Viewer

* Images
* Messages
* Logs

---

## AD-603 — Resolution Actions

* Refund
* Ban user
* Reverse transaction

---

# EPIC AD-7 — System Analytics

---

## AD-700 — Marketplace Overview Dashboard

### KPIs

* Active users
* Active requests
* Conversion rate
* Average bid price

---

## AD-701 — Category Trends

### Shows

* Most requested categories
* Seasonal demand patterns

---

## AD-702 — Geographic Analytics

---

## AD-703 — Merchant vs Buyer Ratio

---

## AD-704 — Revenue Per Category

---

# EPIC AD-8 — System Health Monitoring

---

## AD-800 — Microservices Health Dashboard

### Services

* Identity
* Request
* Matching
* Bidding
* Payment
* Chat

---

## AD-801 — API Latency Monitor

---

## AD-802 — Error Rate Tracking

---

## AD-803 — RabbitMQ Queue Monitoring

---

## AD-804 — Redis Health Monitoring

---

## AD-805 — Database Load Monitoring

---

# EPIC AD-9 — Audit & Compliance

---

## AD-900 — Audit Log Explorer

### Tracks

* Admin actions
* Financial actions
* User changes

---

## AD-901 — Security Event Logs

---

## AD-902 — Data Change History

---

## AD-903 — Compliance Reports Export

---

# EPIC AD-10 — Notifications Center

---

## AD-1000 — System Alerts Panel

### Events

* service down
* high latency
* payment failure spike

---

## AD-1001 — Admin Alerts Routing

---

## AD-1002 — Email + Slack Integration

---

# EPIC AD-11 — Configuration Management

---

## AD-1100 — Category Management

---

## AD-1101 — Pricing Rules (Bid Fees)

---

## AD-1102 — Subscription Plan Editor

---

## AD-1103 — Feature Flag System

---

# EPIC AD-12 — Search & Intelligence

---

## AD-1200 — Global Search Engine

### Search

* Users
* Requests
* Bids
* Transactions

---

## AD-1201 — AI Insights Panel (Future)

---

# EPIC AD-13 — Security Layer

---

## AD-1300 — Admin Activity Logging

---

## AD-1301 — IP Whitelisting

---

## AD-1302 — 2FA Enforcement

---

## AD-1303 — Session Control

---

# EPIC AD-14 — Performance & UX

---

## AD-1400 — Dashboard Lazy Loading

---

## AD-1401 — Real-Time Widgets

---

## AD-1402 — Skeleton Loaders

---

## AD-1403 — Data Pagination System

---

# EPIC AD-15 — Testing

---

## AD-1500 — Unit Tests

---

## AD-1501 — Integration Tests

---

## AD-1502 — RBAC Security Tests

---

## AD-1503 — Load Testing Dashboard

---

# EPIC AD-16 — Deployment

---

## AD-1600 — CI/CD Pipeline

---

## AD-1601 — Staging Environment

---

## AD-1602 — Production Deployment Strategy

---

## AD-1603 — Feature Flags Control

---

# Critical Admin Workflows

---

## Workflow 1 — Monitor Live Market

1. Open dashboard
2. Watch requests stream
3. Observe bidding activity
4. Detect anomalies

---

## Workflow 2 — Resolve Dispute

1. Open dispute
2. Review chat + evidence
3. Decide outcome
4. Apply refund or penalty

---

## Workflow 3 — Merchant Management

1. Review merchant
2. Check performance
3. Approve or ban

---

## Workflow 4 — Revenue Tracking

1. Check daily revenue
2. Analyze categories
3. Export report

---

# Folder Architecture (Final)

```text id="adm-final"
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── merchants/
│   ├── requests/
│   ├── bids/
│   ├── payments/
│   ├── disputes/
│   ├── analytics/
│   ├── system-health/
│   └── audit/
│
├── components/
├── hooks/
├── services/
├── utils/
├── layouts/
└── pages/
```

---

# Sprint Breakdown

| Sprint    | Scope                 |
| --------- | --------------------- |
| Sprint 1  | Auth + Layout + RBAC  |
| Sprint 2  | Live Requests Monitor |
| Sprint 3  | Users + Merchants     |
| Sprint 4  | Bids Monitoring       |
| Sprint 5  | Payments Dashboard    |
| Sprint 6  | Disputes System       |
| Sprint 7  | Analytics             |
| Sprint 8  | System Health         |
| Sprint 9  | Audit + Security      |
| Sprint 10 | QA + Production       |

---

# Definition of Done (DoD)

A feature is ONLY complete if:

* Works in real-time
* Fully RBAC protected
* Logged in audit system
* Connected to live backend
* Has filters + pagination
* Has loading + error states
* Tested under load
* No unauthorized access possible

---