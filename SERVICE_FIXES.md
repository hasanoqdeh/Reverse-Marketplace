# Service Fixes and Solutions

## Current Status
✅ **Working**: Docker infrastructure, Admin dashboard, Kong API Gateway
❌ **Issues**: Microservices failing to start due to missing compiled files

## Root Causefc
Microservices are looking for `/app/dist/main.js` but files don't exist. Services need to be built before they can run.

## Immediate Solutions

### 1. Build All Services
```bash
# Build all services at once
pnpm run build

# Or build individual services
nx run identity-service:build
nx run request-service:build
nx run payment-service:build
nx run bidding-service:build
nx run chat-service:build
nx run matching-engine:build
nx run notification-service:build
```

### 2. Fix Common Build Issues

#### Identity Service
- **Issue**: Missing Prisma client
- **Fix**: `cd services/identity-service && npx prisma generate`

#### Other Services
- **Issue**: Missing TypeORM entities and dependencies
- **Fix**: Install missing dependencies and create entity files

### 3. Restart Services
```bash
# Stop containers
docker stop $(docker ps -q --filter "name=reverse-marketplace" --format "{{.Names}}")

# Start containers (after building)
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

### 4. Run Seed Data
```bash
# Once services are running
pnpm run seed:all

# Or individual services
pnpm run seed:identity
pnpm run seed:request
pnpm run seed:payment
pnpm run seed:bidding
pnpm run seed:chat
pnpm run seed:matching
```

### 5. Database Seed Data (Manual)
```bash
# Connect to PostgreSQL and run seed
docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace -f /path/to/DATABASE_SEED.sql

# Connect to MongoDB for bidding service
docker exec -it reverse-marketplace-mongodb mongosh reverse_marketplace

# Connect to Redis for caching
docker exec -it reverse-marketplace-redis redis-cli
```

### 6. Access Points
- **Admin Dashboard**: http://localhost:3000
- **API Gateway**: http://localhost:8000
- **Kong Admin**: http://localhost:8001

## Next Steps Priority

1. **HIGH**: Build all microservices
2. **MEDIUM**: Start microservices after build
3. **MEDIUM**: Run seed data
4. **LOW**: Verify all service connectivity

## Troubleshooting Commands

```bash
# Check service logs
docker logs reverse-marketplace-identity
docker logs reverse-marketplace-request
docker logs reverse-marketplace-payment
docker logs reverse-marketplace-bidding
docker logs reverse-marketplace-chat
docker logs reverse-marketplace-matching
docker logs reverse-marketplace-notification

# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Restart specific service
docker restart reverse-marketplace-identity
```

The main issue is that microservices need to be compiled before they can start. Once built, they should run successfully with the existing infrastructure.
