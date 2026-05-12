const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./utils/logger');
const database = require('./database/connection');
const redisClient = require('./cache/redis');
const eventPublisher = require('./events/publisher');
const authRoutes = require('./routes/auth');
const { getRateLimitMiddleware } = require('./middleware/rateLimiting');

// Validate configuration
config.validate();

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Global rate limiting
app.use(getRateLimitMiddleware('global'));

// API routes
app.use('/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'reverse-marketplace-auth-service',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: '/auth',
      health: '/auth/health',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: 'INTERNAL_ERROR',
    ...(config.env === 'development' && { stack: error.stack }),
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close HTTP server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    await database.disconnect();
    
    // Close Redis connection
    await redisClient.disconnect();
    
    // Close RabbitMQ connection
    await eventPublisher.disconnect();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await database.connect();
    
    // Connect to Redis
    await redisClient.connect();
    
    // Connect to RabbitMQ
    await eventPublisher.connect();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.system.serviceStarted(PORT, config.env);
      logger.info(`🔐 Phone-based OTP Authentication Service running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🗄️  Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
      logger.info(`🔴 Redis: ${config.redis.host}:${config.redis.port}`);
      logger.info(`🐰 RabbitMQ: ${config.rabbitmq.host}:${config.rabbitmq.port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
