'use strict';

const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables from root .env
dotenv.config();

// Prisma returns BigInt for BigInt-typed fields (e.g. fileSize); make them JSON-serializable
BigInt.prototype.toJSON = function () { return Number(this); };

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

// Import routes from new module locations
const authRoutes = require('./modules/identity/routes/auth');
const adminAuthRoutes = require('./modules/identity/routes/adminAuth');
const adminRoutes = require('./modules/identity/routes/admin');
const requestRoutes = require('./modules/requests/routes/requests');
const requestAdminRoutes = require('./modules/requests/routes/admin');
const analyticsRoutes = require('./modules/analytics/routes/analytics');
const biddingRoutes = require('./modules/bidding/routes/bids');
const biddingAdminRoutes = require('./modules/bidding/routes/admin');
const chatRoutes = require('./modules/chat/routes/chat');
const chatAdminRoutes = require('./modules/chat/routes/admin');
const { initChatSocket } = require('./modules/chat/socket/chatSocket');
const notificationRoutes = require('./modules/notifications/routes/notifications');
const notificationAdminRoutes = require('./modules/notifications/routes/admin');

// Import shared infrastructure
const database = require('./database/connection');
const mongo = require('./database/mongo');
const redisClient = require('./cache/redis');
const eventPublisher = require('./events/publisher');
const analyticsSubscriber = require('./modules/analytics/subscriber');

// Mount identity routes
app.use('/api/v1/identity/auth', authRoutes);
app.use('/api/v1/identity/admin/auth', adminAuthRoutes);
app.use('/api/v1/identity/admin', adminRoutes);

// Mount request routes (admin before public to avoid prefix collisions)
app.use('/api/v1/requests/admin', requestAdminRoutes);
app.use('/api/v1/requests', requestRoutes);

// Mount analytics routes
app.use('/api/v1/analytics', analyticsRoutes);

// Mount bidding routes
app.use('/api/v1/bidding/admin', biddingAdminRoutes);
app.use('/api/v1/bidding', biddingRoutes);

// Mount chat routes (admin before public)
app.use('/api/v1/chat/admin', chatAdminRoutes);
app.use('/api/v1/chat', chatRoutes);

// Mount notification routes (admin before public)
app.use('/api/v1/notifications/admin', notificationAdminRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Reverse Marketplace API',
    version: '1.0.0',
    services: {
      identity: {
        auth: '/api/v1/identity/auth',
        adminAuth: '/api/v1/identity/admin/auth',
        admin: '/api/v1/identity/admin',
      },
      requests: {
        public: '/api/v1/requests',
        admin: '/api/v1/requests/admin',
      },
      analytics: {
        activity: '/api/v1/analytics/activity',
        actorLogs: '/api/v1/analytics/activity/actor/:actorId',
        stats: '/api/v1/analytics/stats',
      },
      users: '/api/v1/users',
      products: '/api/v1/products',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments',
      notifications: '/api/v1/notifications',
      chat: '/api/v1/chat',
      bidding: {
        bids: '/api/v1/bidding/bids',
        myBids: '/api/v1/bidding/me/bids',
        requestBids: '/api/v1/bidding/requests/:requestId/bids',
        templates: '/api/v1/bidding/templates',
      },
      subscriptions: '/api/v1/subscriptions',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
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

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
});
app.set('io', io);
initChatSocket(io);

const startServer = async () => {
  try {
    await database.connect();
    console.log('PostgreSQL connected');
  } catch (err) {
    console.error('WARNING: Failed to connect to PostgreSQL:', err.message);
    console.error('Routes will return errors until the database is reachable.');
  }

  try {
    await mongo.connect();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('WARNING: Failed to connect to MongoDB:', err.message);
    console.error('Sessions and activity logs will be unavailable.');
  }

  try {
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('WARNING: Failed to connect to Redis:', err.message);
    console.error('Caching will be disabled until Redis is reachable.');
  }

  try {
    await eventPublisher.connect();
    console.log('RabbitMQ connected');
  } catch (err) {
    console.error('WARNING: Failed to connect to RabbitMQ:', err.message);
    console.error('Event publishing will be skipped until RabbitMQ is reachable.');
  }

  // Analytics subscriber runs after the publisher so the exchange already exists
  try {
    await analyticsSubscriber.connect();
    console.log('Analytics subscriber ready');
  } catch (err) {
    console.error('WARNING: Failed to start analytics subscriber:', err.message);
  }

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
