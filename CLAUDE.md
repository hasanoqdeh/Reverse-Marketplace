# Reverse Marketplace — Claude Code Guide

## Project Overview
A reverse marketplace platform where buyers post requests and merchants bid to fulfill them. Full-stack monorepo with microservices backend and multiple frontends.

## Architecture

```
reverse-marketplace/
├── backend/
│   ├── gateway/          # Express API Gateway (entry point, port 3000)
│   └── services/
│       ├── identity-service/
│       ├── user-service/
│       ├── bidding-service/
│       ├── chat-service/
│       ├── notification-service/
│       ├── order-service/
│       ├── payment-service/
│       ├── product-service/
│       └── subscription-service/
├── admin-panel/          # Next.js 14 App Router (admin dashboard)
├── buyer-app/            # React Native (buyers)
├── merchant-app/         # React Native (merchants)
├── prisma/               # Shared Prisma schema
├── rabbitmq/             # RabbitMQ config
├── nginx/                # Nginx config
└── docker-compose.yml
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express, microservices |
| ORM | Knex (SQL queries) + Prisma (schema/types) |
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
# Run all services
npm run dev:backend      # backend gateway on :3000
npm run dev:admin        # admin panel (Next.js)
npm run dev:buyer        # buyer app (React Native)
npm run dev:merchant     # merchant app (React Native)

# Individual installs
npm run install:all

# Tests & lint
npm run test:backend
npm run lint:all

# DB
cd backend && npm run migrate
cd backend && npm run seed
```

## Git Workflow
- Main branch: `master`
- Dev branch: `develop`
- Feature branches off `develop`
- PRs target `develop` → merge to `master` for releases

## Key Patterns

- Each microservice is self-contained under `backend/services/<name>/`
- Inter-service communication via RabbitMQ (amqplib)
- All routes go through the API Gateway (`backend/gateway/`)
- Shared types/utilities in `backend/shared/`
- Admin panel uses Next.js App Router with `app/admin/` routes
- Mobile apps use React Navigation (stack + bottom tabs)

## Security Reminders
- Never commit `.env` files
- JWT secrets, Stripe keys, and Twilio credentials live in env vars
- Rate limiting is applied at the gateway level (express-rate-limit)
- Input validation with Joi on all endpoints
