
# Identity Service Backlog

## Authentication, Authorization & User Management Service

Service Name:

```text id="0r5k4f"
identity-service
```

Primary Responsibility:

* Authentication
* OTP Login
* JWT Management
* RBAC
* Merchant Verification
* User Profiles
* Trust & Reputation
* Security & Session Management

Recommended Stack:

* NestJS
* PostgreSQL
* Redis
* RabbitMQ
* Prisma ORM
* JWT
* Firebase/Auth Providers (future)

---

# Service Boundaries

## Owns

* Users
* Roles
* Sessions
* Refresh Tokens
* Merchant Verification
* User Trust Score
* Notification Preferences

## Publishes Events

* user.registered
* user.verified
* merchant.verified
* user.banned
* user.profile.updated

## Consumes Events

* bid.accepted
* request.completed
* fraud.reported

---

# Database Schema Overview

---

# users

| Column       | Type           |
| ------------ | -------------- |
| id           | UUID           |
| phone_number | VARCHAR UNIQUE |
| full_name    | VARCHAR        |
| role         | ENUM           |
| is_verified  | BOOLEAN        |
| is_banned    | BOOLEAN        |
| trust_score  | FLOAT          |
| avatar_url   | TEXT           |
| created_at   | TIMESTAMP      |
| updated_at   | TIMESTAMP      |

---

# refresh_tokens

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| token_hash | TEXT      |
| expires_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

# merchant_profiles

| Column                  | Type    |
| ----------------------- | ------- |
| id                      | UUID    |
| user_id                 | UUID    |
| business_name           | VARCHAR |
| commercial_registration | VARCHAR |
| verification_status     | ENUM    |
| coverage_areas          | JSONB   |
| categories              | JSONB   |

---

# merchant_documents

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| merchant_id   | UUID      |
| document_type | ENUM      |
| document_url  | TEXT      |
| uploaded_at   | TIMESTAMP |

---

# notification_preferences

| Column            | Type    |
| ----------------- | ------- |
| id                | UUID    |
| user_id           | UUID    |
| push_enabled      | BOOLEAN |
| sms_enabled       | BOOLEAN |
| marketing_enabled | BOOLEAN |

---

# EPIC AUTH-0 — Service Foundation

---

# FEATURE AUTH-0.1 — Service Initialization

---

## AUTH-001 — Initialize Identity Service

### Type

Task

### Priority

Critical

### Description

Create NestJS microservice for authentication and identity management.

### Acceptance Criteria

* NestJS initialized
* Healthcheck endpoint exists
* ConfigModule setup
* Environment validation setup

### Technical Notes

Use:

* NestJS
* TypeScript
* Prisma ORM

### Deliverables

```text id="xz7m4i"
/services/identity-service
```

---

## AUTH-002 — Setup PostgreSQL Connection

### Acceptance Criteria

* DB connection operational
* Retry logic enabled
* Connection pooling enabled

---

## AUTH-003 — Setup Redis Connection

### Acceptance Criteria

* Redis operational
* Cache manager configured
* Retry support enabled

---

## AUTH-004 — Setup RabbitMQ Integration

### Acceptance Criteria

* Producer configured
* Consumer configured
* Reconnect strategy implemented

---

## AUTH-005 — Configure Structured Logging

### Acceptance Criteria

* Request IDs generated
* Correlation IDs supported
* JSON logs enabled

---

# FEATURE AUTH-0.2 — Database Setup

---

## AUTH-010 — Create Users Migration

### Description

Create users table and indexes.

### Acceptance Criteria

* UUID primary key
* Unique phone index
* Role enum exists
* Timestamps exist

### SQL Requirements

```sql id="m3a8av"
CREATE TYPE user_role AS ENUM (
  'BUYER',
  'MERCHANT',
  'ADMIN'
);
```

---

## AUTH-011 — Create Refresh Tokens Table

---

## AUTH-012 — Create Merchant Profiles Table

---

## AUTH-013 — Create Merchant Documents Table

---

## AUTH-014 — Create Notification Preferences Table

---

## AUTH-015 — Setup Prisma Models

### Acceptance Criteria

* All models mapped
* Relations configured
* Migration generation operational

---

# EPIC AUTH-1 — OTP Authentication

---

# FEATURE AUTH-1.1 — Request OTP

---

## AUTH-100 — Create Request OTP Endpoint

### Endpoint

```http id="aj5ln5"
POST /auth/request-otp
```

### Description

Accept user phone number and send OTP.

### Acceptance Criteria

* Validate phone number
* Generate 6-digit OTP
* Save OTP in Redis
* OTP TTL = 5 minutes
* Publish SMS job to RabbitMQ

### Validation Rules

Oman format:

* Starts with 7 or 9
* 8 digits total

### Security Requirements

* Rate limiting
* OTP cooldown
* Brute-force protection

### Redis Structure

```text id="ws30es"
otp:{phone}
```

---

## AUTH-101 — Phone Number Validation Utility

### Acceptance Criteria

* Oman validation
* Sanitization support
* Country code normalization

---

## AUTH-102 — OTP Generator Utility

### Acceptance Criteria

* Secure random generation
* Numeric only
* 6 digits fixed

---

## AUTH-103 — OTP Redis Repository

### Acceptance Criteria

* Save OTP
* Validate OTP
* Delete OTP after verification
* TTL support

---

## AUTH-104 — SMS Queue Producer

### Queue

```text id="mrg9m6"
sms_queue
```

### Payload

```json id="1kz0yj"
{
  "phone": "9689XXXXXXX",
  "message": "Your OTP code is 123456"
}
```

### Acceptance Criteria

* RabbitMQ publishing operational
* Retry support
* DLQ support

---

## AUTH-105 — OTP Rate Limiter

### Acceptance Criteria

* Max 5 OTPs per hour
* IP-based throttling
* Phone-based throttling

---

# FEATURE AUTH-1.2 — Verify OTP

---

## AUTH-110 — Create Verify OTP Endpoint

### Endpoint

```http id="g0j3w4"
POST /auth/verify-otp
```

### Acceptance Criteria

* Verify Redis OTP
* Reject expired OTP
* Reject invalid OTP
* Create user if missing
* Mark user verified

---

## AUTH-111 — User Auto Registration Logic

### Acceptance Criteria

* Auto create BUYER user
* Default preferences created
* Timestamps populated

---

## AUTH-112 — Generate JWT Access Token

### Acceptance Criteria

* Expiration support
* User claims included
* Signed securely

### JWT Payload

```json id="dpp8u0"
{
  "sub": "userId",
  "role": "BUYER",
  "phoneNumber": "9689XXXXXXX"
}
```

---

## AUTH-113 — Generate Refresh Token

### Acceptance Criteria

* Long-lived token
* Stored hashed in DB
* Revocable

---

## AUTH-114 — Store Refresh Token

### Acceptance Criteria

* Hashed token stored
* Expiration tracked
* User linked

---

## AUTH-115 — Publish user.registered Event

### Event

```json id="q0sp9h"
{
  "event": "user.registered",
  "userId": "",
  "role": ""
}
```

---

# FEATURE AUTH-1.3 — Refresh Sessions

---

## AUTH-120 — Refresh Token Endpoint

### Endpoint

```http id="wl8p8n"
POST /auth/refresh
```

### Acceptance Criteria

* Validate refresh token
* Rotate tokens
* Revoke old token

---

## AUTH-121 — Logout Endpoint

### Endpoint

```http id="a1pz7f"
POST /auth/logout
```

### Acceptance Criteria

* Revoke refresh token
* Delete session

---

## AUTH-122 — Logout All Sessions

### Endpoint

```http id="z6y75x"
POST /auth/logout-all
```

---

# EPIC AUTH-2 — Authorization & RBAC

---

# FEATURE AUTH-2.1 — JWT Guards

---

## AUTH-200 — Create JWT Auth Guard

### Acceptance Criteria

* Validate JWT
* Attach user context
* Reject invalid tokens

---

## AUTH-201 — Create Roles Guard

### Acceptance Criteria

* Buyer-only protection
* Merchant-only protection
* Admin-only protection

---

## AUTH-202 — Create Roles Decorator

### Example

```typescript id="10f73z"
@Roles('ADMIN')
```

---

## AUTH-203 — Current User Decorator

### Example

```typescript id="pnag7c"
@CurrentUser()
```

---

# FEATURE AUTH-2.2 — Permission Matrix

---

## AUTH-210 — Define RBAC Matrix

### Deliverables

Permission matrix document.

### Roles

* BUYER
* MERCHANT
* ADMIN
* SUPPORT_AGENT (future)

---

## AUTH-211 — Merchant Access Restrictions

### Acceptance Criteria

* Merchant cannot create requests
* Merchant-only bid routes protected

---

## AUTH-212 — Buyer Access Restrictions

### Acceptance Criteria

* Buyer cannot access merchant routes

---

# EPIC AUTH-3 — User Profiles

---

# FEATURE AUTH-3.1 — Profile Management

---

## AUTH-300 — Get Current User Profile

### Endpoint

```http id="j06b7k"
GET /users/me
```

---

## AUTH-301 — Update User Profile

### Endpoint

```http id="bpr0ye"
PATCH /users/me
```

### Acceptance Criteria

* Update name
* Update avatar
* Validation rules applied

---

## AUTH-302 — Upload Avatar

### Acceptance Criteria

* S3 upload
* Image validation
* Compression enabled

---

## AUTH-303 — Update Notification Preferences

### Endpoint

```http id="h4vgz3"
PATCH /users/preferences
```

---

# FEATURE AUTH-3.2 — Merchant Profiles

---

## AUTH-310 — Create Merchant Profile

### Endpoint

```http id="8lr4f0"
POST /merchant/profile
```

### Acceptance Criteria

* Create merchant profile
* Categories selected
* Coverage areas selected

---

## AUTH-311 — Update Merchant Coverage Areas

---

## AUTH-312 — Update Merchant Categories

---

## AUTH-313 — Upload Merchant Documents

### Acceptance Criteria

* Commercial registration upload
* Identity verification upload
* S3 integration

---

# EPIC AUTH-4 — Merchant Verification

---

# FEATURE AUTH-4.1 — Verification Workflow

---

## AUTH-400 — Admin Merchant Review API

### Endpoint

```http id="m9xq4f"
GET /admin/merchants/pending
```

---

## AUTH-401 — Approve Merchant

### Endpoint

```http id="2tq1gj"
PATCH /admin/merchants/{id}/approve
```

### Acceptance Criteria

* Merchant verified
* Event published
* Audit log created

---

## AUTH-402 — Reject Merchant

### Acceptance Criteria

* Rejection reason required
* Merchant notified

---

## AUTH-403 — Publish merchant.verified Event

---

# FEATURE AUTH-4.2 — Trust Score System

---

## AUTH-410 — Create Trust Score Engine

### Description

Calculate merchant reliability score.

### Inputs

* Successful transactions
* Cancellation rate
* Complaint rate
* Verification status

---

## AUTH-411 — Consume request.completed Events

---

## AUTH-412 — Consume fraud.reported Events

---

## AUTH-413 — Recalculate Merchant Scores

### Acceptance Criteria

* Scheduled recalculation
* Score thresholds documented

---

# EPIC AUTH-5 — User Moderation

---

# FEATURE AUTH-5.1 — Ban & Suspension System

---

## AUTH-500 — Ban User Endpoint

### Endpoint

```http id="2mdd1u"
PATCH /admin/users/{id}/ban
```

### Acceptance Criteria

* User blocked
* JWT invalidated
* Audit log created

---

## AUTH-501 — Suspend Merchant

---

## AUTH-502 — Publish user.banned Event

---

# FEATURE AUTH-5.2 — Fraud Prevention

---

## AUTH-510 — Device Fingerprinting

### Acceptance Criteria

* Store device identifiers
* Detect suspicious activity

---

## AUTH-511 — Suspicious Login Detection

---

## AUTH-512 — Abuse Detection Rules

---

# EPIC AUTH-6 — Events & Messaging

---

# FEATURE AUTH-6.1 — RabbitMQ Contracts

---

## AUTH-600 — Define Event Schemas

### Deliverables

Shared contracts:

* user.registered
* merchant.verified
* user.banned

---

## AUTH-601 — Event Validation Middleware

---

## AUTH-602 — Idempotent Event Consumers

---

# EPIC AUTH-7 — Security Hardening

---

# FEATURE AUTH-7.1 — Authentication Security

---

## AUTH-700 — Implement Token Rotation

---

## AUTH-701 — JWT Secret Rotation

---

## AUTH-702 — Redis OTP Encryption

---

## AUTH-703 — Secure Headers Middleware

### Acceptance Criteria

* Helmet.js enabled
* CSP configured
* CORS configured

---

# FEATURE AUTH-7.2 — Audit Logging

---

## AUTH-710 — Authentication Audit Logs

### Track

* Login
* Logout
* OTP requests
* Failed logins

---

## AUTH-711 — Admin Actions Audit Logs

---

# EPIC AUTH-8 — Observability & Monitoring

---

# FEATURE AUTH-8.1 — Metrics

---

## AUTH-800 — Prometheus Metrics

### Metrics

* OTP requests/sec
* Login success rate
* Failed login attempts
* Token refresh rate

---

## AUTH-801 — Healthcheck Endpoint

### Endpoint

```http id="cchx0r"
GET /health
```

---

## AUTH-802 — Distributed Tracing

---

# EPIC AUTH-9 — Testing & QA

---

# FEATURE AUTH-9.1 — Unit Testing

---

## AUTH-900 — OTP Service Tests

## AUTH-901 — JWT Service Tests

## AUTH-902 — RBAC Tests

---

# FEATURE AUTH-9.2 — Integration Testing

---

## AUTH-910 — Redis Integration Tests

## AUTH-911 — RabbitMQ Integration Tests

## AUTH-912 — PostgreSQL Integration Tests

---

# FEATURE AUTH-9.3 — E2E Testing

---

## AUTH-920 — Full Login Flow Test

### Scenario

* Request OTP
* Verify OTP
* Receive JWT
* Access protected route

---

## AUTH-921 — Merchant Verification Flow Test

---

## AUTH-922 — Ban User Flow Test

---

# Recommended Folder Structure

```text id="o1v44u"
/services/identity-service
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── merchants/
│   │   ├── admin/
│   │   ├── notifications/
│   │   └── audit/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   └── logger/
│   │
│   ├── config/
│   └── main.ts
│
├── prisma/
├── test/
└── Dockerfile
```

---

# Recommended Sprint Breakdown

| Sprint   | Scope                      |
| -------- | -------------------------- |
| Sprint 1 | Service foundation + DB    |
| Sprint 2 | OTP Authentication         |
| Sprint 3 | JWT + Sessions + RBAC      |
| Sprint 4 | Merchant Profiles          |
| Sprint 5 | Verification + Trust Score |
| Sprint 6 | Security + Observability   |
| Sprint 7 | QA + Hardening             |

---

# Definition of Done (DoD)

A task is considered DONE only if:

* Code reviewed
* Tests written
* Swagger documented
* Metrics added
* Logs added
* RBAC applied
* Error handling complete
* Events documented
* Monitoring enabled
* CI pipeline passing

---