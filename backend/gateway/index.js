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
    'http://localhost:3000',
    'http://localhost:3001', // admin panel
    'http://localhost:3002', // buyer app
    'http://localhost:3003', // merchant app
  ];

const isDev = process.env.NODE_ENV !== 'production';
const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isDev && localhostPattern.test(origin)) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Fingerprint', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Handle preflight for all routes before any other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Security middleware — disable crossOriginResourcePolicy so CORS headers aren't overridden
app.use(helmet({ crossOriginResourcePolicy: false }));

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

// Import identity service routes
const authRoutes = require('../services/identity-service/routes/identityAuth');
const adminAuthRoutes = require('../services/identity-service/routes/identityAdminAuth');
const adminRoutes = require('../services/identity-service/routes/identityAdmin');
const database = require('../services/identity-service/database/connection');

// Mount identity service routes
app.use('/api/v1/identity/auth', authRoutes);
app.use('/api/v1/identity/admin/auth', adminAuthRoutes);
app.use('/api/v1/identity/admin', adminRoutes);

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Reverse Marketplace API Gateway',
    version: '1.0.0',
    services: {
      identity: {
        auth: '/api/v1/identity/auth',
        adminAuth: '/api/v1/identity/admin/auth',
        admin: '/api/v1/identity/admin'
      },
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


const startServer = async () => {
  try {
    await database.connect();
    console.log('Database connected');
  } catch (err) {
    console.error('WARNING: Failed to connect to database:', err.message);
    console.error('Auth routes will return errors until the database is reachable.');
  }

  app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
