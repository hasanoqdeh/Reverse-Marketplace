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
│   │       └── requests/      # Requests, categories (routes/controllers/repos/services)
│   ├── database/
│   │   ├── migrate.js         # Migration runner
│   │   └── migrations/        # SQL migration files (001_identity, 002_requests)
│   └── init.sql               # Postgres bootstrap (Docker)
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
| Realtime | Socket.io |
| Payments | Stripe |
| SMS | Twilio |
| Email | Nodemailer |
| Admin | Next.js 14 App Router |
| Mobile | React Native 0.72 |
| Validation | Joi |
| Logging | Winston |
| Tests | Jest + Supertest |

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

## Security Reminders
- Never commit `.env` files
- JWT secrets, Stripe keys, and Twilio credentials live in env vars
- Rate limiting is applied at the gateway level (express-rate-limit)
- Input validation with Joi on all endpoints
