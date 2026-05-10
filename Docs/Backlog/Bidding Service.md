
# Bidding Service Backlog

## Merchant Bidding & Offer Management Service

Service Name:

```text id="6v3z1q"
bidding-service
```

Primary Responsibility:

* Merchant bid submission
* Offer lifecycle management
* Bid comparison
* Bid acceptance/rejection
* Bid analytics
* Merchant bidding history
* Buyer bid viewing
* Bid expiration handling

Recommended Stack:

* NestJS
* MongoDB
* Mongoose
* RabbitMQ
* Redis
* BullMQ
* Prometheus

---

# Service Boundaries

## Owns

* Bids
* Bid status lifecycle
* Merchant offer history
* Bid analytics
* Bid expiration logic

## Publishes Events

* bid.submitted
* bid.accepted
* bid.rejected
* bid.expired
* bid.withdrawn

## Consumes Events

* request.created
* request.completed
* request.cancelled
* request.closed
* merchant.match.failed
* user.banned

---

# Core Business Rules

---

## Merchant Rules

* Only MERCHANT can submit bids.
* Merchant can submit only one active bid per request.
* Merchant cannot bid on own requests.
* Banned merchants cannot submit bids.

---

## Request Rules

* Only ACTIVE requests accept bids.
* COMPLETED/CANCELLED requests locked.
* Expired requests reject new bids.

---

## Bid Rules

* Bid must contain price.
* Bid may contain notes/images.
* Bid expiration configurable.
* Accepted bid locks request.

---

# MongoDB Collections Overview

---

# bids

| Field        | Type       |
| ------------ | ---------- |
| _id          | ObjectId   |
| requestId    | UUID       |
| buyerId      | UUID       |
| merchantId   | UUID       |
| price        | Decimal128 |
| currency     | String     |
| deliveryTime | String     |
| notes        | String     |
| images       | Array      |
| status       | Enum       |
| expiresAt    | Date       |
| createdAt    | Date       |
| updatedAt    | Date       |

---

# bid_status_history

| Field     | Type     |
| --------- | -------- |
| _id       | ObjectId |
| bidId     | ObjectId |
| oldStatus | String   |
| newStatus | String   |
| changedBy | UUID     |
| changedAt | Date     |

---

# bid_analytics

| Field        | Type       |
| ------------ | ---------- |
| _id          | ObjectId   |
| requestId    | UUID       |
| totalBids    | Number     |
| avgPrice     | Decimal128 |
| lowestPrice  | Decimal128 |
| highestPrice | Decimal128 |

---

# ENUM bid_status

```text id="oaq2qt"
PENDING
ACCEPTED
REJECTED
EXPIRED
WITHDRAWN
AUTO_REJECTED
```

---

# EPIC BID-0 — Service Foundation

---

# FEATURE BID-0.1 — Service Initialization

---

## BID-001 — Initialize Bidding Service

### Priority

Critical

### Acceptance Criteria

* NestJS initialized
* Healthcheck operational
* Swagger configured
* Config validation enabled

---

## BID-002 — Setup MongoDB Connection

### Acceptance Criteria

* Replica set supported
* Retry logic enabled
* Connection pooling enabled

---

## BID-003 — Setup RabbitMQ Integration

### Acceptance Criteria

* Producer operational
* Consumer operational
* DLQ configured

---

## BID-004 — Setup Redis Integration

### Acceptance Criteria

* Bid caching operational
* Locks supported

---

## BID-005 — Configure Structured Logging

### Acceptance Criteria

* Correlation IDs enabled
* JSON logs enabled

---

# FEATURE BID-0.2 — Database Setup

---

## BID-010 — Create Bid Schema

### Acceptance Criteria

* Indexes configured
* Validation rules implemented

### Required Indexes

* requestId
* merchantId
* buyerId
* status
* createdAt

---

## BID-011 — Create Bid Status History Schema

---

## BID-012 — Create Bid Analytics Schema

---

## BID-013 — Setup Mongoose Models

---

# EPIC BID-1 — Bid Submission

---

# FEATURE BID-1.1 — Submit Bid

---

## BID-100 — Create Submit Bid Endpoint

### Endpoint

```http id="ywxy6k"
POST /bids
```

### Description

Allow merchant to submit offer for request.

### Acceptance Criteria

* MERCHANT role required
* Request must be ACTIVE
* One active bid per merchant
* Validation applied

### Request Body

```json id="7if7tg"
{
  "requestId": "",
  "price": 120,
  "currency": "OMR",
  "deliveryTime": "2 hours",
  "notes": "Original spare part"
}
```

---

## BID-101 — Request Validation Consumer

### Description

Validate request state before accepting bid.

### Acceptance Criteria

* Request existence verified
* Request ACTIVE validation

---

## BID-102 — Double Bid Prevention

### Acceptance Criteria

* Prevent duplicate active bids
* Redis locking support

---

## BID-103 — Merchant Eligibility Validation

### Acceptance Criteria

* Merchant verified
* Merchant not banned
* Merchant trust score valid

---

## BID-104 — Bid Price Validation

### Acceptance Criteria

* Positive price only
* Currency validation
* Decimal precision validation

---

# FEATURE BID-1.2 — Bid Attachments

---

## BID-110 — Upload Bid Images

### Endpoint

```http id="7clg04"
POST /bids/{id}/images
```

### Acceptance Criteria

* Multi-image upload
* Secure uploads
* Compression enabled

---

## BID-111 — Signed Upload URL Support

---

## BID-112 — Image Validation

---

# EPIC BID-2 — Bid Lifecycle

---

# FEATURE BID-2.1 — Bid Status Management

---

## BID-200 — Update Bid Status Endpoint

### Endpoint

```http id="x72m3o"
PATCH /bids/{id}/status
```

### Allowed Transitions

```text id="1mlph2"
PENDING -> ACCEPTED
PENDING -> REJECTED
PENDING -> EXPIRED
PENDING -> WITHDRAWN
```

---

## BID-201 — Bid Status Validator

---

## BID-202 — Store Bid Status History

---

# FEATURE BID-2.2 — Bid Acceptance Flow

---

## BID-210 — Accept Bid Logic

### Acceptance Criteria

* Buyer-only action
* Bid becomes ACCEPTED
* Other bids AUTO_REJECTED
* Request locked

---

## BID-211 — Emit bid.accepted Event

### Payload

```json id="xrtzsr"
{
  "bidId": "",
  "requestId": "",
  "buyerId": "",
  "merchantId": "",
  "price": 120
}
```

---

## BID-212 — Auto Reject Other Bids

### Acceptance Criteria

* Remaining bids AUTO_REJECTED
* Events emitted

---

## BID-213 — Emit bid.rejected Event

---

# FEATURE BID-2.3 — Bid Expiration

---

## BID-220 — Bid Expiration Scheduler

### Acceptance Criteria

* Expired bids updated automatically
* Events emitted

---

## BID-221 — Emit bid.expired Event

---

## BID-222 — Merchant Withdrawal Support

### Endpoint

```http id="fv8gsk"
PATCH /bids/{id}/withdraw
```

---

# EPIC BID-3 — Buyer Bid Viewing

---

# FEATURE BID-3.1 — Request Bids API

---

## BID-300 — Get Request Bids Endpoint

### Endpoint

```http id="sk6gnr"
GET /bids/request/{requestId}
```

### Acceptance Criteria

* Buyer-only access
* Sorting supported
* Pagination supported

### Sorting

* Lowest price
* Highest trust score
* Fastest delivery
* Latest

---

## BID-301 — Bid Comparison Aggregation

### Acceptance Criteria

* Avg price calculated
* Lowest/highest displayed

---

## BID-302 — Bid Ranking Algorithm

### Inputs

* Price
* Merchant trust score
* Delivery speed

---

# FEATURE BID-3.2 — Bid Details

---

## BID-310 — Get Single Bid Details

### Endpoint

```http id="o0j82r"
GET /bids/{id}
```

---

## BID-311 — Merchant Profile Snapshot

### Acceptance Criteria

* Trust score included
* Merchant verification badge included

---

# EPIC BID-4 — Merchant Dashboard

---

# FEATURE BID-4.1 — Merchant Sent Bids

---

## BID-400 — Get My Bids Endpoint

### Endpoint

```http id="0f2ct1"
GET /bids/my-bids
```

### Acceptance Criteria

* Merchant-only access
* Filters supported
* Pagination supported

### Filters

* PENDING
* ACCEPTED
* REJECTED
* EXPIRED

---

## BID-401 — Merchant Bid Search

---

## BID-402 — Merchant Bid Analytics

### Metrics

* Acceptance rate
* Avg response time
* Avg bid price

---

# FEATURE BID-4.2 — Merchant Notifications

---

## BID-410 — Bid Status Change Notifications

---

## BID-411 — Bid Viewed Tracking

---

# EPIC BID-5 — Bid Analytics

---

# FEATURE BID-5.1 — Analytics Aggregation

---

## BID-500 — Bid Analytics Engine

### Metrics

* Avg bid count/request
* Avg winning price
* Merchant success rate

---

## BID-501 — Real-Time Bid Counters

---

## BID-502 — Bid Heatmaps (Future)

---

# FEATURE BID-5.2 — Reporting

---

## BID-510 — Top Merchant Reports

---

## BID-511 — Category Pricing Reports

---

# EPIC BID-6 — Event Consumption

---

# FEATURE BID-6.1 — Request Events

---

## BID-600 — Consume request.created Event

### Acceptance Criteria

* Request cache initialized

---

## BID-601 — Consume request.completed Event

### Acceptance Criteria

* Reject new bids
* Lock request

---

## BID-602 — Consume request.cancelled Event

---

## BID-603 — Consume request.closed Event

---

# FEATURE BID-6.2 — User Moderation Events

---

## BID-610 — Consume user.banned Event

### Acceptance Criteria

* Reject merchant bidding

---

# EPIC BID-7 — Moderation & Fraud Prevention

---

# FEATURE BID-7.1 — Fraud Detection

---

## BID-700 — Price Abuse Detection

### Acceptance Criteria

* Unrealistic pricing flagged

---

## BID-701 — Bid Spam Detection

---

## BID-702 — Duplicate Content Detection

---

# FEATURE BID-7.2 — Bid Moderation

---

## BID-710 — Admin Bid Review Endpoint

---

## BID-711 — Block Fraudulent Merchant Bids

---

# EPIC BID-8 — Observability & Monitoring

---

# FEATURE BID-8.1 — Metrics

---

## BID-800 — Prometheus Metrics

### Metrics

* Bid submission rate
* Bid acceptance rate
* Avg bid response time
* Expired bids count

---

## BID-801 — Distributed Tracing

---

## BID-802 — Healthcheck Endpoint

### Endpoint

```http id="im6w6f"
GET /health
```

---

# FEATURE BID-8.2 — Alerting

---

## BID-810 — MongoDB Failure Alerts

---

## BID-811 — Queue Failure Alerts

---

## BID-812 — High Bid Failure Rate Alerts

---

# EPIC BID-9 — Security Hardening

---

# FEATURE BID-9.1 — API Security

---

## BID-900 — RBAC Enforcement

---

## BID-901 — Ownership Validation

---

## BID-902 — Input Sanitization

---

## BID-903 — API Rate Limiting

---

# FEATURE BID-9.2 — Data Integrity

---

## BID-910 — Distributed Locking

### Acceptance Criteria

* Redis locks for bid acceptance
* Prevent race conditions

---

## BID-911 — Idempotent Event Publishing

---

# EPIC BID-10 — Testing & QA

---

# FEATURE BID-10.1 — Unit Testing

---

## BID-1000 — Bid Submission Tests

---

## BID-1001 — Bid Acceptance Tests

---

## BID-1002 — Bid Ranking Tests

---

# FEATURE BID-10.2 — Integration Testing

---

## BID-1010 — MongoDB Integration Tests

---

## BID-1011 — RabbitMQ Integration Tests

---

## BID-1012 — Redis Locking Tests

---

# FEATURE BID-10.3 — Load Testing

---

## BID-1020 — Concurrent Bid Submission Test

### Goal

5,000 concurrent bids.

---

## BID-1021 — Bid Acceptance Race Condition Test

---

## BID-1022 — MongoDB Stress Test

---

# FEATURE BID-10.4 — E2E Testing

---

## BID-1030 — Full Bid Submission Flow

### Scenario

* Merchant receives request
* Merchant submits bid
* Buyer receives bid

---

## BID-1031 — Bid Acceptance Flow

### Scenario

* Buyer accepts bid
* Request locked
* Other bids rejected

---

## BID-1032 — Bid Expiration Flow

---

# Recommended Folder Structure

```text id="d14u2m"
/services/bidding-service
├── src/
│   ├── modules/
│   │   ├── bids/
│   │   ├── analytics/
│   │   ├── moderation/
│   │   ├── ranking/
│   │   ├── notifications/
│   │   └── dashboard/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── mongodb/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   └── logger/
│   │
│   ├── config/
│   └── main.ts
│
├── test/
└── Dockerfile
```

---

# Recommended Sprint Breakdown

| Sprint   | Scope                  |
| -------- | ---------------------- |
| Sprint 1 | Foundation + MongoDB   |
| Sprint 2 | Bid Submission         |
| Sprint 3 | Bid Lifecycle          |
| Sprint 4 | Buyer Bid Viewing      |
| Sprint 5 | Merchant Dashboard     |
| Sprint 6 | Analytics + Moderation |
| Sprint 7 | Security + Monitoring  |
| Sprint 8 | QA + Hardening         |

---

# Definition of Done (DoD)

Task is DONE only if:

* Swagger documented
* Tests written
* Metrics added
* Logs added
* Event contracts documented
* RBAC enforced
* Race conditions tested
* Monitoring enabled
* CI pipeline passing

---