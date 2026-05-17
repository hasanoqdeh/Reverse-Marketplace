# Reverse Marketplace Backend

A microservices-based backend architecture for the Reverse Marketplace platform.

## 🏗️ Architecture

### Microservices Structure

```
backend/
├── gateway/                # API Gateway (Port 3000)
├── services/              # Individual microservices
│   ├── identity-service/      # Authentication (Port 3001)
│   ├── user-service/      # User management (Port 3002)
│   ├── product-service/   # Product catalog (Port 3003)
│   ├── order-service/      # Order processing (Port 3004)
│   ├── payment-service/   # Payment processing (Port 3005)
│   ├── notification-service/ # Notifications (Port 3006)
│   ├── chat-service/      # Real-time chat (Port 3007)
│   ├── bidding-service/   # Bidding system (Port 3008)
│   └── subscription-service/ # Subscriptions (Port 3009)
└── shared/               # Shared utilities
    ├── database/         # Database configurations
    ├── utils/           # Common utilities
    ├── middleware/      # Shared middleware
    ├── types/          # TypeScript types
    └── config/         # Configuration files
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 13
- Redis >= 6.0
- npm >= 8.0.0

### Installation

1. Install dependencies:
```bash
npm install
```


3. Setup database:
```bash
# Create database
createdb reverse_marketplace_dev

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### Development

Start the API Gateway (which will start all services):
```bash
npm run dev
```

Start individual services:
```bash
# Auth Service
cd services/identity-service && npm start

# User Service
cd services/user-service && npm start

# etc...
```

## 📝 Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reverse_marketplace_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret_key

# Services Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
# ... etc

# External APIs
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

## 🔗 API Documentation

### Base URLs
- **Gateway**: `http://localhost:3000`
- **Auth Service**: `http://localhost:3001`
- **User Service**: `http://localhost:3002`

### Authentication

All API endpoints (except auth endpoints) require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Identity Service (`/api/v1/identity/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

#### User Service (`/api/v1/users`)
- `GET /` - List users (admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

#### Product Service (`/api/v1/products`)
- `GET /` - List products
- `POST /` - Create product
- `GET /:id` - Get product by ID
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

### Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID,
    merchant_id UUID REFERENCES users(id),
    inventory_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation with Joi
- CORS configuration
- Security headers with Helmet.js
- SQL injection prevention with Knex.js

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific service
cd services/identity-service && npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

- Winston logging framework
- Structured JSON logs
- Log levels: error, warn, info, debug
- Health check endpoints for all services
- Performance monitoring

## 🚀 Deployment

### Docker Deployment

1. Build images:
```bash
docker-compose build
```

2. Start services:
```bash
docker-compose up -d
```

### Environment Configurations

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Production environment with optimizations

## 🔧 Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Nodemon**: Auto-restart on file changes
- **Knex.js**: Database migrations and seeding

## 📚 API Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated users**: 1000 requests per 15 minutes
- **Admin users**: 5000 requests per 15 minutes

## 🔄 Service Communication

Services communicate through:
- **HTTP REST APIs**: Synchronous communication
- **Redis Pub/Sub**: Asynchronous events
- **Message Queues**: Background job processing

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

2. **Redis Connection Failed**
   - Check Redis is running
   - Verify Redis configuration
   - Check network connectivity

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

### Health Checks

All services expose a `/health` endpoint:
```bash
curl http://localhost:3000/health
```

## 📞 Support

For technical support, please create an issue in the repository or contact the development team.
