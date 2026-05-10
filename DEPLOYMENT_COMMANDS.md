# Deployment Commands for Automated Startup

## Quick Start Commands

### 1. Move Scripts to Correct Location
```bash
# Navigate to project root
cd /home/ubuntu/Desktop/Hass/Reverse\ Marketplace/

# Move initialization scripts (requires sudo)
sudo mv 01-wait-for-databases.sh infrastructure/docker/init-scripts/
sudo mv 02-postgres-init.sh infrastructure/docker/init-scripts/
sudo mv 03-mongodb-init.js infrastructure/docker/init-scripts/

# Make scripts executable
sudo chmod +x infrastructure/docker/init-scripts/*.sh
sudo chmod +x services/*/scripts/wait-for-db.sh
```

### 2. Build All Services
```bash
# Build all services from root
npm run build

# Or build individual services
cd services/identity-service && npm run build
cd ../request-service && npm run build
# ... repeat for all services
```

### 3. Start Complete Platform
```bash
# Start everything with automatic initialization
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Monitor startup progress
docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f
```

### 4. Verify Services Are Running
```bash
# Check all containers
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# Check health status
docker compose -f infrastructure/docker/docker-compose.dev.yml exec postgres pg_isready -U postgres
docker compose -f infrastructure/docker/docker-compose.dev.yml exec mongodb mongosh --eval "db.adminCommand('ping')"

# Test service health endpoints
curl http://localhost:3000/health  # Identity Service
curl http://localhost:3001/health  # Request Service
curl http://localhost:3002/health  # Matching Engine
curl http://localhost:3003/health  # Bidding Service
curl http://localhost:3004/health  # Notification Service
curl http://localhost:3005/health  # Chat Service
curl http://localhost:3006/health  # Payment Service
```

## Development Workflow

### Start Fresh (First Time)
```bash
# Clean start - removes all data
docker compose -f infrastructure/docker/docker-compose.dev.yml down -v
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Watch initialization logs
docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f postgres
```

### Restart Services (Preserving Data)
```bash
# Restart services only
docker compose -f infrastructure/docker/docker-compose.dev.yml restart

# Restart specific service
docker compose -f infrastructure/docker/docker-compose.dev.yml restart identity-service
```

### Update and Rebuild
```bash
# After code changes
docker compose -f infrastructure/docker/docker-compose.dev.yml build identity-service
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d identity-service
```

## Troubleshooting Commands

### Check Database Initialization
```bash
# PostgreSQL schema version
docker compose -f infrastructure/docker/docker-compose.dev.yml exec postgres psql -U postgres -d reverse_marketplace -c "SELECT * FROM schema_version;"

# MongoDB schema version
docker compose -f infrastructure/docker/docker-compose.dev.yml exec mongodb mongosh --eval "db.schema_version.find()"

# Check seed data
docker compose -f infrastructure/docker/docker-compose.dev.yml exec postgres psql -U postgres -d reverse_marketplace -c "SELECT COUNT(*) FROM users;"
```

### Service Logs
```bash
# All services
docker compose -f infrastructure/docker/docker-compose.dev.yml logs

# Specific service
docker compose -f infrastructure/docker/docker-compose.dev.yml logs identity-service
docker compose -f infrastructure/docker/docker-compose.dev.yml logs postgres

# Follow logs in real-time
docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f identity-service
```

### Manual Migration/Seeding
```bash
# Enter service container
docker compose -f infrastructure/docker/docker-compose.dev.yml exec identity-service sh

# Run migrations manually
cd /app
npm run migration:run

# Run seeds manually
npm run seed:run
```

## Environment Variables

### Development Mode (Current)
```bash
# All services will:
# - Auto-migrate on startup (DB_MIGRATE=true)
# - Auto-seed on startup (DB_SEED=true)
# - Wait for database health
# - Start with development settings
```

### Production Mode
```bash
# Set environment variables before starting:
export DB_MIGRATE=false
export DB_SEED=false
export NODE_ENV=production

# Or modify docker-compose.yml for production
```

## Performance Monitoring

### Resource Usage
```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
```

### Health Monitoring
```bash
# Continuous health checks
watch -n 5 'curl -s http://localhost:3000/health | jq .'
watch -n 5 'docker compose -f infrastructure/docker/docker-compose.dev.yml ps'
```

## Cleanup Commands

### Full Reset
```bash
# Stop everything and remove all data
docker compose -f infrastructure/docker/docker-compose.dev.yml down -v --remove-orphans
docker system prune -f
```

### Cleanup Unused Resources
```bash
# Remove unused images, containers, networks
docker system prune -f

# Remove unused volumes
docker volume prune -f
```

## Production Deployment Notes

### Security Considerations
```bash
# Use production environment variables
# - Change default passwords
# - Use proper JWT secrets
# - Configure SSL certificates
# - Set up proper networking
```

### Scaling
```bash
# Scale individual services
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d --scale identity-service=3
```

### Backup
```bash
# Backup PostgreSQL
docker compose -f infrastructure/docker/docker-compose.dev.yml exec postgres pg_dump -U postgres reverse_marketplace > backup.sql

# Backup MongoDB
docker compose -f infrastructure/docker/docker-compose.dev.yml exec mongodb mongodump --out /backup
```

## Success Indicators

### Expected Startup Sequence
1. **Database containers start** (30-60 seconds)
2. **Health checks pass** (databases become healthy)
3. **Init scripts run** (first run only)
4. **Service containers start** (wait for healthy databases)
5. **Migrations run** (if DB_MIGRATE=true)
6. **Seed data applied** (if DB_SEED=true)
7. **Services become healthy** (respond to /health endpoints)

### Verification Commands
```bash
# All services should be healthy
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# All health endpoints should respond
for port in 3000 3001 3002 3003 3004 3005 3006; do
  echo "Port $port: $(curl -s http://localhost:$port/health | jq -r .status 2>/dev/null || echo 'failed')"
done
```

This automated startup system ensures zero-manual-intervention deployment with proper initialization, migration, and health monitoring.
