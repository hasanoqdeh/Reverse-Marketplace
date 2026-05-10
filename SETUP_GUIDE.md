# Automated Database Startup Setup Guide

## Overview
This guide implements a zero-manual-intervention database initialization system for the Reverse Marketplace platform.

## Files Created

### 1. Database Initialization Scripts
- `01-wait-for-databases.sh` - Database readiness detection
- `02-postgres-init.sh` - PostgreSQL initialization and seeding
- `03-mongodb-init.js` - MongoDB initialization

### 2. Application Migration Runners
- `services/identity-service/src/database/migration-runner.ts`
- `services/identity-service/src/database/seed-runner.ts`
- `services/identity-service/src/database/migration-runner-cli.ts`
- `services/identity-service/src/database/seed-runner-cli.ts`
- `services/identity-service/scripts/wait-for-db.sh`

### 3. Updated Configuration
- `infrastructure/docker/docker-compose.dev.yml` - Enhanced with health checks
- `services/identity-service/Dockerfile` - Enhanced health check
- `services/identity-service/package.json` - New migration/seed scripts

## Setup Instructions

### Step 1: Move Scripts to Correct Location
```bash
# Move initialization scripts to init-scripts directory
sudo mv 01-wait-for-databases.sh infrastructure/docker/init-scripts/
sudo mv 02-postgres-init.sh infrastructure/docker/init-scripts/
sudo mv 03-mongodb-init.js infrastructure/docker/init-scripts/

# Make scripts executable
sudo chmod +x infrastructure/docker/init-scripts/*.sh
```

### Step 2: Build Services
```bash
# Build all services
npm run build

# Or build individual service
cd services/identity-service
npm run build
```

### Step 3: Start Infrastructure
```bash
# Start databases first
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d postgres mongodb redis rabbitmq cassandra

# Wait for databases to be ready (check logs)
docker-compose logs -f postgres
```

### Step 4: Start Services
```bash
# Start all services with automatic initialization
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Monitor startup logs
docker-compose logs -f identity-service
```

## How It Works

### 1. Database Readiness Detection
- Each database container has health checks
- Services wait for databases to be healthy before starting
- Prevents connection errors during startup

### 2. First-Run Detection
- PostgreSQL: Checks for `schema_version` table
- MongoDB: Checks for `schema_version` collection
- First run → Full initialization
- Subsequent runs → Migration only

### 3. Initialization Process
1. Database containers start with health checks
2. Init scripts run automatically (PostgreSQL/MongoDB)
3. Service containers wait for healthy databases
4. Services run migrations (if DB_MIGRATE=true)
5. Services run seeds (if DB_SEED=true)
6. Services start normally

### 4. Idempotency
- All operations are safe to run multiple times
- Seed data uses `ON CONFLICT DO NOTHING`
- Migration tracking prevents duplicate runs
- Health checks ensure graceful recovery

## Environment Variables

### Database Initialization Flags
- `DB_MIGRATE=true` - Run migrations on startup
- `DB_SEED=true` - Run seed data on startup

### Service Configuration
Each service has database-specific wait logic:
- Identity Service: `wait-for-db.sh postgres`
- Bidding Service: `wait-for-db.sh mongodb`
- Chat Service: `wait-for-db.sh cassandra`
- etc.

## Monitoring and Troubleshooting

### Check Database Status
```bash
# PostgreSQL
docker exec -it reverse-marketplace-postgres psql -U postgres -d reverse_marketplace -c "SELECT * FROM schema_version;"

# MongoDB
docker exec -it reverse-marketplace-mongodb mongosh --eval "db.schema_version.find()"

# Service logs
docker-compose logs -f [service-name]
```

### Common Issues

#### Service Starts Before Database
- Check health check configuration
- Verify `depends_on` conditions
- Increase `start_period` in health checks

#### Migration Failures
- Check database connectivity
- Verify environment variables
- Review migration logs

#### Seed Data Issues
- Check for existing data conflicts
- Verify idempotency clauses
- Review seed runner logs

### Manual Operations

#### Force Re-initialization
```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

#### Run Migrations Manually
```bash
# Identity Service
cd services/identity-service
npm run migration:run

# Seed data
npm run seed:run
```

## Health Check Endpoints

All services expose `/health` endpoint:
```bash
curl http://localhost:3000/health  # Identity Service
curl http://localhost:3001/health  # Request Service
# etc.
```

## Production Considerations

### Security
- Database credentials in environment variables
- Limited database user permissions
- Network isolation between services

### Performance
- Connection pooling configured
- Health check intervals optimized
- Startup timeouts tuned for infrastructure

### Monitoring
- Health check metrics
- Migration status tracking
- Error alerting

## Next Steps

1. **Test the complete startup sequence**
2. **Monitor for any race conditions**
3. **Add logging and metrics**
4. **Document for production deployment**

## Support

For issues with the automated startup:
1. Check container logs: `docker-compose logs [service]`
2. Verify database connectivity
3. Check environment variables
4. Review health check status: `docker ps`
