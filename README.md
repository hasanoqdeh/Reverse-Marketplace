# Reverse Marketplace

A comprehensive reverse marketplace platform where buyers post requests and merchants compete to fulfill them through competitive bidding.

## 🏗️ Project Structure

```
reverse-marketplace/
├── backend/                 # Node.js microservices backend
│   ├── gateway/            # API Gateway
│   ├── services/           # Individual microservices
│   │   ├── identity-service/
│   │   ├── user-service/
│   │   ├── product-service/
│   │   ├── order-service/
│   │   ├── payment-service/
│   │   ├── notification-service/
│   │   ├── chat-service/
│   │   ├── bidding-service/
│   │   └── subscription-service/
│   └── shared/             # Shared utilities and configurations
├── admin-panel/            # Next.js admin dashboard
├── buyer-app/             # React Native buyer mobile app
├── merchant-app/          # React Native merchant mobile app
└── Docs/                  # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- PostgreSQL (for backend database)
- Redis (for caching and sessions)
- React Native development environment (for mobile apps)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reverse-marketplace
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Setup environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Admin Panel
cp admin-panel/.env.example admin-panel/.env
```

4. Setup database:
```bash
cd backend
npm run migrate
npm run seed
```

### Development

Start all services in development mode:

```bash
# Start backend services
npm run dev:backend

# Start admin panel
npm run dev:admin

# Start buyer app (in separate terminal)
npm run dev:buyer

# Start merchant app (in separate terminal)
npm run dev:merchant
```

## 📱 Applications

### Admin Panel
- **Technology**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Features**: User management, order monitoring, analytics, system configuration
- **Development**: `cd admin-panel && npm run dev`

### Buyer App
- **Technology**: React Native, TypeScript, React Navigation
- **Features**: Browse requests, place orders, track deliveries, chat with merchants
- **Development**: `cd buyer-app && npm start`

### Merchant App
- **Technology**: React Native, TypeScript, React Navigation
- **Features**: Manage listings, respond to bids, track orders, analytics dashboard
- **Development**: `cd merchant-app && npm start`

## 🔧 Backend Services

### Core Services

- **Auth Service**: Authentication and authorization
- **User Service**: User profile management
- **Product Service**: Product catalog and inventory
- **Order Service**: Order processing and management
- **Payment Service**: Payment processing and transactions
- **Notification Service**: Push notifications and emails
- **Chat Service**: Real-time messaging
- **Bidding Service**: Bid management and auctions
- **Subscription Service**: Subscription management

### API Gateway

The API Gateway routes requests to appropriate microservices and handles:
- Request routing
- Authentication middleware
- Rate limiting
- Request/response transformation

## 🗄️ Database Architecture

### PostgreSQL Schema
- Users table with role-based access
- Products with inventory tracking
- Orders with status management
- Bids with auction logic
- Subscriptions with billing cycles

### Redis Usage
- Session storage
- API response caching
- Real-time data synchronization
- Queue management

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- API rate limiting
- Input validation and sanitization
- Data encryption at rest and in transit
- CORS configuration
- Security headers (Helmet.js)

## 📊 Monitoring & Logging

- Winston logging framework
- Structured JSON logs
- Error tracking and alerting
- Performance monitoring
- Health check endpoints

## 🧪 Testing

```bash
# Run backend tests
npm run test:backend

# Run linting
npm run lint:all

# Type checking
npm run type-check
```

## 📦 Deployment

### Backend Services
- Docker containers
- Kubernetes orchestration
- Environment-specific configurations
- Database migrations
- Health checks and monitoring

### Frontend Applications
- Static asset optimization
- CDN deployment
- Environment variables
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
