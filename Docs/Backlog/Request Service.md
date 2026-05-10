
# Request Service Backlog

## Buyer Request Management Service

Service Name:

```text id="mt4tv7"
request-service
```

Primary Responsibility:

* Request creation
* Draft management
* Request publishing
* Request lifecycle
* Media attachments
* Buyer dashboard
* Request visibility
* Event publishing

Recommended Stack:

* NestJS
* PostgreSQL
* Prisma ORM
* AWS S3
* Redis
* RabbitMQ

---

# Service Boundaries

## Owns

* Requests
* Request Drafts
* Request Images
* Request Status
* Request Metadata

## Publishes Events

* request.created
* request.updated
* request.closed
* request.cancelled
* request.completed

## Consumes Events

* bid.accepted
* payment.completed (future)
* moderation.request.blocked

---

# Core Business Rules

---

## Buyer Rules

* Only BUYER can create requests.
* Buyer owns request lifecycle.
* Buyer can cancel ACTIVE requests.
* Buyer can mark request COMPLETED.

---

## Request Rules

* Request starts as DRAFT.
* Request becomes ACTIVE only after validation.
* Only ACTIVE requests visible to merchants.
* COMPLETED/CANCELLED requests locked.

---

## Media Rules

* Max images per request configurable.
* Images compressed automatically.
* Invalid formats rejected.
* Secure upload required.

---

# Database Schema Overview

---

# requests

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| buyer_id     | UUID      |
| category_id  | UUID      |
| title        | VARCHAR   |
| description  | TEXT      |
| location_id  | UUID      |
| latitude     | DECIMAL   |
| longitude    | DECIMAL   |
| status       | ENUM      |
| expires_at   | TIMESTAMP |
| published_at | TIMESTAMP |
| created_at   | TIMESTAMP |
| updated_at   | TIMESTAMP |

---

# request_images

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| request_id | UUID      |
| image_url  | TEXT      |
| sort_order | INTEGER   |
| created_at | TIMESTAMP |

---

# request_categories

| Column    | Type    |
| --------- | ------- |
| id        | UUID    |
| name      | VARCHAR |
| slug      | VARCHAR |
| icon      | TEXT    |
| is_active | BOOLEAN |

---

# request_status_history

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| request_id | UUID      |
| old_status | ENUM      |
| new_status | ENUM      |
| changed_by | UUID      |
| changed_at | TIMESTAMP |

---

# request_views (future analytics)

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| request_id  | UUID      |
| merchant_id | UUID      |
| viewed_at   | TIMESTAMP |

---

# ENUM request_status

```sql id="v3g17j"
DRAFT
ACTIVE
IN_PROGRESS
COMPLETED
CANCELLED
EXPIRED
BLOCKED
```

---

# EPIC REQ-0 — Service Foundation

---

# FEATURE REQ-0.1 — Service Initialization

---

## REQ-001 — Initialize Request Service

### Priority

Critical

### Description

Initialize NestJS service for request management.

### Acceptance Criteria

* NestJS operational
* Healthcheck exists
* ConfigModule configured
* Swagger enabled

---

## REQ-002 — Setup PostgreSQL Connection

### Acceptance Criteria

* Connection pooling enabled
* Retry strategy enabled

---

## REQ-003 — Setup RabbitMQ Integration

### Acceptance Criteria

* Producer operational
* Consumer operational
* Retry queues supported

---

## REQ-004 — Setup S3 Integration

### Acceptance Criteria

* Bucket connection operational
* Secure uploads supported
* Signed URL support enabled

---

## REQ-005 — Setup Structured Logging

### Acceptance Criteria

* JSON logs enabled
* Correlation IDs supported

---

# FEATURE REQ-0.2 — Database Setup

---

## REQ-010 — Create Requests Table Migration

### Acceptance Criteria

* UUID PK
* Status enum exists
* Indexes configured

### Required Indexes

* buyer_id
* category_id
* status
* created_at

---

## REQ-011 — Create Request Images Table

---

## REQ-012 — Create Categories Table

---

## REQ-013 — Create Request Status History Table

---

## REQ-014 — Create Analytics Tables

---

## REQ-015 — Setup Prisma Models

---

# EPIC REQ-1 — Draft Request Flow

---

# FEATURE REQ-1.1 — Draft Creation

---

## REQ-100 — Create Draft Request Endpoint

### Endpoint

```http id="yvsvq9"
POST /requests/draft
```

### Description

Create buyer request draft.

### Acceptance Criteria

* Buyer-only endpoint
* Draft status assigned
* Request owner assigned
* Validation applied

### Request Body

```json id="8bbydu"
{
  "categoryId": "",
  "title": "",
  "description": ""
}
```

### Security Requirements

* JWT required
* RBAC enforced

---

## REQ-101 — Validate Request Payload

### Acceptance Criteria

* Description min/max length
* Title validation
* Category existence validation

---

## REQ-102 — Auto Save Draft Support

### Description

Allow mobile apps to auto-save draft changes.

### Acceptance Criteria

* Partial updates supported
* Timestamp updated

---

# FEATURE REQ-1.2 — Draft Updates

---

## REQ-110 — Update Draft Endpoint

### Endpoint

```http id="0d1lnv"
PATCH /requests/{id}/draft
```

### Acceptance Criteria

* Draft-only updates
* Ownership validation
* Partial updates supported

---

## REQ-111 — Update Draft Category

---

## REQ-112 — Update Draft Description

---

## REQ-113 — Update Draft Location

---

# EPIC REQ-2 — Image Upload Management

---

# FEATURE REQ-2.1 — Request Image Upload

---

## REQ-200 — Upload Request Images Endpoint

### Endpoint

```http id="mpkx56"
POST /requests/{id}/images
```

### Acceptance Criteria

* Multi-image upload
* Max image count validation
* Compression enabled
* Secure upload

### File Rules

Allowed:

* JPG
* PNG
* WEBP

Max size:

* 10MB/image

---

## REQ-201 — Image Compression Service

### Acceptance Criteria

* Resize large images
* Thumbnail generation
* Optimize storage size

---

## REQ-202 — Virus Scan Integration

### Acceptance Criteria

* Uploaded files scanned
* Unsafe files rejected

---

## REQ-203 — Generate Signed Upload URLs

### Acceptance Criteria

* Temporary upload URLs
* Secure upload support

---

## REQ-204 — Delete Request Image

### Endpoint

```http id="t2v6uu"
DELETE /requests/{id}/images/{imageId}
```

---

## REQ-205 — Reorder Request Images

---

# FEATURE REQ-2.2 — Media Security

---

## REQ-210 — Validate File Types

---

## REQ-211 — Prevent Malicious Uploads

---

## REQ-212 — CDN Cache Integration

---

# EPIC REQ-3 — Request Publishing

---

# FEATURE REQ-3.1 — Publish Request

---

## REQ-300 — Publish Request Endpoint

### Endpoint

```http id="g0r9bx"
PATCH /requests/{id}/publish
```

### Description

Convert draft into active request.

### Acceptance Criteria

* Draft must be complete
* Images optional/required configurable
* Status becomes ACTIVE
* Publish timestamp stored

---

## REQ-301 — Request Completeness Validator

### Validation Rules

* Category required
* Description required
* Location required

---

## REQ-302 — Emit request.created Event

### Event Payload

```json id="v7e4k7"
{
  "requestId": "",
  "buyerId": "",
  "categoryId": "",
  "locationId": "",
  "publishedAt": ""
}
```

### Acceptance Criteria

* RabbitMQ event published
* Retry support enabled

---

## REQ-303 — Request Expiration Scheduler

### Description

Auto expire inactive requests.

### Acceptance Criteria

* Cron/scheduler operational
* EXPIRED status assigned automatically

---

# FEATURE REQ-3.2 — Request Visibility

---

## REQ-310 — Merchant Visibility Rules

### Acceptance Criteria

* Only ACTIVE visible
* BLOCKED hidden
* EXPIRED hidden

---

## REQ-311 — Geo Visibility Rules

### Acceptance Criteria

* Region filtering supported
* Coverage area matching supported

---

# EPIC REQ-4 — Buyer Dashboard

---

# FEATURE REQ-4.1 — Buyer Request Listing

---

## REQ-400 — Get My Requests Endpoint

### Endpoint

```http id="29mp7d"
GET /requests/my-requests
```

### Acceptance Criteria

* Pagination supported
* Filters supported
* Sorting supported

### Filters

* ACTIVE
* COMPLETED
* CANCELLED
* EXPIRED

---

## REQ-401 — Request Details Endpoint

### Endpoint

```http id="t42ty4"
GET /requests/{id}
```

### Acceptance Criteria

* Owner validation
* Images included
* Bid counters included

---

## REQ-402 — Buyer Request Search

---

## REQ-403 — Request Sorting

### Sorting Options

* Latest
* Oldest
* Most bids

---

# FEATURE REQ-4.2 — Buyer Analytics

---

## REQ-410 — Request Bid Counter

### Acceptance Criteria

* Total bids count
* Updated in near real-time

---

## REQ-411 — Request Engagement Metrics

### Metrics

* Merchant views
* Bid count
* Average response time

---

# EPIC REQ-5 — Request Lifecycle Management

---

# FEATURE REQ-5.1 — Request Status Management

---

## REQ-500 — Update Request Status Endpoint

### Endpoint

```http id="r5xkdo"
PATCH /requests/{id}/status
```

### Allowed Transitions

```text id="w55t8k"
DRAFT -> ACTIVE
ACTIVE -> IN_PROGRESS
ACTIVE -> CANCELLED
IN_PROGRESS -> COMPLETED
ACTIVE -> EXPIRED
```

---

## REQ-501 — Status Transition Validator

### Acceptance Criteria

* Invalid transitions blocked
* Ownership enforced

---

## REQ-502 — Store Status History

### Acceptance Criteria

* All status changes logged
* Actor stored
* Timestamp stored

---

# FEATURE REQ-5.2 — Request Completion

---

## REQ-510 — Mark Request Completed

### Acceptance Criteria

* Buyer-only action
* request.completed event published

---

## REQ-511 — Emit request.completed Event

### Payload

```json id="8o2j06"
{
  "requestId": "",
  "buyerId": "",
  "merchantId": ""
}
```

---

## REQ-512 — Emit request.cancelled Event

---

# EPIC REQ-6 — Moderation & Safety

---

# FEATURE REQ-6.1 — Content Moderation

---

## REQ-600 — Profanity Filter

### Acceptance Criteria

* Arabic support
* English support

---

## REQ-601 — Spam Detection Rules

---

## REQ-602 — Duplicate Request Detection

---

## REQ-603 — AI Moderation Hook (Future)

### Description

Allow AI moderation integration later.

---

# FEATURE REQ-6.2 — Request Blocking

---

## REQ-610 — Block Request Endpoint

### Endpoint

```http id="xjmdcl"
PATCH /admin/requests/{id}/block
```

---

## REQ-611 — Publish moderation.request.blocked Event

---

# EPIC REQ-7 — Search & Discovery

---

# FEATURE REQ-7.1 — Request Search APIs

---

## REQ-700 — Search Active Requests

### Endpoint

```http id="dxj6r4"
GET /requests/search
```

### Acceptance Criteria

* Category filtering
* Geo filtering
* Keyword search

---

## REQ-701 — Full Text Search Support

### Technical Notes

Recommended:

* PostgreSQL Full Text Search
  OR
* Elasticsearch later

---

## REQ-702 — Trending Categories API

---

# EPIC REQ-8 — Events & Messaging

---

# FEATURE REQ-8.1 — RabbitMQ Contracts

---

## REQ-800 — Define request.created Schema

---

## REQ-801 — Define request.completed Schema

---

## REQ-802 — Define request.cancelled Schema

---

## REQ-803 — Idempotent Event Publishing

### Acceptance Criteria

* Duplicate events prevented
* Retry-safe publishing

---

# FEATURE REQ-8.2 — Consumers

---

## REQ-810 — Consume bid.accepted Event

### Acceptance Criteria

* Request moves to IN_PROGRESS

---

## REQ-811 — Consume moderation.request.blocked Event

---

# EPIC REQ-9 — Security Hardening

---

# FEATURE REQ-9.1 — Request Security

---

## REQ-900 — RBAC Enforcement

---

## REQ-901 — Ownership Validation Middleware

---

## REQ-902 — API Rate Limiting

---

## REQ-903 — Input Sanitization

### Acceptance Criteria

* XSS protection
* HTML sanitization

---

# FEATURE REQ-9.2 — Audit Logging

---

## REQ-910 — Request Activity Logs

### Track

* Created
* Published
* Updated
* Cancelled
* Completed

---

# EPIC REQ-10 — Observability

---

# FEATURE REQ-10.1 — Monitoring

---

## REQ-1000 — Prometheus Metrics

### Metrics

* Requests created/sec
* Publish success rate
* Image upload latency
* Failed uploads

---

## REQ-1001 — Healthcheck Endpoint

### Endpoint

```http id="i0glth"
GET /health
```

---

## REQ-1002 — Distributed Tracing

---

# EPIC REQ-11 — Testing & QA

---

# FEATURE REQ-11.1 — Unit Testing

---

## REQ-1100 — Request Service Tests

---

## REQ-1101 — Publish Flow Tests

---

## REQ-1102 — Validation Tests

---

# FEATURE REQ-11.2 — Integration Testing

---

## REQ-1110 — PostgreSQL Integration Tests

---

## REQ-1111 — S3 Upload Integration Tests

---

## REQ-1112 — RabbitMQ Event Tests

---

# FEATURE REQ-11.3 — E2E Testing

---

## REQ-1120 — Full Request Creation Flow

### Scenario

* Login
* Create draft
* Upload images
* Publish request
* Event emitted

---

## REQ-1121 — Cancel Request Flow

---

## REQ-1122 — Request Completion Flow

---

# Recommended Folder Structure

```text id="jtfiyr"
/services/request-service
├── src/
│   ├── modules/
│   │   ├── requests/
│   │   ├── categories/
│   │   ├── uploads/
│   │   ├── moderation/
│   │   ├── analytics/
│   │   └── admin/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── validators/
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── rabbitmq/
│   │   ├── s3/
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

| Sprint   | Scope                    |
| -------- | ------------------------ |
| Sprint 1 | Foundation + DB          |
| Sprint 2 | Draft Flow               |
| Sprint 3 | Image Uploads            |
| Sprint 4 | Publish & Events         |
| Sprint 5 | Buyer Dashboard          |
| Sprint 6 | Moderation & Search      |
| Sprint 7 | Security + Observability |
| Sprint 8 | QA + Hardening           |

---

# Definition of Done (DoD)

Task is DONE only if:

* API documented
* Swagger updated
* Tests written
* Logs added
* Metrics added
* Events documented
* RBAC enforced
* Validation complete
* CI pipeline passing
* Monitoring enabled

---