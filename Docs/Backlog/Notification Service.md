
# Notification Service Backlog

## Real-Time Notifications & Delivery Service

Service Name:

```text id="4j7m8y"
notification-service
```

Primary Responsibility:

* Real-time notifications
* WebSocket delivery
* Push notifications (FCM/APNS)
* Notification preferences
* Offline delivery
* In-app notifications
* Notification retries
* Presence-aware delivery

Recommended Stack:

* NestJS
* Socket.io
* Redis
* RabbitMQ
* Firebase Cloud Messaging (FCM)
* APNS (iOS)
* PostgreSQL
* BullMQ
* Prometheus

---

# Service Boundaries

## Owns

* Notification delivery
* WebSocket sessions
* User socket presence
* Push notification tokens
* Notification preferences cache
* Notification delivery logs

## Publishes Events

* notification.sent
* notification.failed
* notification.read
* user.online
* user.offline

## Consumes Events

* match.found
* bid.submitted
* bid.accepted
* bid.rejected
* bid.expired
* request.completed
* request.cancelled
* user.banned

---

# Core Business Rules

---

## Notification Rules

* Real-time delivery preferred.
* Push fallback when offline.
* Notifications retry on temporary failure.
* User notification preferences respected.

---

## Delivery Rules

* Socket delivery first.
* FCM/APNS if socket unavailable.
* Delivery status tracked.
* Duplicate notifications prevented.

---

## Presence Rules

* User online status tracked.
* Multi-device sessions supported.
* Idle timeout configurable.

---

# Database Schema Overview

---

# notification_tokens

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| user_id      | UUID      |
| device_type  | ENUM      |
| token        | TEXT      |
| is_active    | BOOLEAN   |
| last_used_at | TIMESTAMP |
| created_at   | TIMESTAMP |

---

# notifications

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| user_id         | UUID      |
| type            | VARCHAR   |
| title           | VARCHAR   |
| body            | TEXT      |
| payload         | JSONB     |
| delivery_status | ENUM      |
| is_read         | BOOLEAN   |
| created_at      | TIMESTAMP |

---

# notification_delivery_logs

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| notification_id | UUID      |
| channel         | ENUM      |
| status          | ENUM      |
| failure_reason  | TEXT      |
| delivered_at    | TIMESTAMP |

---

# socket_sessions

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| user_id      | UUID      |
| socket_id    | VARCHAR   |
| connected_at | TIMESTAMP |
| last_seen_at | TIMESTAMP |

---

# ENUM delivery_status

```text id="4dycqo"
PENDING
DELIVERED
FAILED
READ
RETRYING
```

---

# ENUM device_type

```text id="3g7z7i"
IOS
ANDROID
WEB
```

---

# EPIC NOTIF-0 — Service Foundation

---

# FEATURE NOTIF-0.1 — Service Initialization

---

## NOTIF-001 — Initialize Notification Service

### Priority

Critical

### Acceptance Criteria

* NestJS initialized
* WebSocket gateway operational
* Swagger configured
* Healthcheck operational

---

## NOTIF-002 — Setup Redis Connection

### Acceptance Criteria

* Redis operational
* Pub/Sub operational
* Retry strategy enabled

---

## NOTIF-003 — Setup RabbitMQ Integration

### Acceptance Criteria

* Consumers operational
* Producers operational
* DLQ support enabled

---

## NOTIF-004 — Setup PostgreSQL Connection

---

## NOTIF-005 — Configure Structured Logging

---

# FEATURE NOTIF-0.2 — Firebase/APNS Integration

---

## NOTIF-010 — Setup Firebase Cloud Messaging

### Acceptance Criteria

* FCM credentials configured
* Test push operational

---

## NOTIF-011 — Setup Apple Push Notifications

### Acceptance Criteria

* APNS configured
* iOS push operational

---

## NOTIF-012 — Notification Provider Abstraction Layer

### Description

Abstract FCM/APNS providers behind unified interface.

---

# EPIC NOTIF-1 — WebSocket Infrastructure

---

# FEATURE NOTIF-1.1 — Socket Server Setup

---

## NOTIF-100 — Configure Socket.io Gateway

### Acceptance Criteria

* Namespaces supported
* Rooms supported
* JWT auth operational

---

## NOTIF-101 — Redis Socket Adapter

### Acceptance Criteria

* Horizontal scaling enabled
* Cross-instance messaging operational

---

## NOTIF-102 — Socket Authentication Middleware

### Acceptance Criteria

* JWT validated
* Unauthorized sockets rejected

---

# FEATURE NOTIF-1.2 — User Presence

---

## NOTIF-110 — User Room Management

### Acceptance Criteria

* socket.join(userId)
* Multi-device support

---

## NOTIF-111 — User Presence Tracking

### Acceptance Criteria

* Online/offline tracking
* Last seen tracking

---

## NOTIF-112 — Idle Session Detection

---

## NOTIF-113 — Publish user.online Event

---

## NOTIF-114 — Publish user.offline Event

---

# EPIC NOTIF-2 — Event Consumption

---

# FEATURE NOTIF-2.1 — Match Notifications

---

## NOTIF-200 — Consume match.found Event

### Acceptance Criteria

* Merchant targets resolved
* Notifications dispatched

### Notification Example

```json id="y8br4v"
{
  "title": "New Request Nearby",
  "body": "A buyer posted a request matching your category."
}
```

---

## NOTIF-201 — Merchant Match Fanout Delivery

### Acceptance Criteria

* Parallel dispatch supported
* Delivery batching supported

---

# FEATURE NOTIF-2.2 — Bid Notifications

---

## NOTIF-210 — Consume bid.submitted Event

### Acceptance Criteria

* Buyer notified immediately

---

## NOTIF-211 — Consume bid.accepted Event

### Acceptance Criteria

* Merchant notified
* Chat activation triggered

---

## NOTIF-212 — Consume bid.rejected Event

---

## NOTIF-213 — Consume bid.expired Event

---

# FEATURE NOTIF-2.3 — Request Notifications

---

## NOTIF-220 — Consume request.completed Event

---

## NOTIF-221 — Consume request.cancelled Event

---

# EPIC NOTIF-3 — Real-Time Delivery

---

# FEATURE NOTIF-3.1 — Socket Delivery

---

## NOTIF-300 — Real-Time Socket Notification Delivery

### Acceptance Criteria

* Emit to user room
* ACK support enabled

---

## NOTIF-301 — Delivery Acknowledgment Handling

### Acceptance Criteria

* Delivery status updated
* Retry if ACK missing

---

## NOTIF-302 — Duplicate Notification Prevention

### Acceptance Criteria

* Redis deduplication keys

---

# FEATURE NOTIF-3.2 — Offline Delivery

---

## NOTIF-310 — FCM Push Fallback

### Acceptance Criteria

* Offline users detected
* Push notification sent

---

## NOTIF-311 — APNS Push Fallback

---

## NOTIF-312 — Notification Retry Queue

### Acceptance Criteria

* Retry exponential backoff
* DLQ support enabled

---

# EPIC NOTIF-4 — Notification Center

---

# FEATURE NOTIF-4.1 — In-App Notifications

---

## NOTIF-400 — Store Notification Records

### Acceptance Criteria

* Notifications persisted
* Read status tracked

---

## NOTIF-401 — Get User Notifications Endpoint

### Endpoint

```http id="4sm5ba"
GET /notifications
```

### Acceptance Criteria

* Pagination supported
* Sorting supported

---

## NOTIF-402 — Mark Notification Read Endpoint

### Endpoint

```http id="q7qhl4"
PATCH /notifications/{id}/read
```

---

## NOTIF-403 — Bulk Mark Notifications Read

---

# FEATURE NOTIF-4.2 — Notification Preferences

---

## NOTIF-410 — Register Device Token Endpoint

### Endpoint

```http id="3lv9xw"
POST /notifications/device-token
```

---

## NOTIF-411 — Update Notification Preferences

### Acceptance Criteria

* Push enable/disable
* Marketing preferences
* Quiet hours support

---

## NOTIF-412 — Quiet Hours Logic

---

# EPIC NOTIF-5 — Push Notification Management

---

# FEATURE NOTIF-5.1 — Push Templates

---

## NOTIF-500 — Notification Template Engine

### Acceptance Criteria

* Localization supported
* Dynamic payloads supported

---

## NOTIF-501 — Arabic Localization Support

---

## NOTIF-502 — Rich Push Notifications

### Features

* Images
* Deep links
* Actions

---

# FEATURE NOTIF-5.2 — Delivery Optimization

---

## NOTIF-510 — Push Batching

---

## NOTIF-511 — Priority Notification Routing

### Priorities

* HIGH
* NORMAL
* LOW

---

## NOTIF-512 — Push Delivery Analytics

---

# EPIC NOTIF-6 — Moderation & Safety

---

# FEATURE NOTIF-6.1 — Spam Protection

---

## NOTIF-600 — Notification Rate Limiting

---

## NOTIF-601 — Duplicate Push Protection

---

## NOTIF-602 — Invalid Token Cleanup

### Acceptance Criteria

* Remove expired FCM/APNS tokens

---

# FEATURE NOTIF-6.2 — User Restrictions

---

## NOTIF-610 — Consume user.banned Event

### Acceptance Criteria

* Disconnect sockets
* Disable pushes

---

# EPIC NOTIF-7 — Observability & Monitoring

---

# FEATURE NOTIF-7.1 — Metrics

---

## NOTIF-700 — Prometheus Metrics

### Metrics

* Notification delivery rate
* Socket delivery latency
* Push success rate
* Active socket connections
* Retry counts

---

## NOTIF-701 — Distributed Tracing

---

## NOTIF-702 — Healthcheck Endpoint

### Endpoint

```http id="7o9qq0"
GET /health
```

---

# FEATURE NOTIF-7.2 — Alerting

---

## NOTIF-710 — Push Failure Alerts

---

## NOTIF-711 — Socket Disconnect Spike Alerts

---

## NOTIF-712 — Queue Backlog Alerts

---

# EPIC NOTIF-8 — Security Hardening

---

# FEATURE NOTIF-8.1 — WebSocket Security

---

## NOTIF-800 — Socket JWT Validation

---

## NOTIF-801 — Socket Rate Limiting

---

## NOTIF-802 — Secure Socket Rooms

### Acceptance Criteria

* Users access own rooms only

---

# FEATURE NOTIF-8.2 — Push Security

---

## NOTIF-810 — Device Token Encryption

---

## NOTIF-811 — Notification Payload Sanitization

---

# EPIC NOTIF-9 — Testing & QA

---

# FEATURE NOTIF-9.1 — Unit Testing

---

## NOTIF-900 — Socket Gateway Tests

---

## NOTIF-901 — Push Delivery Tests

---

## NOTIF-902 — Retry Queue Tests

---

# FEATURE NOTIF-9.2 — Integration Testing

---

## NOTIF-910 — Redis Pub/Sub Tests

---

## NOTIF-911 — RabbitMQ Consumer Tests

---

## NOTIF-912 — FCM Integration Tests

---

## NOTIF-913 — APNS Integration Tests

---

# FEATURE NOTIF-9.3 — Load Testing

---

## NOTIF-920 — Concurrent Socket Connections Test

### Goal

100,000 active connections.

---

## NOTIF-921 — Push Notification Burst Test

---

## NOTIF-922 — Redis Pub/Sub Stress Test

---

# FEATURE NOTIF-9.4 — E2E Testing

---

## NOTIF-930 — Real-Time Notification Flow

### Scenario

* Event received
* Socket notification delivered
* ACK received

---

## NOTIF-931 — Offline Push Flow

### Scenario

* User offline
* Push notification delivered

---

## NOTIF-932 — Multi-Device Notification Flow

---

# Recommended Folder Structure

```text id="b7ofnp"
/services/notification-service
├── src/
│   ├── modules/
│   │   ├── websocket/
│   │   ├── notifications/
│   │   ├── push/
│   │   ├── presence/
│   │   ├── templates/
│   │   ├── preferences/
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
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── postgres/
│   │   ├── firebase/
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

| Sprint   | Scope                   |
| -------- | ----------------------- |
| Sprint 1 | Foundation + WebSockets |
| Sprint 2 | Presence + Rooms        |
| Sprint 3 | Event Consumption       |
| Sprint 4 | Real-Time Delivery      |
| Sprint 5 | Push Notifications      |
| Sprint 6 | Notification Center     |
| Sprint 7 | Monitoring + Security   |
| Sprint 8 | QA + Hardening          |

---

# Definition of Done (DoD)

Task is DONE only if:

* Swagger documented
* Tests written
* Metrics added
* Logs added
* Retry handling implemented
* Monitoring enabled
* Socket security validated
* Push notifications tested
* CI pipeline passing

---