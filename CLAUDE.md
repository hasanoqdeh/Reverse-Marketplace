# Reverse Marketplace — Claude Code Guide

## Project Overview
A reverse marketplace platform where buyers post requests and merchants bid to fulfill them. Full-stack monorepo with a modular monolith backend and multiple frontends.

## Architecture

```
reverse-marketplace/
├── backend/
│   ├── src/
│   │   ├── server.js          # Entry point (Express, port 3000)
│   │   ├── config/            # Merged app config
│   │   ├── prisma/            # Merged schema + single PrismaClient
│   │   ├── cache/             # Shared Redis client
│   │   ├── database/          # DB connection wrapper
│   │   ├── events/            # RabbitMQ publisher
│   │   ├── middleware/        # authenticate, authorize, rateLimiting
│   │   ├── utils/             # logger
│   │   └── modules/
│   │       ├── identity/      # Auth, users, admin (routes/controllers/repos/services)
│   │       └── requests/      # Requests, categories, bids, chat, reviews, notifications
│   ├── database/
│   │   ├── migrate.js         # Migration runner
│   │   └── migrations/        # SQL migration files (001_identity, 002_requests)
│   └── init.sql               # Postgres bootstrap (Docker)
├── app/                       # React Native 0.72 mobile app
│   └── src/
│       ├── theme.ts           # Shared design tokens (Colors, Shadows)
│       ├── components/        # AppHeader, ImageViewerModal, etc.
│       ├── modules/
│       │   ├── buyer/         # BuyerNavigator + buyer screens
│       │   └── merchant/      # MerchantNavigator + merchant screens
│       └── screens/           # auth/, chat/, notifications/, profile/, rating/
├── admin-panel/               # Next.js 14 App Router (admin dashboard)
├── rabbitmq/                  # RabbitMQ config
├── nginx/                     # Nginx config
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express, modular monolith |
| ORM | Prisma (single merged schema) |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | RabbitMQ + Bull |
| Auth | JWT + bcryptjs |
| Realtime | Socket.IO (backend wired; mobile partial) |
| Admin | Next.js 14 App Router |
| Mobile | React Native 0.72 |
| Validation | Joi |
| Logging | Winston |
| Tests | Jest + Supertest |

## Mobile Theme System

All UI colors come from `app/src/theme.ts`. Never use raw hex codes in screen files — import from theme.

```typescript
import {Colors} from '../../theme';  // adjust relative path

Colors.primary       // #1877F2  — FB blue, all interactive elements
Colors.primaryLight  // #E7F3FF  — chip backgrounds, unread rows
Colors.feedBackground// #F0F2F5  — screen/list backgrounds
Colors.surface       // #FFFFFF  — cards, headers, sheets
Colors.divider       // #E4E6EA  — borders, separators
Colors.textPrimary   // #050505
Colors.textSecondary // #65676B
Colors.textOnPrimary // #FFFFFF  — text on blue backgrounds
Colors.success       // #42B72A  — confirmed/done states (keep green)
Colors.error         // #E41E3F
Colors.warning       // #F59E0B  — ratings, fulfillment progress
Colors.badge         // #E41E3F  — unread count badges
```

Green (`Colors.success`) is kept for semantic fulfillment/confirmed states. All interactive actions use `Colors.primary`.

## Dev Commands

```bash
# Run backend (port 3000)
cd backend && npm run dev

# Run admin panel (Next.js, port 3001)
cd admin-panel && npm run dev

# DB — run migrations
cd backend && npm run db:migrate

# DB — seed
cd backend && npm run seed

# Generate Prisma client (after schema changes)
cd backend && npx prisma generate --schema=src/prisma/schema.prisma
```

## Running the Mobile App on Emulators

```bash
# List available AVDs
emulator -list-avds

# Start an emulator (if none running)
emulator -avd pixel_4_api_34 -no-snapshot-load &

# Check connected devices
adb devices

# Run on a single emulator (from app/ directory)
cd app && npx react-native start          # start Metro bundler
cd app && npx react-native run-android    # installs on the only connected device

# Run on 2 emulators simultaneously
# 1. Start Metro bundler (shared by both)
cd app && npx react-native start --reset-cache &

# 2. In separate terminals, target each device by ID
npx react-native run-android --deviceId emulator-5554
npx react-native run-android --deviceId emulator-5556
```

> Available AVDs: `bayer`, `pixel_4_api_34`, `test_device`
> Metro runs on port 8081 and is shared across all connected devices.

## Git Workflow
- Main branch: `master`
- Dev branch: `develop`
- Feature branches off `develop`
- PRs target `develop` → merge to `master` for releases

## Key Patterns

- Each module lives under `backend/src/modules/<name>/` with routes, controllers, repositories, services
- Shared infrastructure (config, prisma, cache, events, middleware, utils) in `backend/src/`
- Single `DATABASE_URL` — one PostgreSQL database, one Prisma schema, one client
- Migrations are numbered SQL files in `backend/database/migrations/` tracked by a `migrations` table
- Inter-module events via RabbitMQ through `src/events/publisher.js`
- Admin panel uses Next.js App Router with `app/admin/` routes
- Mobile screens import `Colors` from `app/src/theme.ts` — no raw hex strings in StyleSheets

## Deleted Files (cleanup 2025-05)

These files were removed as dead code — replaced by newer implementations:

| File | Reason |
|------|--------|
| `app/src/modules/merchant/screens/BrowseRequestsScreen.tsx` | Replaced by `MerchantDiscoverScreen.tsx` |
| `app/src/modules/merchant/screens/MyBidsScreen.tsx` | Replaced by `MerchantActivityScreen.tsx` |
| `app/src/modules/merchant/screens/DashboardScreen.tsx` | Orphaned, never registered |
| `backend/src/modules/identity/services/smsService.js` | Never imported; OTP uses RabbitMQ events |

## Security Reminders
- Never commit `.env` files
- JWT secrets, Stripe keys, and Twilio credentials live in env vars
- Rate limiting is applied at the gateway level (express-rate-limit)
- Input validation with Joi on all endpoints
