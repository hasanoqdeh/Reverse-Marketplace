# Quick Start Guide

## Current Status
✅ **Docker Infrastructure**: Running (PostgreSQL, MongoDB, Redis, Cassandra, RabbitMQ)
✅ **Admin Dashboard**: Running on http://localhost:3001
❌ **Microservices**: Build issues due to missing dependencies

## Working Solution

### 1. Access Admin Dashboard
```bash
# Admin dashboard is already running
open http://localhost:3001
```

### 2. Database Access
You can access databases directly for development:

**PostgreSQL:**
```bash
# Connect to PostgreSQL
docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace
```

**MongoDB:**
```bash
# Connect to MongoDB
docker exec -it reverse-marketplace-mongodb mongosh
```

**Redis:**
```bash
# Connect to Redis
docker exec -it reverse-marketplace-redis redis-cli
```

### 3. Manual Seed Data (Alternative)

Since microservices have build issues, you can manually insert seed data:

**PostgreSQL (Identity Service):**
```sql
-- Connect to PostgreSQL and run:
INSERT INTO users (id, phone_number, full_name, role, is_verified, trust_score, created_at, updated_at) 
VALUES 
  ('admin-001', '+966500000001', 'System Administrator', 'ADMIN', true, 100.0, NOW(), NOW()),
  ('buyer-001', '+966511111111', 'Ahmed Mohammed', 'BUYER', true, 85.5, NOW(), NOW());
```

**MongoDB (Bidding Service):**
```javascript
// Connect to MongoDB and run:
db.bids.insertMany([
  {
    requestId: 'req-001',
    merchantId: 'merchant-001',
    price: 5500.00,
    currency: 'SAR',
    status: 'PENDING',
    createdAt: new Date()
  }
]);
```

### 4. API Gateway (Kong)
- **Admin UI**: http://localhost:8001
- **API Endpoints**: http://localhost:8000

## Next Development Steps

1. **Fix Microservice Dependencies**: Add missing TypeORM/Mongoose dependencies
2. **Resolve Entity Structure**: Align seed data with actual schemas
3. **Build Services**: Compile all microservices successfully
4. **Run Seed Data**: Execute seed scripts for all services

## Current Working Features

- ✅ Database connectivity
- ✅ Admin dashboard interface
- ✅ API Gateway routing
- ⚠️  Microservices need dependency fixes
- ⚠️  Seed data needs manual insertion or service fixes
