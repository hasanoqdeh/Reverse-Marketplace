# Reverse Marketplace — Product & Technical Documentation

**Version:** 1.0 (MVP/Prototype)
**Date:** May 2026
**Audience:** Investors & Technical Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [User Flows & Features](#3-user-flows--features)
4. [Technical Architecture](#4-technical-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Data Models](#6-data-models)
7. [API Reference Overview](#7-api-reference-overview)
8. [Real-Time & Event System](#8-real-time--event-system)
9. [Infrastructure & DevOps](#9-infrastructure--devops)
10. [Security](#10-security)
11. [Development Status & Roadmap](#11-development-status--roadmap)

---

## 1. Executive Summary

**Reverse Marketplace** is a mobile-first platform that flips the traditional e-commerce model: instead of buyers browsing seller listings, **buyers post what they need and merchants compete to fulfill it**. A buyer submits a request with a budget range, location, and description. Qualified merchants discover that request, submit competitive bids, and communicate directly via in-app chat. The buyer selects the best offer, the merchant fulfills the order, and both parties leave verified reviews.

This model creates a demand-driven marketplace where buyers always get competitive pricing and merchants acquire customers without advertising spend. The platform is category-agnostic and can operate across product sourcing, services, local delivery, and custom orders.

**Current Stage:** MVP / Prototype — full backend API, mobile app (Android), and admin dashboard are built and functional.

---

## 2. Product Overview

### The Problem

In traditional marketplaces, buyers must:
- Browse hundreds of irrelevant listings
- Compare prices manually across sellers
- Hope a seller offers what they need at their budget

Merchants must:
- Pay for advertising to be discovered
- Compete on listing visibility rather than actual value
- Miss out on motivated buyers who have a clear need

### The Solution

A reverse marketplace where:
- **Buyers describe their need once** and receive competing offers
- **Merchants discover verified buyer intent** and bid only when they can fulfill
- **Negotiation happens in real-time** via built-in chat
- **Fulfillment is tracked** end-to-end within the platform
- **Reviews are earned** only after confirmed delivery

### Key Differentiators

| Feature | Description |
|---------|-------------|
| Demand-first model | Buyers post requests; merchants come to them |
| Competitive bidding | Multiple merchants bid on each request |
| Bid-linked chat rooms | Each bid creates a private negotiation channel |
| Fulfillment tracking | 4-stage status: Preparing → In Delivery → Delivered → Confirmed |
| Verified reviews | Reviews unlocked only after buyer confirms delivery |
| Real-time notifications | Push (FCM) + in-app (Socket.IO) for every key event |
| Admin moderation | Full admin panel for user management, content moderation, analytics |

---

## 3. User Flows & Features

### 3.1 Buyer Flow

```
Register (phone OTP)
    → Complete profile
    → Post a request (title, category, budget min/max, location, images, expiry date)
    → Receive bids from merchants
    → Open bid-linked chat rooms to negotiate
    → Accept the best bid (all others auto-rejected)
    → Track fulfillment in real time
    → Confirm delivery
    → Leave a review for the merchant
```

**Buyer Features:**
- Phone-based registration — no passwords, no email required
- Request creation with up to 5 images, budget range, and geo-location
- Request status tracking: Draft → Active → Has Bids → Completed / Cancelled / Expired
- Per-request bid list with merchant profiles and ratings
- Accept/reject individual bids
- Confirm delivery to release the review gate
- View all own requests and their history

### 3.2 Merchant Flow

```
Register (phone OTP)
    → Complete merchant profile + store setup
    → Discover open requests (browse + filter by category/location)
    → Submit a bid (amount, delivery days, notes, terms)
    → Chat with buyer through bid-linked room
    → Update fulfillment status as order progresses
    → Receive buyer's delivery confirmation
    → Leave a review for the buyer
```

**Merchant Features:**
- Merchant store profile with public rating stats
- Discover screen: browse all active requests with filters
- Bid templates for recurring offer types
- Fulfillment status update: `AWAITING → PREPARING → IN_DELIVERY → DELIVERED`
- Activity screen: full bid history with status tracking
- Public merchant profile showing avg rating, total reviews, completed bids

### 3.3 Admin Flow

Accessible via web dashboard (Next.js admin panel):

- **Dashboard:** KPI metrics — total users, active requests, bids placed, messages sent, unread notifications
- **User Management:** list, search, suspend, ban, activate users; revoke individual sessions; view user activity logs
- **Bulk Actions:** apply status changes to multiple users at once
- **Request Moderation:** view all requests, override status, hard-delete violating content
- **Bid Moderation:** force-reject bids, view platform-wide bid history
- **Analytics:** per-entity stats (users, requests, bids, chat, notifications) with trend data
- **Category Management:** create/edit/delete request categories (hierarchical tree support)
- **Activity Logs:** full audit trail of admin actions

---

## 4. Technical Architecture

```
┌──────────────────────────────────────┐
│         Mobile App (React Native)    │
│   Android & iOS  |  TypeScript       │
│   REST API + Socket.IO               │
└──────────────┬───────────────────────┘
               │ HTTPS + WebSocket
               ▼
┌──────────────────────────────────────┐
│       Express API  (port 3000)       │
│       Node.js — Modular Monolith     │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Identity │  │    Requests      │  │
│  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Bidding  │  │      Chat        │  │
│  └──────────┘  └──────────────────┘  │
│  ┌──────────┐  ┌──────────────────┐  │
│  │Notifs    │  │    Reviews       │  │
│  └──────────┘  └──────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │         Analytics              │  │
│  └────────────────────────────────┘  │
└──────────┬────────────────┬──────────┘
           │                │ RabbitMQ events
     ┌─────▼─────┐    ┌─────▼───────────┐
     │PostgreSQL │    │   RabbitMQ      │
     │(primary)  │    │   Event Bus     │
     └───────────┘    └──┬──────────┬───┘
     ┌───────────┐       │          │
     │  MongoDB  │  Analytics   Notification
     │(chat/logs)│  Consumer    Consumer
     └───────────┘               │
     ┌───────────┐               ▼ FCM + Socket.IO
     │  Redis    │        ┌─────────────┐
     │(cache/RL) │        │ Mobile Push │
     └───────────┘        └─────────────┘

┌──────────────────────────────────────┐
│    Admin Panel (Next.js 14)          │
│    Connects to same Express API      │
└──────────────────────────────────────┘
```

### Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Backend pattern | Modular monolith | Single deployable unit, modules isolate concerns, easy to split later |
| Primary database | PostgreSQL via Prisma | Relational integrity for users, requests, bids, reviews |
| Secondary database | MongoDB | Flexible schema for chat messages, OTP codes, activity logs |
| Cache layer | Redis | Sub-millisecond lookups for categories, search results, rate limit counters |
| Event bus | RabbitMQ | Decouples analytics and notification side-effects from core request handling |
| Real-time | Socket.IO | Bidirectional events for chat messages and live notifications |
| Mobile | React Native 0.72 | Single codebase for Android + iOS |
| Admin | Next.js 14 App Router | Server components, fast builds, Tailwind UI |

---

## 5. Tech Stack

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express | 4.18 |
| ORM | Prisma | 5.22 |
| Primary DB | PostgreSQL | 15 |
| Document DB | MongoDB | 7 |
| Cache | Redis | 7 |
| Message Queue | RabbitMQ + Bull | 3.12 |
| Real-time | Socket.IO | 4.7 |
| Auth | JWT + bcryptjs | — |
| Validation | Joi | 17.9 |
| File Upload | Multer | 1.4 |
| Logging | Winston | 3.10 |
| Payments | Stripe SDK | 13.6 |
| SMS | Twilio | 4.15 |
| Push Notifications | Firebase Admin SDK | 13.10 |
| API Docs | Swagger UI | 5.0 |
| Testing | Jest + Supertest | 29.6 |

### Mobile App

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.72 |
| Language | TypeScript | 4.8 |
| Navigation | React Navigation 6 | 6.x |
| HTTP Client | Axios | 1.5 |
| Real-time | Socket.IO Client | 4.8 |
| Push Notifications | Firebase Messaging (FCM) | 18.5 |
| Secure Storage | React Native Keychain | 8.1 |
| Maps | React Native Maps | 1.7 |
| Media | React Native Image Picker | 5.6 |
| Audio | React Native Audio Recorder Player | 3.6 |
| UI | React Native Paper + Vector Icons | 5.10 |
| Animation | React Native Reanimated | 3.5 |

### Admin Panel

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | 14.0 |
| Language | TypeScript | 5.0 |
| Styling | Tailwind CSS | 3.3 |
| UI Components | Radix UI + shadcn/ui | — |
| Charts | Recharts | 2.8 |
| Forms | React Hook Form + Zod | 7.45 / 3.22 |
| Data Fetching | React Query | 3.39 |
| HTTP Client | Axios | 1.5 |
| Auth | JWT via jose | 6.2 |
| Testing | Vitest | 4.1 |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | Codemagic (mobile builds) |
| Environment Config | dotenv (.env files) |

---

## 6. Data Models

### Core Entities

**User**
- Identified by UUID, authenticated via phone number
- Role: `BUYER`, `MERCHANT`, or `ADMIN`
- Status: `PENDING`, `ACTIVE`, `BANNED`, `SUSPENDED`
- Has one `UserProfile` (name, avatar, location)
- Has many `AuthToken` records (device sessions, refresh tokens)

**Request**
- Posted by a Buyer
- Fields: title, description, category, budget range (min/max), location (lat/lng + address), expiry date, up to 5 images
- Status lifecycle: `DRAFT → ACTIVE → HAS_BIDS → COMPLETED / CANCELLED / EXPIRED`
- Tracks `bidCount` and `viewCount` counters

**Bid**
- Submitted by a Merchant on a Request
- Fields: amount, delivery days, notes, special terms, optional bid template name
- Status: `PENDING → ACCEPTED / REJECTED / WITHDRAWN / EXPIRED`
- Fulfillment status: `AWAITING → PREPARING → IN_DELIVERY → DELIVERED → CONFIRMED`
- Each accepted bid links to a `ChatRoom`

**ChatRoom**
- Types: `DIRECT`, `GROUP`, `REQUEST`, `BID`, `SUPPORT`
- Bid-linked rooms created automatically when a bid is submitted
- Tracks participants and `lastMessageAt` for ordering
- Messages stored in MongoDB (flexible schema: TEXT, IMAGE, FILE, VOICE, LOCATION, SYSTEM)

**Notification**
- Types: `NEW_MESSAGE`, `BID_PLACED`, `BID_ACCEPTED`, `STATUS_IN_DELIVERY`, `FULFILLMENT_UPDATED`, `DELIVERY_CONFIRMED`, `BUYER_REVIEW`
- Stored in PostgreSQL; delivered via FCM (push) and Socket.IO (in-app)

**Review**
- Written after delivery is confirmed (`fulfillmentStatus = CONFIRMED`)
- Types: `BUYER_TO_MERCHANT` or `MERCHANT_TO_BUYER`
- One review per bid per reviewer (enforced at DB level)
- Powers merchant public profile stats (avg rating, total reviews, completed bids, rating distribution)

### Request Category Tree
- Hierarchical: categories can have a `parentId` (self-referencing)
- Cached in Redis for 10 minutes
- Managed by admins via the admin panel

---

## 7. API Reference Overview

All endpoints are versioned under `/api/v1`. Full interactive documentation available at `/api-docs` (Swagger UI).

### Identity Module (`/api/v1/identity`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/login` | No | Send OTP to phone number |
| POST | `/auth/verify-otp` | No | Verify OTP, receive JWT tokens |
| POST | `/auth/resend-otp` | No | Resend OTP (60-sec cooldown) |
| POST | `/auth/refresh-token` | No | Exchange refresh token for new access token |
| POST | `/auth/logout` | Yes | Revoke refresh token |
| PATCH | `/auth/profile` | Yes | Update own profile |
| GET | `/admin/users` | Admin | List all users (paginated, filterable) |
| POST | `/admin/users/bulk-action` | Admin | Suspend/ban/activate multiple users |
| GET | `/admin/users/:id` | Admin | Get single user details |
| POST | `/admin/users/:id/suspend` | Admin | Suspend user |
| POST | `/admin/users/:id/ban` | Admin | Ban user, revoke all sessions |
| POST | `/admin/users/:id/activate` | Admin | Lift suspension or ban |
| GET | `/admin/users/:id/sessions` | Admin | List active sessions |
| DELETE | `/admin/users/:id/sessions/:sessionId` | Admin | Revoke specific session |
| GET | `/admin/dashboard/metrics` | Admin | KPI metrics |

### Requests Module (`/api/v1/requests`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/categories` | No | List all active categories |
| GET | `/` | Optional | Search/filter requests (cached 2 min) |
| POST | `/publish` | Buyer | Create and publish a new request |
| GET | `/me/requests` | Buyer | Get own requests |
| GET | `/:id` | Optional | Get request details (increments view count) |
| POST | `/:id/cancel` | Buyer | Cancel request |
| POST | `/:id/complete` | Buyer | Accept a bid and complete request |
| POST | `/:id/images` | Buyer | Upload image to request (max 5) |
| DELETE | `/:id/images/:imageId` | Buyer | Delete request image |
| GET | `/admin/requests` | Admin | List all requests |
| PATCH | `/admin/requests/:id/status` | Admin | Override request status |
| DELETE | `/admin/requests/:id` | Admin | Hard-delete request (moderation) |

### Bidding Module (`/api/v1/bidding`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/bids` | Merchant | Submit a bid on a request |
| GET | `/me/bids` | Merchant | List own bids (filterable by status) |
| GET | `/bids/:id` | Yes | Get bid details |
| PUT | `/bids/:id` | Merchant | Update a pending bid |
| DELETE | `/bids/:id` | Merchant | Withdraw a pending bid |
| GET | `/requests/:requestId/bids` | Buyer | Get all bids on own request |
| POST | `/bids/:id/accept` | Buyer | Accept bid (rejects all others) |
| POST | `/bids/:id/reject` | Buyer | Reject a specific bid |
| POST | `/bids/:id/confirm` | Buyer | Confirm delivery |
| PATCH | `/bids/:id/fulfillment` | Merchant | Update fulfillment status |
| GET | `/admin/bids` | Admin | List all bids |
| POST | `/admin/bids/:id/force-reject` | Admin | Force-reject bid (moderation) |

### Chat Module (`/api/v1/chat`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/rooms` | Yes | Create a chat room |
| GET | `/rooms` | Yes | List user's rooms (ordered by last message) |
| GET | `/rooms/:id` | Yes | Get room details |
| POST | `/rooms/:id/messages` | Yes | Send a message |
| GET | `/rooms/:id/messages` | Yes | Get messages (cursor-based pagination) |
| DELETE | `/rooms/:id/messages/:messageId` | Yes | Soft-delete a message |
| POST | `/rooms/:id/read` | Yes | Mark all messages as read |
| POST | `/rooms/:id/react` | Yes | Toggle emoji reaction |
| POST | `/rooms/:id/participants` | Yes | Add participant |
| DELETE | `/rooms/:id/participants/me` | Yes | Leave room |
| POST | `/upload` | Yes | Upload media (image/audio, max 15 MB) |

### Notifications Module (`/api/v1/notifications`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/` | Yes | List notifications + unread count |
| POST | `/read-all` | Yes | Mark all as read |
| POST | `/:id/read` | Yes | Mark single notification as read |
| DELETE | `/:id` | Yes | Delete notification |
| POST | `/device-token` | Yes | Register FCM device token |
| DELETE | `/device-token` | Yes | Remove FCM device token |

### Reviews Module (`/api/v1/reviews`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/` | Yes | Submit a review (after confirmed delivery) |
| GET | `/user/:userId` | No | Get reviews received by a user |
| GET | `/merchants/:merchantId` | No | Merchant public profile + rating stats |

### Analytics Module (`/api/v1/analytics`)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/overview` | Admin | Cross-domain KPI summary |
| GET | `/users` | Admin | User registration and role stats |
| GET | `/requests` | Admin | Request stats by status and category |
| GET | `/bids` | Admin | Bid acceptance rate, avg amount, fulfillment |
| GET | `/chat` | Admin | Chat room and message stats |
| GET | `/notifications` | Admin | Notification delivery and read rates |
| GET | `/activity` | Admin | Full activity log (filterable, paginated) |
| GET | `/stats` | Admin | Aggregated event stats (by category, by day) |

---

## 8. Real-Time & Event System

### Socket.IO (In-App Real-Time)

| Event | Direction | Trigger |
|-------|-----------|---------|
| `join_room` | Client → Server | User opens a chat room |
| `leave_room` | Client → Server | User leaves a chat room |
| `send_message` | Client → Server | User sends a message |
| `new_message` | Server → Client | Message broadcast to room participants |
| `notification` | Server → Client | Real-time in-app notification delivery |

### RabbitMQ Event Bus

Events published by the core API are consumed asynchronously:

| Event | Publisher | Consumer | Action |
|-------|-----------|----------|--------|
| `bid.submitted` | Bidding Module | Analytics Consumer | Log event to MongoDB |
| `bid.submitted` | Bidding Module | Notification Consumer | Send FCM push + Socket.IO notification to buyer |
| `bid.accepted` | Bidding Module | Notification Consumer | Notify merchant |
| `fulfillment.updated` | Bidding Module | Notification Consumer | Notify buyer of status change |
| `delivery.confirmed` | Bidding Module | Notification Consumer | Notify merchant |

### Firebase Cloud Messaging (FCM)

Push notifications sent to mobile devices for:
- New bid received on a request
- Bid accepted or rejected
- Fulfillment status update
- New chat message (when app is backgrounded)
- Delivery confirmed

Device tokens are registered per-user per-device and stored in the `DeviceToken` table.

---

## 9. Infrastructure & DevOps

### Services (Docker Compose)

| Service | Image | Purpose | Exposed Port |
|---------|-------|---------|-------------|
| postgres | postgres:15-alpine | Primary relational database | 5432 |
| mongodb | mongo:7 | Chat, activity logs, OTP codes | 27017 |
| redis | redis:7-alpine | Cache, rate limiting | 6379 |
| rabbitmq | rabbitmq:3.12-management | Event bus + management UI | 5672 / 15672 |
| backend | Custom Dockerfile | Express API + migration runner | 3000 |
| admin-panel | Custom Dockerfile | Next.js 14 admin dashboard | 3001 |

All services share a single internal Docker bridge network.

### Nginx

Nginx reverse proxy sits in front of the backend and admin panel, handling:
- SSL termination
- Port routing (public port → internal container port)
- Static file serving

### CI/CD

**Codemagic** builds and distributes the React Native mobile app:
- Android builds (APK / AAB)
- iOS builds (IPA)
- Configured via `codemagic.yaml`

### Database Migrations

Migrations are numbered SQL files (`001_identity.sql`, `002_requests.sql`, ...) tracked by a `migrations` table in PostgreSQL. The migration runner (`database/migrate.js`) runs automatically at container startup before the API starts.

### Environment Configuration

All secrets and environment variables are managed via `.env` files:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `JWT_SECRET` | JWT signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `TWILIO_*` | SMS OTP credentials |
| `FIREBASE_*` | FCM push notification credentials |
| `STRIPE_SECRET_KEY` | Payment processing |

---

## 10. Security

| Measure | Implementation |
|---------|---------------|
| Authentication | Phone OTP via Twilio — no passwords |
| Token security | JWT access tokens (short-lived) + refresh tokens (long-lived, hashed with bcryptjs) |
| Role-based access | BUYER / MERCHANT / ADMIN enforced at middleware level on every route |
| HTTP security | Helmet middleware — sets secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.) |
| Rate limiting | `express-rate-limit` with Redis-backed counters, 15-minute sliding windows |
| Device fingerprinting | Device + IP metadata stored per session; anomalous sessions flagged |
| Session management | Admins can revoke individual or all sessions per user |
| Input validation | Joi schema validation on all POST/PUT/PATCH endpoints — no raw user input reaches DB |
| SQL injection | Parameterized queries via Prisma ORM — no raw SQL with user input |
| CORS | Dynamic origin whitelist; localhost only in development |
| File uploads | Multer with strict MIME type checks; 10 MB API / 15 MB chat media limits |
| Secrets management | No secrets in codebase; all credentials via environment variables |

---

## 11. Development Status & Roadmap

### What Is Built (MVP/Prototype)

| Component | Status |
|-----------|--------|
| Backend API (7 modules, 60+ endpoints) | Done |
| PostgreSQL schema + migrations | Done |
| MongoDB collections (chat, logs, OTP) | Done |
| Redis caching layer | Done |
| RabbitMQ event bus + consumers | Done |
| Socket.IO real-time (chat + notifications) | Done |
| Firebase Cloud Messaging (push) | Done |
| React Native mobile app (Android) | Done |
| React Native mobile app (iOS) | Built (needs device testing) |
| Next.js 14 Admin Panel | Done |
| Docker Compose orchestration | Done |
| Nginx reverse proxy | Done |
| Codemagic CI/CD | Done |
| Swagger API documentation | Done |

### Known Limitations at MVP Stage

- **Payments:** Stripe SDK is integrated but payment flows are not yet active in the API routes
- **SMS OTP:** Twilio is wired up; live credentials required for production use
- **iOS testing:** Native files present but not device-tested
- **Test coverage:** Jest/Supertest framework configured; unit and integration test suite expansion needed
- **Horizontal scaling:** Architecture is single-instance; Redis/RabbitMQ are ready to support multi-instance deployment

### Suggested Next Steps

1. Activate Stripe payment flows (bid fees, escrow, payouts)
2. Expand test suite to cover all critical paths
3. Load test the API under concurrent bid submission
4. iOS TestFlight distribution
5. Implement saved search notifications (existing `SavedSearch` model ready)
6. Add merchant verification / KYC flow
7. Build buyer and merchant onboarding flows

---

*Document generated from live codebase analysis — May 2026*
