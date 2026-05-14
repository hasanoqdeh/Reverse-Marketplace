# Reverse Marketplace Authentication System Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the production-grade phone-based OTP authentication system implemented for the Reverse Marketplace platform.

## Architecture Overview

The authentication system consists of:
- **Backend Service** (Node.js/Express) - Handles all authentication logic
- **Database** (PostgreSQL) - Stores user data, OTP codes, tokens, and audit logs
- **Cache Layer** (Redis) - Rate limiting, session management, and OTP caching
- **Message Broker** (RabbitMQ) - Event publishing for real-time updates
- **Frontend Applications** - Admin panel, buyer app, and merchant app

## Prerequisites

### Infrastructure Requirements

- **Node.js** 18.x or higher
- **PostgreSQL** 13.x or higher
- **Redis** 6.x or higher
- **RabbitMQ** 3.9.x or higher
- **Docker** and **Docker Compose** for containerization
- **SSL Certificates** for HTTPS (production)

### Environment Variables

Create a `.env` file in the identity-service directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/reverse_marketplace_auth
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=reverse_marketplace_auth
DATABASE_USER=auth_service_user
DATABASE_PASSWORD=your_secure_password

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_minimum_32_characters

# SMS Service Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Security Configuration
NODE_ENV=production
LOG_LEVEL=info
USE_REDIS_RATE_LIMITING=true

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com,https://api.yourdomain.com
```

## Quick Start with Docker Compose

### Development Environment

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd reverse-marketplace
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/services/identity-service/.env.example backend/services/identity-service/.env
   # Edit the .env file with your configuration
   ```

3. **Start all services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Run database migrations:**
   ```bash
   cd backend/services/identity-service
   npm run migrate
   ```

5. **Seed admin whitelist:**
   ```bash
   npm run seed
   ```

### Production Environment

1. **Configure production environment:**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://prod_user:prod_password@prod-db:5432/reverse_marketplace_auth
   # ... other production variables
   ```

2. **Deploy with Docker Compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Scale services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --scale identity-service=3
   ```

## Database Setup

### PostgreSQL Configuration

1. **Create database:**
   ```sql
   CREATE DATABASE reverse_marketplace_auth;
   ```

2. **Create user and grant permissions:**
   ```sql
   CREATE USER auth_service_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE reverse_marketplace_auth TO auth_service_user;
   ALTER USER auth_service_user SET search_path TO reverse_marketplace_auth, public;
   ```

3. **Enable required extensions:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

### Run Migrations

```bash
cd backend/services/identity-service
npm run migrate
```

## Redis Configuration

### Redis Setup

1. **Configure Redis for authentication service:**
   ```bash
   # In redis.conf
   maxmemory 256mb
   maxmemory-policy allkeys-lru
   save 900 1
   appendonly yes
   ```

2. **Start Redis:**
   ```bash
   redis-server /path/to/redis.conf
   ```

## RabbitMQ Configuration

### Setup

1. **Create user and virtual host:**
   ```bash
   rabbitmqctl add_user reverse_marketplace_auth your_password
   rabbitmqctl add_vhost reverse_marketplace
   rabbitmqctl set_permissions -p reverse_marketplace_auth reverse_marketplace_auth_user ".*" ".*"
   ```

2. **Configure exchanges and queues:**
   ```bash
   # These will be automatically created by the auth service
   # Exchanges: auth.events, user.events, notification.events
   # Queues: auth.events.queue, user.events.queue, notification.events.queue
   ```

## SSL/TLS Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/reverse-marketplace-auth`:

```nginx
server {
    listen 443 ssl http2;
    server_name auth.yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/auth.yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/auth.yourdomain.com.key;
    
    location / {
        proxy_pass http://identity-service:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        proxy_set_header X-Content-Type-Options nosniff;
        proxy_set_header X-Frame-Options DENY;
        proxy_set_header X-XSS-Protection "1; mode=block";
        
        # CORS headers
        proxy_set_header Access-Control-Allow-Origin $http_origin;
        proxy_set_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        proxy_set_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Device-Fingerprint";
        proxy_set_header Access-Control-Allow-Credentials true;
        
        # Rate limiting
        limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/s;
        limit_req_status 429;
    }
}
```

## Monitoring and Logging

### Log Management

Logs are structured and include:
- **Authentication events**: Login attempts, OTP verification, token refresh
- **Security events**: Rate limiting triggers, account lockouts, suspicious activities
- **Performance metrics**: Response times, database query performance
- **Error tracking**: Detailed error information with stack traces

### Health Checks

The authentication service provides health endpoints:

- `/auth/health` - Service health status
- Database connectivity checks
- Redis connectivity checks
- RabbitMQ connectivity checks

### Monitoring Stack

1. **Application Metrics:**
   ```bash
   # Enable metrics collection
   curl http://localhost:3001/metrics
   ```

2. **Database Monitoring:**
   ```bash
   # Monitor connection pool status
   psql -h localhost -U auth_service_user -d reverse_marketplace_auth -c "SELECT count(*) FROM users;"
   ```

3. **Redis Monitoring:**
   ```bash
   redis-cli info
   redis-cli monitor
   ```

## Security Considerations

### Production Security Checklist

- [ ] **Environment variables** are properly secured and not committed to version control
- [ ] **Database credentials** use strong passwords and limited privileges
- [ ] **JWT secrets** are at least 32 characters and regularly rotated
- [ ] **SSL/TLS** is properly configured with valid certificates
- [ ] **Rate limiting** is enabled and configured appropriately
- [ ] **CORS** is configured to only allow trusted origins
- [ ] **Security headers** are properly set
- [ ] **Logging** is enabled and logs are monitored
- [ ] **Database connections** use connection pooling
- [ ] **Redis** is configured with memory limits and persistence
- [ ] **Container security** is configured (non-root user, read-only filesystem)

### Security Best Practices

1. **Password Security:**
   - Use strong, unique passwords for all services
   - Rotate secrets regularly (every 90 days)
   - Never commit secrets to version control
   - Use environment-specific secrets

2. **Network Security:**
   - Use internal networks for service communication
   - Implement proper firewall rules
   - Use VPN for remote management access
   - Monitor for unusual traffic patterns

3. **Application Security:**
   - Keep all dependencies updated
   - Regular security scans
   - Input validation and sanitization
   - SQL injection prevention
   - XSS protection

## Scaling Considerations

### Horizontal Scaling

1. **Authentication Service:**
   - Stateless design allows horizontal scaling
   - Use load balancer with sticky sessions
   - Configure multiple instances behind reverse proxy
   - Ensure shared Redis and RabbitMQ instances

2. **Database Scaling:**
   - Use read replicas for read-heavy operations
   - Implement connection pooling
   - Consider database sharding for high volume

3. **Cache Scaling:**
   - Redis Cluster for high availability
   - Proper memory management
   - Consider Redis Sentinel for failover

### Performance Optimization

1. **Database Optimization:**
   - Proper indexing on frequently queried columns
   - Connection pooling with appropriate pool size
   - Query optimization and analysis
   - Regular vacuuming and maintenance

2. **Caching Strategy:**
   - User session caching in Redis
   - OTP code caching with appropriate TTL
   - Rate limiting using Redis
   - Token caching for frequent lookups

## Backup and Recovery

### Database Backups

```bash
# Automated daily backups
0 2 * * * * * psql -h localhost -U auth_service_user -d reverse_marketplace_auth -c "COPY TO stdout WITH CSV HEADER" | gzip > /backups/auth_$(date +%Y%m%d).csv.gz

# Restore backup
gunzip -c /backups/auth_20231201.csv.gz | psql -h localhost -U auth_service_user -d reverse_marketplace_auth -c "COPY FROM STDIN WITH CSV HEADER"
```

### Configuration Backups

```bash
# Backup environment configuration
cp .env /backups/env_backup_$(date +%Y%m%d).env

# Backup Docker configurations
cp docker-compose.*.yml /backups/
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   - Check database URL and credentials
   - Verify database is running and accessible
   - Check network connectivity between services

2. **Redis Connection Issues:**
   - Verify Redis is running on correct port
   - Check firewall settings
   - Verify Redis configuration

3. **RabbitMQ Issues:**
   - Check RabbitMQ service status
   - Verify user permissions
   - Check exchange and queue configurations

4. **Performance Issues:**
   - Monitor response times
   - Check database query performance
   - Review rate limiting impact
   - Analyze memory usage patterns

### Debug Commands

```bash
# Check service logs
docker-compose logs identity-service

# Check database connections
psql -h localhost -U auth_service_user -d reverse_marketplace_auth -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check Redis status
redis-cli info

# Check RabbitMQ status
rabbitmqctl status
```

## API Documentation

### Authentication Endpoints

#### Public Endpoints

- `POST /auth/phone-login` - Initiate phone login
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/health` - Health check

#### Protected Endpoints (Require JWT)

- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### Admin Endpoints (Require Admin JWT)

- `POST /auth/admin/whitelist` - Add admin to whitelist
- `GET /auth/admin/whitelist` - Get admin whitelist
- `DELETE /auth/admin/whitelist/:id` - Remove admin from whitelist

### Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... },
  "error": "error_code",
  "timestamp": "2023-12-01T12:00:00Z"
}
```

## Maintenance

### Regular Maintenance Tasks

1. **Daily:**
   - Review error logs
   - Monitor system performance
   - Check disk space usage
   - Review security alerts

2. **Weekly:**
   - Update dependencies
   - Review backup integrity
   - Performance analysis
   - Security audit

3. **Monthly:**
   - Rotate secrets
   - Update SSL certificates
   - Capacity planning
   - Security assessment

### Log Rotation

```bash
# Configure log rotation in docker-compose
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## Support

### Getting Help

For deployment issues or questions:

1. **Check logs**: `docker-compose logs identity-service`
2. **Health check**: `curl http://localhost:3001/auth/health`
3. **Documentation**: Refer to this guide and API docs
4. **Issue tracking**: Create detailed bug reports with logs

### Emergency Procedures

1. **Service Outage:**
   - Check all service dependencies
   - Review recent changes
   - Check system resources
   - Communicate with stakeholders

2. **Security Incident:**
   - Immediately assess scope
   - Review audit logs
   - Check for unauthorized access
   - Follow incident response plan

---

## Deployment Checklist

Before going to production, ensure:

- [ ] All environment variables are configured
- [ ] Database migrations have been run successfully
- [ ] SSL certificates are valid and installed
- [ ] Security headers are properly configured
- [ ] Rate limiting is tested and working
- [ ] Health checks are passing
- [ ] Monitoring is configured
- [ ] Backup procedures are in place
- [ ] Rollback plan is documented
- [ ] Team is trained on deployment procedures

---

This deployment guide provides comprehensive instructions for deploying the authentication system in production. Follow the checklist and security best practices to ensure a successful and secure deployment.
