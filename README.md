# Reverse Marketplace

منصة عربية للسوق العكسي تربط المشترين بالتجار في الوقت الفعلي

A real-time Arabic reverse marketplace platform that connects buyers to merchants through competitive bidding.

## 🚀 Overview

Reverse Marketplace revolutionizes e-commerce by flipping the traditional model:
- **Buyers** post purchase requests once
- **System** intelligently matches relevant merchants  
- **Merchants** compete with real-time bids
- **Buyers** choose the best offer and chat instantly

## 📋 Project Structure

```
Reverse Marketplace/
├── apps/                          # Frontend applications
│   ├── buyer-mobile-app/         # Kotlin Multiplatform – Build Cross-Platform Apps - Buyer mobile app
│   ├── merchant-mobile-app/      # Kotlin Multiplatform – Build Cross-Platform Apps - Merchant mobile app
│   └── admin-web-dashboard/      # Next.js - Admin dashboard
│
├── services/                      # Backend microservices
│   ├── identity-service/         # NestJS - Authentication & users
│   ├── request-service/          # NestJS - Buyer requests
│   ├── matching-engine/          # NestJS - Real-time matching
│   ├── bidding-service/          # NestJS - Bid management
│   ├── notification-service/     # NestJS - Push notifications
│   ├── chat-service/             # NestJS - Real-time chat
│   └── payment-service/          # NestJS - Payments & wallet
│
├── libs/                          # Shared libraries
│   ├── common-dto/               # Shared data transfer objects
│   ├── event-bus/                # Event system utilities
│   ├── auth/                     # Authentication helpers
│   ├── configs/                  # Configuration management
│   └── shared-utils/             # Common utilities
│
└── infrastructure/               # Deployment & monitoring
    ├── docker/                   # Docker configurations
    ├── k8s/                      # Kubernetes manifests
    └── monitoring/               # Observability stack
```

## 🛠 Tech Stack

### Backend Services
- **Framework**: NestJS (TypeScript)
- **Databases**: PostgreSQL, MongoDB, Cassandra, Redis
- **Messaging**: RabbitMQ (Event-driven architecture)
- **Real-time**: Socket.io with Redis adapter
- **Geo**: PostGIS for location-based matching

### Frontend Applications
- **Mobile**: Kotlin Multiplatform – Build Cross-Platform Apps (cross-platform)
- **Admin Web**: Next.js + TailwindCSS
- **API Gateway**: Kong

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus + Grafana + ELK Stack
- **Cloud**: AWS/GCP ready

## 🚦 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- Kotlin Multiplatform – Build Cross-Platform Apps SDK (for mobile development)

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd "Reverse Marketplace"
pnpm install
```

2. **Start local development environment**:
```bash
# Start all services with Docker Compose
pnpm run docker:dev

# Or start services individually
nx serve identity-service
nx serve request-service
# ... etc
```

3. **Access services**:
- API Gateway: http://localhost:8000
- Kong Admin: http://localhost:8001
- RabbitMQ Management: http://localhost:15672 (admin/password)

### Development Workflow

```bash
# Build all services
pnpm run build

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Start development mode
pnpm run dev
```

## 📊 Architecture Overview

### Event-Driven Flow
```
Buyer posts request → request.created event
→ Matching Engine finds merchants → match.found event  
→ Merchants receive notifications → bid.submitted event
→ Buyer accepts bid → bid.accepted event
→ Chat conversation starts
```

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| identity-service | 3000 | Authentication, JWT, RBAC, merchant verification |
| request-service | 3001 | Request CRUD, image uploads, expiration |
| matching-engine | 3002 | Real-time merchant matching (<500ms) |
| bidding-service | 3003 | Bid lifecycle management |
| notification-service | 3004 | Push notifications, real-time events |
| chat-service | 3005 | Real-time messaging, media sharing |
| payment-service | 3006 | Wallet system, subscriptions |

## 🔧 Configuration

### Environment Variables
Key environment variables (see individual service `.env` files):

```bash
# Database URLs
DATABASE_URL=postgresql://...
MONGODB_URL=mongodb://...
REDIS_URL=redis://...

# External Services
RABBITMQ_URL=amqp://...
AWS_S3_BUCKET=your-bucket
FCM_SERVER_KEY=your-fcm-key
STRIPE_SECRET_KEY=sk_test_...
```

### Development Database
Local development uses Docker Compose with:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Cassandra (port 9042)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672)

## 📱 Mobile Applications

### Buyer Mobile App
- **Purpose**: Create requests, view bids, accept offers, chat with merchants
- **Key Features**: 3-click request creation, real-time notifications
- **Tech**: Kotlin Multiplatform – Build Cross-Platform Apps, Riverpod state management

### Merchant Mobile App  
- **Purpose**: Receive requests, submit bids, manage deals, track earnings
- **Key Features**: Real-time bidding terminal, analytics dashboard
- **Tech**: Kotlin Multiplatform – Build Cross-Platform Apps, Socket.io integration

## 🎯 Performance Targets

| Metric | Target |
|--------|--------|
| API response time | <200ms |
| Match latency | <500ms |
| Chat message delivery | <200ms |
| Concurrent users | 10,000+ |
| App launch time | <2s |

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- API Gateway-only service exposure
- Rate limiting (100 req/min global)
- OTP authentication for phone verification
- PCI-compliant payment processing

## 📚 Documentation

- [Technical Specifications](Docs/index.md) - Complete Arabic technical documentation
- [Service Backlogs](Docs/Backlog/Service%20Backlog.md) - Detailed implementation backlogs
- [Agent Configuration](agent-config.md) - Development guidelines for AI agents

## 🤝 Contributing

1. Follow the established code standards in `agent-config.md`
2. Ensure all tests pass before submitting
3. Use conventional commit messages
4. Update documentation for new features

## 📄 License

[Add your license here]

---

**Built with ❤️ for the Arabic market**
