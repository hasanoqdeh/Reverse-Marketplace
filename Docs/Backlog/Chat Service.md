
# Chat Service Backlog

## Real-Time Messaging & Conversation Service

Service Name:

```text id="f6n2xk"
chat-service
```

Primary Responsibility:

* Real-time messaging
* Buyer ↔ Merchant conversations
* Conversation lifecycle
* Message persistence
* Media messaging
* Read receipts
* Typing indicators
* Message delivery tracking

Recommended Stack:

* NestJS
* Socket.io
* Cassandra
* Redis
* RabbitMQ
* S3-Compatible Storage
* BullMQ
* Prometheus

---

# Service Boundaries

## Owns

* Conversations
* Messages
* Message delivery states
* Read receipts
* Typing events
* Chat media metadata

## Publishes Events

* chat.message.sent
* chat.message.read
* chat.conversation.created
* chat.user.typing
* chat.user.online

## Consumes Events

* bid.accepted
* request.completed
* request.cancelled
* user.banned
* user.deleted

---

# Core Business Rules

---

## Conversation Rules

* Conversation starts only after bid acceptance.
* One conversation per request + merchant.
* Buyer and merchant only participants.
* Admin access restricted via support escalation.

---

## Message Rules

* Messages immutable after delivery.
* Soft delete allowed.
* Media messages supported.
* Maximum message size configurable.

---

## Security Rules

* Users access only own conversations.
* JWT authentication mandatory.
* Message payload sanitized.

---

# Cassandra Data Modeling

---

# conversations

| Column          | Type      |
| --------------- | --------- |
| conversation_id | UUID      |
| request_id      | UUID      |
| buyer_id        | UUID      |
| merchant_id     | UUID      |
| status          | TEXT      |
| created_at      | TIMESTAMP |

---

# messages

Partition Key:

```text id="gtxqf6"
conversation_id
```

Clustering Key:

```text id="x0d7p1"
created_at DESC
```

| Column          | Type      |
| --------------- | --------- |
| conversation_id | UUID      |
| message_id      | TIMEUUID  |
| sender_id       | UUID      |
| message_type    | TEXT      |
| text            | TEXT      |
| media_url       | TEXT      |
| is_read         | BOOLEAN   |
| created_at      | TIMESTAMP |

---

# message_delivery_status

| Column          | Type      |
| --------------- | --------- |
| conversation_id | UUID      |
| message_id      | TIMEUUID  |
| delivered_to    | UUID      |
| status          | TEXT      |
| updated_at      | TIMESTAMP |

---

# ENUM conversation_status

```text id="vtv6z4"
ACTIVE
ARCHIVED
BLOCKED
CLOSED
```

---

# ENUM message_type

```text id="s5szrt"
TEXT
IMAGE
VOICE
VIDEO
LOCATION
SYSTEM
```

---

# EPIC CHAT-0 — Service Foundation

---

# FEATURE CHAT-0.1 — Service Initialization

---

## CHAT-001 — Initialize Chat Service

### Priority

Critical

### Acceptance Criteria

* NestJS initialized
* Socket.io operational
* Swagger configured
* Healthcheck operational

---

## CHAT-002 — Setup Cassandra Connection

### Acceptance Criteria

* Cluster connection operational
* Retry strategy configured
* Query consistency configured

---

## CHAT-003 — Setup Redis Integration

### Acceptance Criteria

* Pub/Sub operational
* Socket scaling supported

---

## CHAT-004 — Setup RabbitMQ Integration

### Acceptance Criteria

* Consumers operational
* Producers operational
* DLQ configured

---

## CHAT-005 — Configure Structured Logging

---

# FEATURE CHAT-0.2 — Storage Setup

---

## CHAT-010 — Configure Media Storage

### Acceptance Criteria

* S3-compatible uploads operational
* Signed URLs supported

---

## CHAT-011 — Media Upload Validation

### Acceptance Criteria

* File size limits enforced
* Mime validation enabled

---

## CHAT-012 — Virus Scanning Queue

### Acceptance Criteria

* Uploaded files scanned asynchronously

---

# EPIC CHAT-1 — Conversation Lifecycle

---

# FEATURE CHAT-1.1 — Conversation Creation

---

## CHAT-100 — Consume bid.accepted Event

### Acceptance Criteria

* Conversation auto-created
* Buyer + merchant linked

---

## CHAT-101 — Prevent Duplicate Conversations

### Acceptance Criteria

* Unique request + merchant validation

---

## CHAT-102 — Emit chat.conversation.created Event

### Payload

```json id="z5n9ry"
{
  "conversationId": "",
  "requestId": "",
  "buyerId": "",
  "merchantId": ""
}
```

---

# FEATURE CHAT-1.2 — Conversation Management

---

## CHAT-110 — Get User Conversations Endpoint

### Endpoint

```http id="t5i5ci"
GET /chat/conversations
```

### Acceptance Criteria

* Pagination supported
* Last message preview included

---

## CHAT-111 — Archive Conversation Endpoint

### Endpoint

```http id="s4by42"
PATCH /chat/conversations/{id}/archive
```

---

## CHAT-112 — Block Conversation Endpoint

### Acceptance Criteria

* Buyer can block merchant

---

## CHAT-113 — Close Conversation on Request Completion

---

# EPIC CHAT-2 — Real-Time Messaging

---

# FEATURE CHAT-2.1 — Socket Authentication

---

## CHAT-200 — Configure Chat Socket Gateway

### Acceptance Criteria

* JWT auth operational
* Unauthorized sockets rejected

---

## CHAT-201 — Join Conversation Rooms

### Room Format

```text id="07n0f2"
conversation:{conversationId}
```

---

## CHAT-202 — Conversation Access Validation

### Acceptance Criteria

* Only participants join room

---

# FEATURE CHAT-2.2 — Message Sending

---

## CHAT-210 — Send Message Event

### Socket Event

```text id="0rvqpb"
send_message
```

### Payload

```json id="4j48tt"
{
  "conversationId": "",
  "messageType": "TEXT",
  "text": "Hello"
}
```

---

## CHAT-211 — Persist Message to Cassandra

### Acceptance Criteria

* Write consistency configured
* TimeUUID generated

---

## CHAT-212 — Emit Real-Time Message

### Acceptance Criteria

* Recipient receives instantly

---

## CHAT-213 — Emit chat.message.sent Event

---

# FEATURE CHAT-2.3 — Message Types

---

## CHAT-220 — Image Message Support

---

## CHAT-221 — Voice Message Support

---

## CHAT-222 — Video Message Support

---

## CHAT-223 — Location Message Support

---

## CHAT-224 — System Messages

### Examples

* Offer accepted
* Request completed
* Merchant blocked

---

# EPIC CHAT-3 — Messaging UX Features

---

# FEATURE CHAT-3.1 — Read Receipts

---

## CHAT-300 — Mark Messages Read Event

### Socket Event

```text id="c0u57u"
mark_read
```

---

## CHAT-301 — Update Message Read Status

---

## CHAT-302 — Emit chat.message.read Event

---

# FEATURE CHAT-3.2 — Typing Indicators

---

## CHAT-310 — User Typing Event

### Socket Event

```text id="0a6qod"
typing
```

---

## CHAT-311 — Real-Time Typing Indicator

---

## CHAT-312 — Typing Timeout Handling

---

# FEATURE CHAT-3.3 — Presence

---

## CHAT-320 — User Online Status

---

## CHAT-321 — Last Seen Tracking

---

# EPIC CHAT-4 — Message History

---

# FEATURE CHAT-4.1 — Chat History API

---

## CHAT-400 — Get Conversation Messages Endpoint

### Endpoint

```http id="x1q2ea"
GET /chat/history/{conversationId}
```

### Acceptance Criteria

* Time-based pagination
* Latest-first retrieval
* Efficient Cassandra queries

---

## CHAT-401 — Cursor-Based Pagination

---

## CHAT-402 — Message Search Support (Future)

---

# FEATURE CHAT-4.2 — Conversation Metadata

---

## CHAT-410 — Last Message Aggregation

---

## CHAT-411 — Unread Count Aggregation

---

# EPIC CHAT-5 — Moderation & Safety

---

# FEATURE CHAT-5.1 — Content Moderation

---

## CHAT-500 — Message Content Sanitization

---

## CHAT-501 — Spam Detection

### Acceptance Criteria

* Flood protection
* Duplicate spam detection

---

## CHAT-502 — Toxic Content Detection (Future AI)

---

# FEATURE CHAT-5.2 — User Restrictions

---

## CHAT-510 — Consume user.banned Event

### Acceptance Criteria

* Disconnect active sessions
* Block messaging

---

## CHAT-511 — Conversation Locking

---

# FEATURE CHAT-5.3 — Admin Support Access

---

## CHAT-520 — Support Conversation Access

### Acceptance Criteria

* Ticket-based access only
* Audit logging mandatory

---

## CHAT-521 — Audit Log Recording

---

# EPIC CHAT-6 — Media Messaging

---

# FEATURE CHAT-6.1 — Upload Handling

---

## CHAT-600 — Generate Upload URLs

### Endpoint

```http id="c06dx5"
POST /chat/upload-url
```

---

## CHAT-601 — Media Compression Pipeline

---

## CHAT-602 — Thumbnail Generation

---

# FEATURE CHAT-6.2 — Media Delivery

---

## CHAT-610 — Secure Media Access

### Acceptance Criteria

* Signed URLs only

---

## CHAT-611 — CDN Integration

---

## CHAT-612 — Media Expiration Policies

---

# EPIC CHAT-7 — Observability & Monitoring

---

# FEATURE CHAT-7.1 — Metrics

---

## CHAT-700 — Prometheus Metrics

### Metrics

* Messages/sec
* Socket connections
* Message latency
* Cassandra query latency
* Upload failures

---

## CHAT-701 — Distributed Tracing

---

## CHAT-702 — Healthcheck Endpoint

### Endpoint

```http id="z35r9j"
GET /health
```

---

# FEATURE CHAT-7.2 — Alerting

---

## CHAT-710 — Cassandra Failure Alerts

---

## CHAT-711 — Socket Failure Alerts

---

## CHAT-712 — Queue Backlog Alerts

---

# EPIC CHAT-8 — Security Hardening

---

# FEATURE CHAT-8.1 — Socket Security

---

## CHAT-800 — WebSocket JWT Validation

---

## CHAT-801 — Socket Rate Limiting

---

## CHAT-802 — Conversation Authorization

---

# FEATURE CHAT-8.2 — Media Security

---

## CHAT-810 — Malicious File Detection

---

## CHAT-811 — Media Access Authorization

---

## CHAT-812 — Upload Abuse Prevention

---

# EPIC CHAT-9 — Performance Optimization

---

# FEATURE CHAT-9.1 — Cassandra Optimization

---

## CHAT-900 — Cassandra Partition Optimization

### Acceptance Criteria

* Avoid hot partitions
* Partition sizing monitored

---

## CHAT-901 — Query Optimization

---

## CHAT-902 — Read Replica Configuration

---

# FEATURE CHAT-9.2 — Socket Scalability

---

## CHAT-910 — Horizontal Socket Scaling

### Acceptance Criteria

* Redis adapter operational
* Multi-node support

---

## CHAT-911 — Connection Load Testing

### Goal

100k concurrent sockets.

---

# EPIC CHAT-10 — Testing & QA

---

# FEATURE CHAT-10.1 — Unit Testing

---

## CHAT-1000 — Message Service Tests

---

## CHAT-1001 — Conversation Service Tests

---

## CHAT-1002 — Typing Indicator Tests

---

# FEATURE CHAT-10.2 — Integration Testing

---

## CHAT-1010 — Cassandra Integration Tests

---

## CHAT-1011 — RabbitMQ Integration Tests

---

## CHAT-1012 — Socket.io Integration Tests

---

# FEATURE CHAT-10.3 — Load Testing

---

## CHAT-1020 — Concurrent Messaging Test

### Goal

50,000 concurrent messages.

---

## CHAT-1021 — Media Upload Stress Test

---

## CHAT-1022 — Cassandra Throughput Test

---

# FEATURE CHAT-10.4 — E2E Testing

---

## CHAT-1030 — Buyer ↔ Merchant Chat Flow

### Scenario

* Bid accepted
* Conversation created
* Messages exchanged

---

## CHAT-1031 — Read Receipt Flow

---

## CHAT-1032 — Offline Message Recovery Flow

---

# Recommended Folder Structure

```text id="ecjlwm"
/services/chat-service
├── src/
│   ├── modules/
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── websocket/
│   │   ├── uploads/
│   │   ├── moderation/
│   │   ├── presence/
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
│   │   ├── cassandra/
│   │   ├── redis/
│   │   ├── rabbitmq/
│   │   ├── storage/
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

| Sprint   | Scope                    |
| -------- | ------------------------ |
| Sprint 1 | Foundation + Cassandra   |
| Sprint 2 | Conversation Lifecycle   |
| Sprint 3 | Real-Time Messaging      |
| Sprint 4 | Messaging UX Features    |
| Sprint 5 | Media Messaging          |
| Sprint 6 | Moderation + Security    |
| Sprint 7 | Scalability + Monitoring |
| Sprint 8 | QA + Hardening           |

---

# Definition of Done (DoD)

Task is DONE only if:

* Swagger documented
* Tests written
* Metrics added
* Logs added
* Socket auth validated
* Cassandra queries optimized
* Media security tested
* Monitoring enabled
* CI pipeline passing

---