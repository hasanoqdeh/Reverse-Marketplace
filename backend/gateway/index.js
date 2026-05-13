const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// CORS — must be before helmet and all routes
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:3001', // admin panel
      'http://localhost:3002', // buyer app
      'http://localhost:3003', // merchant app
      'http://localhost:3000', // local dev
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import auth service routes
const authRoutes = require('../services/auth-service/routes/auth');

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Reverse Marketplace API Gateway',
    version: '1.0.0',
    services: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      notifications: '/api/v1/notifications',
      chat: '/api/v1/chat',
      bidding: '/api/v1/bidding',
      subscriptions: '/api/v1/subscriptions'
    }
  });
});

// Mount auth service routes
app.use('/api/v1/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND'
    }
  });
});

// Initialize auth services
const authDatabase = require('../services/auth-service/database/connection');
const authRedisClient = require('../services/auth-service/cache/redis');
const authEventPublisher = require('../services/auth-service/events/publisher');

async function startGateway() {
  try {
    await authDatabase.connect();
    await authRedisClient.connect();
    await authEventPublisher.connect();
    console.log('✅ Auth services connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect auth services:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api/v1`);
  });
}

startGateway();

module.exports = app;
