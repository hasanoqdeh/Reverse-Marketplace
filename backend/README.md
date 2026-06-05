# Reverse Marketplace — Backend

Modular monolith Express/Node.js backend serving the mobile app and admin panel.

## Architecture

Single Express server (port 3000). All functionality in one process, organized by module.

```
src/
├── server.js              # Entry point — registers all routes, middleware, Socket.IO
├── config/                # App config (loaded from env)
├── prisma/                # Single Prisma schema + shared PrismaClient
├── cache/                 # Shared Redis client
├── database/              # PostgreSQL connection wrapper
├── events/                # RabbitMQ publisher (publish.js)
├── middleware/
│   ├── authenticate.js    # JWT verification
│   ├── authorize.js       # Role-based access (BUYER, MERCHANT, ADMIN)
│   └── rateLimiting.js
├── utils/logger.js
└── modules/
    ├── identity/          # Auth, users, OTP, admin users
    │   ├── routes/
    │   ├── controllers/
    │   ├── repositories/  # UserRepository, TokenRepository, AdminRepository
    │   └── services/      # OtpService, TokenService, AdminService
    └── requests/          # Requests, categories, bids, chat, reviews, notifications
        ├── routes/
        ├── controllers/
        └── repositories/
```

## Tech Stack

| | |
|---|---|
| Runtime | Node.js + Express |
| ORM | Prisma (PostgreSQL) |
| Database | PostgreSQL |
| Cache | Redis |
| Queue | RabbitMQ + Bull |
| Auth | JWT + bcryptjs |
| Realtime | Socket.IO |
| Validation | Joi |
| Logging | Winston |

## Quick Start

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Seed database
npm run seed

# Start dev server (nodemon)
npm run dev

# Generate Prisma client (after schema changes)
npx prisma generate --schema=src/prisma/schema.prisma
```

## Environment Variables

```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3000
```

## API Modules

| Prefix | Description |
|--------|-------------|
| `POST /api/v1/auth/*` | Phone OTP login, token refresh, logout |
| `GET/PUT /api/v1/users/me` | Current user profile |
| `GET /api/v1/users/:id` | Public user profile |
| `GET/POST /api/v1/requests` | Create/list buyer requests |
| `GET/PATCH/DELETE /api/v1/requests/:id` | Request detail, update, cancel |
| `GET/POST /api/v1/requests/:id/bids` | List bids, submit bid |
| `PATCH /api/v1/bids/:id/accept` | Accept bid (buyer) |
| `PATCH /api/v1/bids/:id/reject` | Reject bid (buyer) |
| `PATCH /api/v1/bids/:id/fulfillment` | Update fulfillment status (merchant) |
| `PATCH /api/v1/bids/:id/confirm-delivery` | Confirm receipt (buyer) |
| `GET/POST /api/v1/chat/rooms` | List/create chat rooms |
| `GET /api/v1/chat/rooms/:id/messages` | Get messages |
| `POST /api/v1/chat/rooms/:id/messages` | Send message |
| `GET /api/v1/notifications` | List notifications |
| `PATCH /api/v1/notifications/:id/read` | Mark read |
| `GET /api/v1/reviews/merchant/:id` | Merchant review stats |
| `POST /api/v1/reviews` | Submit review |
| `GET /api/v1/categories` | List request categories |
| `GET /api/v1/admin/*` | Admin endpoints (ADMIN role required) |

## Database Migrations

Migrations are numbered SQL files tracked by a `migrations` table.

```bash
npm run db:migrate           # run all pending migrations
```

Files: `backend/database/migrations/001_identity.sql`, `002_requests.sql`

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | client→server | Subscribe to a chat room |
| `leave_room` | client→server | Unsubscribe from a chat room |
| `send_message` | client→server | Send a chat message |
| `new_message` | server→client | Broadcast new message to room |
| `notification:new` | server→client | Push new notification |
| `notification:read` | server→client | Mark single notification read |
| `notification:all_read` | server→client | All notifications marked read |
