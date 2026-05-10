export default () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI,
    connectionPoolSize: parseInt(process.env.MONGODB_CONNECTION_POOL_SIZE, 10) || 10,
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  
  rabbitmq: {
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT, 10) || 5672,
    username: process.env.RABBITMQ_USERNAME || 'admin',
    password: process.env.RABBITMQ_PASSWORD || 'password',
    exchange: process.env.RABBITMQ_EXCHANGE || 'reverse_marketplace',
  },
  
  bidding: {
    bidExpiryHours: parseInt(process.env.BID_EXPIRY_HOURS, 10) || 24,
    maxBidImages: parseInt(process.env.MAX_BID_IMAGES, 10) || 5,
    maxBidNotesLength: parseInt(process.env.MAX_BID_NOTES_LENGTH, 10) || 1000,
    minBidPrice: parseFloat(process.env.MIN_BID_PRICE) || 0.01,
    maxBidPrice: parseFloat(process.env.MAX_BID_PRICE) || 100000,
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'OMR',
    supportedCurrencies: (process.env.SUPPORTED_CURRENCIES || 'OMR,USD,EUR').split(','),
  },
  
  rateLimiting: {
    bidSubmissionRateLimit: parseInt(process.env.BID_SUBMISSION_RATE_LIMIT, 10) || 10,
    bidViewRateLimit: parseInt(process.env.BID_VIEW_RATE_LIMIT, 10) || 100,
  },
  
  performance: {
    redisLookupTimeoutMs: parseInt(process.env.REDIS_LOOKUP_TIMEOUT_MS, 10) || 50,
    concurrentBidProcessing: parseInt(process.env.CONCURRENT_BID_PROCESSING, 10) || 1000,
  },
  
  monitoring: {
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9091,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    correlationIdEnabled: process.env.CORRELATION_ID_ENABLED === 'true',
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
  },
});
