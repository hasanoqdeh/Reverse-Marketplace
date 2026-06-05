# Reverse Marketplace

A reverse marketplace where buyers post requests and merchants compete to fulfill them.

## Monorepo Structure

```
.
├── backend/          # Node.js + Express modular monolith (port 3000)
├── app/              # React Native 0.72 mobile app (Buyer + Merchant)
├── admin-panel/      # Next.js 14 admin dashboard (port 3001)
├── rabbitmq/         # RabbitMQ config
├── nginx/            # Nginx reverse proxy config
└── docker-compose.yml
```

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env    # fill in DATABASE_URL, REDIS_URL, etc.
npm install
npm run db:migrate
npm run dev             # starts on port 3000
```

### Admin Panel

```bash
cd admin-panel
npm install
npm run dev             # starts on port 3001
```

### Mobile App

```bash
cd app
npm install
cd ios && pod install && cd ..    # iOS only

# Start Metro bundler
npx react-native start

# Run on Android emulator
npx react-native run-android
```

## How It Works

1. **Buyer** creates a request (title, description, budget, category, photos)
2. **Merchants** browse open requests and submit bids (price, delivery days, notes)
3. **Buyer** reviews bids, chats with merchants, accepts the best offer
4. **Merchant** updates fulfillment status (PREPARING → IN_DELIVERY → DELIVERED)
5. **Buyer** confirms delivery and leaves a review

## Key Docs

- [`backend/README.md`](backend/README.md) — API endpoints, env vars, migrations, Socket.IO events
- [`app/README.md`](app/README.md) — Mobile setup, theme system, screen inventory
- [`CLAUDE.md`](CLAUDE.md) — Claude Code guide for AI-assisted development
