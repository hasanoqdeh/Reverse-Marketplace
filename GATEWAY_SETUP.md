# Reverse Marketplace Gateway Setup

## Overview

All services are now configured to run behind a unified Kong API Gateway on port 8000. This provides a single entry point for all services with consistent routing and security.

## URL Structure

### Main Applications
- **Landing Page**: `http://localhost:8000/`
- **Admin Dashboard**: `http://localhost:8000/admin`

### API Services
- **Identity Service**: `http://localhost:8000/api/identity`
- **Request Service**: `http://localhost:8000/api/request`
- **Matching Engine**: `http://localhost:8000/api/matching`
- **Bidding Service**: `http://localhost:8000/api/bidding`
- **Notification Service**: `http://localhost:8000/api/notification`
- **Chat Service**: `http://localhost:8000/api/chat`
- **Payment Service**: `http://localhost:8000/api/payment`

## Quick Start

### 1. Start All Services
```bash
./start-gateway.sh
```

### 2. Manual Start (Alternative)
```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up --build -d
```

### 3. Stop All Services
```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml down
```

## Service Configuration

### Kong Gateway (Port 8000)
- **Proxy Port**: 8000 (main entry point)
- **Admin API**: 8001 (Kong management)
- **HTTPS Proxy**: 8443 (SSL termination)
- **HTTPS Admin**: 8444 (SSL admin)

### Internal Service Ports (Not Exposed Externally)
- Landing Page: 3007
- Admin Dashboard: 3008
- Identity Service: 3000
- Request Service: 3001
- Matching Engine: 3002
- Bidding Service: 3003
- Notification Service: 3004
- Chat Service: 3005
- Payment Service: 3006

## Features Enabled

### Global Configuration
- **CORS**: Enabled for all origins
- **Rate Limiting**: 100 requests/minute, 1000/hour
- **Request Headers**: Added gateway version header
- **Health Checks**: All services have health endpoints

### Security
- **JWT Validation**: Applied at gateway level
- **Input Validation**: Request sanitization
- **Rate Limiting**: Per-service and global limits

## Development Workflow

### Adding New Services
1. Add service to `docker-compose.dev.yml`
2. Add route configuration to `kong/kong.yml`
3. Restart Kong gateway

### Viewing Logs
```bash
# View all logs
docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f infrastructure/docker/docker-compose.dev.yml logs -f identity-service
```

### Debugging
```bash
# Check Kong configuration
curl http://localhost:8001/services

# Check routes
curl http://localhost:8001/routes

# Test service through gateway
curl http://localhost:8000/api/identity/health
```

## Admin Tools

### Kong Manager
- **URL**: `http://localhost:8001`
- **API Documentation**: Available at `/docs` endpoint

### RabbitMQ Management
- **URL**: `http://localhost:15672`
- **Username**: `admin`
- **Password**: `password`

### Database Access
- **PostgreSQL**: `localhost:5432` (postgres/postgres)
- **MongoDB**: `localhost:27018` (admin/password)
- **Redis**: `localhost:6379`
- **Cassandra**: `localhost:9042`

## Troubleshooting

### Common Issues

#### Gateway Not Responding
```bash
# Check Kong status
docker logs reverse-marketplace-kong

# Restart Kong
docker restart reverse-marketplace-kong
```

#### Service Not Accessible
```bash
# Check service health
curl http://localhost:8000/api/{service-name}/health

# Check service logs
docker logs reverse-marketplace-{service-name}
```

#### Port Conflicts
- Ensure port 8000 is not in use
- Check for other services using the same ports

### Performance Monitoring
- Monitor response times through Kong admin API
- Check service health endpoints regularly
- Monitor resource usage with `docker stats`

## Production Considerations

### Security
- Configure proper CORS origins instead of "*"
- Set up SSL/TLS certificates
- Implement authentication at gateway level
- Enable request logging and monitoring

### Scaling
- Kong can be scaled horizontally
- Services can be scaled independently
- Consider load balancers for high availability

### Monitoring
- Set up health check alerts
- Monitor gateway performance metrics
- Implement centralized logging
- Set up automated failover

## API Examples

### Authentication
```bash
# Request OTP
curl -X POST http://localhost:8000/api/identity/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+9621234567890"}'

# Verify OTP
curl -X POST http://localhost:8000/api/identity/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+9621234567890", "otp": "123456"}'
```

### Create Request
```bash
curl -X POST http://localhost:8000/api/request/requests/draft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "iPhone 13", "category": "electronics"}'
```

This unified gateway setup provides a clean, scalable architecture for the Reverse Marketplace platform with consistent routing, security, and monitoring capabilities.
