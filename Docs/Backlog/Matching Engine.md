

# Matching Engine Backlog

## Real-Time Merchant Matching Service

Service Name:

```text id="pt0m7c"
matching-engine
```

Primary Responsibility:

* Real-time request matching
* Merchant targeting
* Geo filtering
* Category filtering
* Eligibility scoring
* Fast in-memory lookups
* Merchant availability filtering
* Event-driven matching

Recommended Stack:

* NestJS
* Redis
* PostgreSQL + PostGIS
* RabbitMQ
* BullMQ (optional jobs)
* Prometheus

---

# Service Boundaries

## Owns

* Merchant interest registry
* Merchant coverage areas
* Merchant matching cache
* Matching rules
* Matching scores

## Publishes Events

* match.found
* merchant.match.failed
* merchant.match.partial

## Consumes Events

* request.created
* merchant.profile.updated
* merchant.verified
* user.banned
* merchant.availability.updated

---

# Core Matching Objectives

---

## Performance Goals

| Goal                  | Target  |
| --------------------- | ------- |
| Match latency         | < 500ms |
| Notification dispatch | < 2s    |
| Concurrent requests   | 10,000+ |
| Redis lookup          | < 50ms  |

---

## Matching Logic

Merchant eligible if:

* Merchant verified
* Merchant not banned
* Merchant active
* Category matches
* Location coverage matches
* Merchant online/available
* Merchant trust score above threshold

---

# Architecture Overview

```text id="thbkjg"
Request Service
      ↓
RabbitMQ (request.created)
      ↓
Matching Engine Consumer
      ↓
Redis Matching Layer
      ↓
Merchant Candidate Set
      ↓
Scoring & Filtering
      ↓
match.found Event
      ↓
Notification Service
```

---

# Database Schema Overview

---

# merchant_interests

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| merchant_id | UUID      |
| category_id | UUID      |
| created_at  | TIMESTAMP |

---

# merchant_coverage_areas

| Column      | Type    |
| ----------- | ------- |
| id          | UUID    |
| merchant_id | UUID    |
| location_id | UUID    |
| latitude    | DECIMAL |
| longitude   | DECIMAL |
| radius_km   | INTEGER |

---

# merchant_status_cache

| Column      | Type      |
| ----------- | --------- |
| merchant_id | UUID      |
| is_online   | BOOLEAN   |
| is_verified | BOOLEAN   |
| is_banned   | BOOLEAN   |
| trust_score | FLOAT     |
| last_seen   | TIMESTAMP |

---

# match_logs

| Column            | Type      |
| ----------------- | --------- |
| id                | UUID      |
| request_id        | UUID      |
| matched_merchants | JSONB     |
| latency_ms        | INTEGER   |
| created_at        | TIMESTAMP |

---

# Redis Key Structure

---

## Category Matching

```text id="0j2wvh"
category:{categoryId}
```

Contains:

```text id="7qbg6f"
SET(merchantIds)
```

---

## Geo Matching

```text id="l7igow"
location:{locationId}
```

Contains:

```text id="0z4yqs"
SET(merchantIds)
```

---

## Merchant Status

```text id="8g1p9j"
merchant:status:{merchantId}
```

Contains:

```json id="vz9qkp"
{
  "isOnline": true,
  "trustScore": 4.5,
  "verified": true
}
```

---

# EPIC MATCH-0 — Service Foundation

---

# FEATURE MATCH-0.1 — Service Initialization

---

## MATCH-001 — Initialize Matching Engine Service

### Priority

Critical

### Acceptance Criteria

* NestJS service initialized
* Healthcheck endpoint operational
* ConfigModule configured
* Swagger enabled

---

## MATCH-002 — Setup Redis Connection

### Acceptance Criteria

* Redis cluster connection operational
* Retry strategy enabled
* Connection pooling enabled

---

## MATCH-003 — Setup PostgreSQL + PostGIS

### Acceptance Criteria

* PostGIS extension enabled
* Geo queries operational

---

## MATCH-004 — Setup RabbitMQ Integration

### Acceptance Criteria

* Consumer operational
* Producer operational
* DLQ support enabled

---

## MATCH-005 — Configure Structured Logging

### Acceptance Criteria

* Correlation IDs supported
* Request tracing enabled

---

# FEATURE MATCH-0.2 — Database Setup

---

## MATCH-010 — Create Merchant Interests Table

### Acceptance Criteria

* Indexes configured
* FK constraints configured

---

## MATCH-011 — Create Merchant Coverage Areas Table

---

## MATCH-012 — Create Match Logs Table

---

## MATCH-013 — Setup Prisma Models

---

# EPIC MATCH-1 — Request Event Consumption

---

# FEATURE MATCH-1.1 — RabbitMQ Consumer

---

## MATCH-100 — Consume request.created Event

### Event

```json id="on4i1f"
{
  "requestId": "",
  "buyerId": "",
  "categoryId": "",
  "locationId": "",
  "publishedAt": ""
}
```

### Acceptance Criteria

* Consumer operational
* Event validation enabled
* Acknowledgment support implemented

---

## MATCH-101 — Idempotent Event Processing

### Acceptance Criteria

* Duplicate event protection
* Redis lock support

---

## MATCH-102 — Failed Event Retry Strategy

### Acceptance Criteria

* Exponential backoff
* Dead letter queue enabled

---

# FEATURE MATCH-1.2 — Matching Pipeline

---

## MATCH-110 — Build Matching Pipeline Orchestrator

### Acceptance Criteria

* Pipeline modularized
* Async processing supported
* Timeout handling enabled

### Pipeline Steps

1. Load request data
2. Load merchant candidates
3. Geo filtering
4. Trust filtering
5. Availability filtering
6. Score merchants
7. Emit result event

---

# EPIC MATCH-2 — Merchant Registry

---

# FEATURE MATCH-2.1 — Merchant Interest Registry

---

## MATCH-200 — Register Merchant Categories

### Acceptance Criteria

* Merchant categories stored
* Redis synced

---

## MATCH-201 — Register Merchant Coverage Areas

### Acceptance Criteria

* Geo coverage stored
* Radius support enabled

---

## MATCH-202 — Merchant Coverage Geo Queries

### Acceptance Criteria

* PostGIS distance queries operational
* Radius filtering supported

### Example Query

```sql id="x0tpyr"
ST_DWithin(
  geography(point(longitude, latitude)),
  geography(point(:lng, :lat)),
  radius_in_meters
)
```

---

# FEATURE MATCH-2.2 — Redis Synchronization

---

## MATCH-210 — Sync Merchant Categories to Redis

### Redis Structure

```text id="g8v2wa"
category:{categoryId}
```

---

## MATCH-211 — Sync Merchant Locations to Redis

---

## MATCH-212 — Remove Stale Merchant Data

### Acceptance Criteria

* Expired merchants removed
* Banned merchants removed

---

## MATCH-213 — Full Redis Rebuild Job

### Description

Rebuild Redis cache from DB periodically.

---

# EPIC MATCH-3 — Matching Logic

---

# FEATURE MATCH-3.1 — Merchant Candidate Retrieval

---

## MATCH-300 — Fetch Merchants by Category

### Acceptance Criteria

* Redis lookup operational
* O(1) retrieval supported

---

## MATCH-301 — Fetch Merchants by Location

---

## MATCH-302 — Redis Set Intersection

### Description

Intersect category + location merchant sets.

### Example

```text id="7gmx7j"
SINTER category:5 location:muscat
```

---

## MATCH-303 — Geo Radius Filtering

### Acceptance Criteria

* Merchant within delivery radius
* Distance calculated

---

# FEATURE MATCH-3.2 — Eligibility Filtering

---

## MATCH-310 — Filter Unverified Merchants

---

## MATCH-311 — Filter Banned Merchants

---

## MATCH-312 — Filter Offline Merchants

---

## MATCH-313 — Filter Low Trust Score Merchants

### Configurable Threshold

```text id="8xhnja"
MIN_TRUST_SCORE=3.5
```

---

## MATCH-314 — Merchant Cooldown Rules

### Description

Prevent same merchant from receiving too many requests.

---

# FEATURE MATCH-3.3 — Matching Scoring Engine

---

## MATCH-320 — Build Merchant Scoring Engine

### Inputs

* Distance
* Trust score
* Merchant response speed
* Acceptance rate
* Merchant online status

### Output

```json id="z1djlwm"
{
  "merchantId": "",
  "score": 92
}
```

---

## MATCH-321 — Sort Matching Candidates

---

## MATCH-322 — Limit Merchant Targets

### Acceptance Criteria

* Max merchant count configurable
* Prevent notification spam

---

# FEATURE MATCH-3.4 — Smart Matching Features (Future)

---

## MATCH-330 — AI Ranking Integration Hook

---

## MATCH-331 — Merchant Learning Preferences

---

## MATCH-332 — Dynamic Match Optimization

---

# EPIC MATCH-4 — Match Event Publishing

---

# FEATURE MATCH-4.1 — Publish Match Events

---

## MATCH-400 — Emit match.found Event

### Payload

```json id="5h3r29"
{
  "requestId": "",
  "buyerId": "",
  "merchants": [
    {
      "merchantId": "",
      "score": 92
    }
  ]
}
```

### Acceptance Criteria

* RabbitMQ publishing operational
* Retry strategy enabled

---

## MATCH-401 — Emit merchant.match.failed Event

### Description

No eligible merchants found.

---

## MATCH-402 — Emit merchant.match.partial Event

### Description

Only partial merchant coverage found.

---

# FEATURE MATCH-4.2 — Match Logging

---

## MATCH-410 — Store Match Logs

### Acceptance Criteria

* Latency stored
* Merchant count stored

---

## MATCH-411 — Matching Metrics Aggregation

---

# EPIC MATCH-5 — Merchant Availability Tracking

---

# FEATURE MATCH-5.1 — Online Presence

---

## MATCH-500 — Merchant Online Status Tracking

### Acceptance Criteria

* Heartbeat support
* Last seen stored

---

## MATCH-501 — Consume merchant.availability.updated Event

---

## MATCH-502 — Auto Offline Detection

### Acceptance Criteria

* Offline after timeout
* Cleanup job enabled

---

# FEATURE MATCH-5.2 — Presence Cache

---

## MATCH-510 — Redis Presence Cache

---

## MATCH-511 — Redis Presence Expiration

---

# EPIC MATCH-6 — Moderation & Safety

---

# FEATURE MATCH-6.1 — Fraud & Abuse Prevention

---

## MATCH-600 — Merchant Spam Prevention Rules

---

## MATCH-601 — Match Frequency Limits

---

## MATCH-602 — Suspicious Merchant Detection

---

# FEATURE MATCH-6.2 — Geo Fraud Protection

---

## MATCH-610 — Impossible Distance Detection

---

## MATCH-611 — Fake Location Detection

---

# EPIC MATCH-7 — Observability & Monitoring

---

# FEATURE MATCH-7.1 — Metrics

---

## MATCH-700 — Prometheus Metrics

### Metrics

* Match latency
* Redis lookup latency
* Match success rate
* Match failure count
* Queue processing latency

---

## MATCH-701 — Distributed Tracing

### Acceptance Criteria

* OpenTelemetry support
* Cross-service trace IDs

---

## MATCH-702 — Healthcheck Endpoint

### Endpoint

```http id="o59zq8"
GET /health
```

---

# FEATURE MATCH-7.2 — Alerting

---

## MATCH-710 — High Latency Alerts

---

## MATCH-711 — Redis Failure Alerts

---

## MATCH-712 — RabbitMQ Queue Alerts

---

# EPIC MATCH-8 — Security Hardening

---

# FEATURE MATCH-8.1 — Internal Service Security

---

## MATCH-800 — Internal JWT Validation

---

## MATCH-801 — RabbitMQ Message Validation

---

## MATCH-802 — Rate Limiting Internal APIs

---

# FEATURE MATCH-8.2 — Data Integrity

---

## MATCH-810 — Duplicate Match Prevention

---

## MATCH-811 — Redis Locking Mechanism

---

# EPIC MATCH-9 — Testing & QA

---

# FEATURE MATCH-9.1 — Unit Testing

---

## MATCH-900 — Matching Algorithm Tests

---

## MATCH-901 — Scoring Engine Tests

---

## MATCH-902 — Geo Filtering Tests

---

# FEATURE MATCH-9.2 — Integration Testing

---

## MATCH-910 — Redis Integration Tests

---

## MATCH-911 — RabbitMQ Consumer Tests

---

## MATCH-912 — PostGIS Query Tests

---

# FEATURE MATCH-9.3 — Load & Performance Testing

---

## MATCH-920 — High Concurrency Load Test

### Goal

10,000 concurrent request events.

---

## MATCH-921 — Redis Stress Test

---

## MATCH-922 — Match Latency Benchmark

### Acceptance Criteria

* < 500ms average latency

---

# FEATURE MATCH-9.4 — E2E Testing

---

## MATCH-930 — Full Matching Flow

### Scenario

* Request published
* Event consumed
* Merchants matched
* match.found emitted

---

## MATCH-931 — Merchant Availability Flow

---

## MATCH-932 — No Merchant Match Scenario

---

# Recommended Folder Structure

```text id="p9sow3"
/services/matching-engine
├── src/
│   ├── modules/
│   │   ├── matching/
│   │   ├── merchants/
│   │   ├── scoring/
│   │   ├── geo/
│   │   ├── cache/
│   │   └── monitoring/
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── utils/
│   │
│   ├── infrastructure/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── postgres/
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
| Sprint 1 | Foundation + Redis       |
| Sprint 2 | Merchant Registry        |
| Sprint 3 | Event Consumption        |
| Sprint 4 | Matching Logic           |
| Sprint 5 | Scoring Engine           |
| Sprint 6 | Presence Tracking        |
| Sprint 7 | Monitoring + Security    |
| Sprint 8 | Load Testing + Hardening |

---

# Definition of Done (DoD)

Task is DONE only if:

* Tests written
* Metrics added
* Logs added
* Event contracts documented
* Swagger updated
* Retry handling implemented
* Redis sync validated
* Monitoring enabled
* CI pipeline passing

---