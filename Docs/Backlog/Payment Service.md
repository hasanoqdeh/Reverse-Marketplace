
# Payment Service Backlog

## Wallets, Billing, Subscriptions & Transaction Processing

Service Name:

```text id="8e2k1w"
payment-service
```

Primary Responsibility:

* Wallet management
* Merchant balance system
* Bid charging
* Subscription billing
* Payment gateway integrations
* Financial transaction ledger
* Refunds
* Invoices
* Payout tracking

Recommended Stack:

* NestJS
* PostgreSQL
* Redis
* RabbitMQ
* Stripe
* Thawani
* BullMQ
* Prometheus

---

# Service Boundaries

## Owns

* Wallet balances
* Transactions
* Subscriptions
* Invoices
* Refunds
* Payment intents
* Merchant credits
* Financial audit logs

## Publishes Events

* payment.completed
* payment.failed
* wallet.balance.updated
* subscription.activated
* subscription.expired
* payout.created

## Consumes Events

* bid.submitted
* bid.accepted
* user.registered
* user.banned
* request.completed

---

# Core Business Rules

---

## Wallet Rules

* Merchant wallet required before bidding.
* Wallet balance cannot become negative.
* Wallet deductions atomic.
* Ledger immutable.

---

## Subscription Rules

* Merchant subscription required for premium features.
* Expired subscriptions downgrade merchant automatically.
* Trial periods configurable.

---

## Payment Rules

* All gateway callbacks verified.
* Transactions idempotent.
* Refunds logged separately.
* Financial records immutable.

---

## Financial Security Rules

* No direct balance modifications.
* Double-entry accounting required.
* Sensitive payment data never stored locally.

---

# PostgreSQL Schema Overview

---

# wallets

| Column     | Type          |
| ---------- | ------------- |
| id         | UUID          |
| user_id    | UUID          |
| balance    | NUMERIC(12,2) |
| currency   | VARCHAR       |
| status     | VARCHAR       |
| created_at | TIMESTAMP     |

---

# wallet_transactions

| Column         | Type          |
| -------------- | ------------- |
| id             | UUID          |
| wallet_id      | UUID          |
| type           | VARCHAR       |
| amount         | NUMERIC(12,2) |
| balance_before | NUMERIC(12,2) |
| balance_after  | NUMERIC(12,2) |
| reference_id   | UUID          |
| reference_type | VARCHAR       |
| created_at     | TIMESTAMP     |

---

# subscriptions

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| plan_id    | UUID      |
| status     | VARCHAR   |
| started_at | TIMESTAMP |
| expires_at | TIMESTAMP |

---

# payment_intents

| Column             | Type          |
| ------------------ | ------------- |
| id                 | UUID          |
| gateway            | VARCHAR       |
| external_reference | VARCHAR       |
| amount             | NUMERIC(12,2) |
| currency           | VARCHAR       |
| status             | VARCHAR       |
| metadata           | JSONB         |
| created_at         | TIMESTAMP     |

---

# invoices

| Column     | Type          |
| ---------- | ------------- |
| id         | UUID          |
| user_id    | UUID          |
| amount     | NUMERIC(12,2) |
| status     | VARCHAR       |
| pdf_url    | TEXT          |
| created_at | TIMESTAMP     |

---

# refunds

| Column         | Type          |
| -------------- | ------------- |
| id             | UUID          |
| transaction_id | UUID          |
| amount         | NUMERIC(12,2) |
| reason         | TEXT          |
| status         | VARCHAR       |
| created_at     | TIMESTAMP     |

---

# ENUM transaction_type

```text id="1r9f6m"
DEPOSIT
WITHDRAWAL
BID_FEE
SUBSCRIPTION
REFUND
BONUS
PAYOUT
```

---

# EPIC PAY-0 — Service Foundation

---

# FEATURE PAY-0.1 — Service Initialization

---

## PAY-001 — Initialize Payment Service

### Priority

Critical

### Acceptance Criteria

* NestJS initialized
* Swagger operational
* Healthcheck operational
* Config validation enabled

---

## PAY-002 — Setup PostgreSQL Connection

### Acceptance Criteria

* Connection pooling enabled
* Retry logic enabled
* Migrations operational

---

## PAY-003 — Setup RabbitMQ Integration

### Acceptance Criteria

* Producers operational
* Consumers operational
* DLQ configured

---

## PAY-004 — Setup Redis Integration

### Acceptance Criteria

* Distributed locking enabled
* Payment cache operational

---

## PAY-005 — Configure Structured Logging

---

# FEATURE PAY-0.2 — Financial Foundations

---

## PAY-010 — Create Wallet Schema

### Acceptance Criteria

* Unique wallet per user
* Default currency configured

---

## PAY-011 — Create Transaction Ledger Schema

### Acceptance Criteria

* Immutable transaction rows
* Balance snapshots stored

---

## PAY-012 — Create Subscription Schema

---

## PAY-013 — Create Payment Intent Schema

---

## PAY-014 — Create Refund Schema

---

# EPIC PAY-1 — Wallet System

---

# FEATURE PAY-1.1 — Wallet Management

---

## PAY-100 — Auto Create Wallet on User Registration

### Acceptance Criteria

* Consume user.registered event
* Wallet auto-generated

---

## PAY-101 — Get Wallet Endpoint

### Endpoint

```http id="b6r6s0"
GET /wallet
```

---

## PAY-102 — Wallet Balance Validation Service

### Acceptance Criteria

* Prevent negative balances

---

## PAY-103 — Wallet Transaction History Endpoint

### Endpoint

```http id="v0yjrt"
GET /wallet/transactions
```

### Acceptance Criteria

* Pagination supported
* Filtering supported

---

# FEATURE PAY-1.2 — Wallet Charging

---

## PAY-110 — Deposit Funds Endpoint

### Endpoint

```http id="lb5hmg"
POST /wallet/deposit
```

---

## PAY-111 — Withdraw Funds Endpoint

### Endpoint

```http id="h05g5r"
POST /wallet/withdraw
```

---

## PAY-112 — Distributed Wallet Locking

### Acceptance Criteria

* Prevent race conditions

---

# EPIC PAY-2 — Payment Gateway Integration

---

# FEATURE PAY-2.1 — Stripe Integration

---

## PAY-200 — Setup Stripe SDK

---

## PAY-201 — Create Stripe Payment Intent

### Acceptance Criteria

* Secure payment session creation

---

## PAY-202 — Stripe Webhook Verification

### Acceptance Criteria

* Signature validation mandatory

---

## PAY-203 — Handle Stripe Payment Success

---

## PAY-204 — Handle Stripe Payment Failure

---

# FEATURE PAY-2.2 — Thawani Integration

---

## PAY-210 — Setup Thawani SDK/API

### Description

Primary Oman gateway integration.

---

## PAY-211 — Create Thawani Checkout Session

---

## PAY-212 — Verify Thawani Callback

---

## PAY-213 — Handle Thawani Payment Success

---

## PAY-214 — Handle Thawani Payment Failure

---

# FEATURE PAY-2.3 — Unified Gateway Layer

---

## PAY-220 — Payment Provider Abstraction Layer

### Acceptance Criteria

* Stripe/Thawani interchangeable

---

## PAY-221 — Payment Retry Handling

---

# EPIC PAY-3 — Bid Monetization

---

# FEATURE PAY-3.1 — Bid Charging Logic

---

## PAY-300 — Consume bid.submitted Event

### Acceptance Criteria

* Deduct bid fee automatically

---

## PAY-301 — Bid Fee Configuration

### Acceptance Criteria

* Category-based pricing supported

---

## PAY-302 — Insufficient Wallet Balance Handling

### Acceptance Criteria

* Reject bidding
* Notify merchant

---

## PAY-303 — Emit wallet.balance.updated Event

---

# FEATURE PAY-3.2 — Premium Merchant Features

---

## PAY-310 — Sponsored Bid Billing

---

## PAY-311 — Priority Merchant Billing

---

## PAY-312 — Featured Merchant Packages

---

# EPIC PAY-4 — Subscription System

---

# FEATURE PAY-4.1 — Subscription Plans

---

## PAY-400 — Create Subscription Plans

### Plans

* FREE
* BASIC
* PRO
* ENTERPRISE

---

## PAY-401 — Subscribe Merchant Endpoint

### Endpoint

```http id="t1g7sr"
POST /subscriptions/subscribe
```

---

## PAY-402 — Subscription Renewal Logic

---

## PAY-403 — Subscription Expiration Scheduler

---

## PAY-404 — Emit subscription.expired Event

---

# FEATURE PAY-4.2 — Subscription Enforcement

---

## PAY-410 — Premium Feature Validation

---

## PAY-411 — Trial Plan Support

---

## PAY-412 — Usage Quotas

### Examples

* Monthly bids
* Featured listings

---

# EPIC PAY-5 — Refunds & Disputes

---

# FEATURE PAY-5.1 — Refund Processing

---

## PAY-500 — Create Refund Endpoint

### Endpoint

```http id="7goj4v"
POST /refunds
```

---

## PAY-501 — Refund Validation Logic

---

## PAY-502 — Gateway Refund Integration

---

## PAY-503 — Refund Status Tracking

---

# FEATURE PAY-5.2 — Dispute Handling

---

## PAY-510 — Payment Dispute Workflow

---

## PAY-511 — Fraudulent Transaction Detection

---

# EPIC PAY-6 — Invoice & Financial Reporting

---

# FEATURE PAY-6.1 — Invoice System

---

## PAY-600 — Generate Invoice PDF

### Acceptance Criteria

* VAT support
* Arabic invoice support

---

## PAY-601 — Invoice Storage

---

## PAY-602 — Invoice Retrieval Endpoint

### Endpoint

```http id="7it25x"
GET /invoices
```

---

# FEATURE PAY-6.2 — Financial Reports

---

## PAY-610 — Merchant Financial Dashboard

### Metrics

* Spend
* Subscription usage
* Bid fees

---

## PAY-611 — Revenue Analytics

---

## PAY-612 — Daily Financial Reconciliation

---

# EPIC PAY-7 — Security & Compliance

---

# FEATURE PAY-7.1 — Financial Security

---

## PAY-700 — Idempotent Payment Processing

---

## PAY-701 — Double Entry Accounting

### Acceptance Criteria

* Debit + credit records mandatory

---

## PAY-702 — Sensitive Data Protection

### Acceptance Criteria

* PCI-compliant practices

---

## PAY-703 — Audit Log Recording

---

# FEATURE PAY-7.2 — Fraud Prevention

---

## PAY-710 — Transaction Rate Limiting

---

## PAY-711 — Suspicious Activity Detection

---

## PAY-712 — Wallet Abuse Detection

---

# EPIC PAY-8 — Observability & Monitoring

---

# FEATURE PAY-8.1 — Metrics

---

## PAY-800 — Prometheus Metrics

### Metrics

* Payment success rate
* Gateway latency
* Wallet balance updates
* Refund rate
* Failed transactions

---

## PAY-801 — Distributed Tracing

---

## PAY-802 — Healthcheck Endpoint

### Endpoint

```http id="mjlwmx"
GET /health
```

---

# FEATURE PAY-8.2 — Alerting

---

## PAY-810 — Payment Failure Alerts

---

## PAY-811 — Gateway Downtime Alerts

---

## PAY-812 — Financial Reconciliation Alerts

---

# EPIC PAY-9 — Security Hardening

---

# FEATURE PAY-9.1 — API Security

---

## PAY-900 — JWT Validation

---

## PAY-901 — RBAC Enforcement

---

## PAY-902 — API Rate Limiting

---

## PAY-903 — Request Signature Validation

---

# FEATURE PAY-9.2 — Infrastructure Security

---

## PAY-910 — Secrets Management Integration

### Examples

* AWS Secrets Manager
* Vault

---

## PAY-911 — Database Encryption

---

# EPIC PAY-10 — Testing & QA

---

# FEATURE PAY-10.1 — Unit Testing

---

## PAY-1000 — Wallet Service Tests

---

## PAY-1001 — Subscription Logic Tests

---

## PAY-1002 — Refund Logic Tests

---

# FEATURE PAY-10.2 — Integration Testing

---

## PAY-1010 — Stripe Integration Tests

---

## PAY-1011 — Thawani Integration Tests

---

## PAY-1012 — PostgreSQL Transaction Tests

---

## PAY-1013 — Redis Locking Tests

---

# FEATURE PAY-10.3 — Load Testing

---

## PAY-1020 — Concurrent Wallet Updates Test

### Goal

10,000 concurrent balance updates.

---

## PAY-1021 — Payment Burst Test

---

## PAY-1022 — Gateway Failover Test

---

# FEATURE PAY-10.4 — E2E Testing

---

## PAY-1030 — Wallet Deposit Flow

### Scenario

* User deposits funds
* Payment confirmed
* Wallet updated

---

## PAY-1031 — Bid Fee Deduction Flow

---

## PAY-1032 — Subscription Purchase Flow

---

## PAY-1033 — Refund Flow

---

# Recommended Folder Structure

```text id="xchnt5"
/services/payment-service
├── src/
│   ├── modules/
│   │   ├── wallets/
│   │   ├── transactions/
│   │   ├── subscriptions/
│   │   ├── invoices/
│   │   ├── refunds/
│   │   ├── gateways/
│   │   ├── reconciliation/
│   │   └── analytics/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── postgres/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── stripe/
│   │   ├── thawani/
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

| Sprint   | Scope                 |
| -------- | --------------------- |
| Sprint 1 | Foundation + Wallets  |
| Sprint 2 | Stripe Integration    |
| Sprint 3 | Thawani Integration   |
| Sprint 4 | Bid Monetization      |
| Sprint 5 | Subscription System   |
| Sprint 6 | Refunds + Reporting   |
| Sprint 7 | Security + Compliance |
| Sprint 8 | QA + Hardening        |

---

# Definition of Done (DoD)

Task is DONE only if:

* Swagger documented
* Tests written
* Financial audit logs enabled
* Metrics added
* Monitoring enabled
* Idempotency validated
* Double-entry accounting validated
* PCI practices followed
* CI pipeline passing

---