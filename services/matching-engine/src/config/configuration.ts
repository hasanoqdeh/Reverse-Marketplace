export default () => ({
  port: parseInt(process.env.PORT, 10) || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL,
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
  
  matching: {
    minTrustScore: parseFloat(process.env.MIN_TRUST_SCORE) || 3.5,
    maxMerchantsPerRequest: parseInt(process.env.MAX_MERCHANTS_PER_REQUEST, 10) || 50,
    timeoutMs: parseInt(process.env.MATCH_TIMEOUT_MS, 10) || 500,
    geoRadiusKm: parseInt(process.env.GEO_RADIUS_KM, 10) || 50,
    merchantCooldownMinutes: parseInt(process.env.MERCHANT_COOLDOWN_MINUTES, 10) || 5,
  },
  
  performance: {
    redisLookupTimeoutMs: parseInt(process.env.REDIS_LOOKUP_TIMEOUT_MS, 10) || 50,
    concurrentMatches: parseInt(process.env.CONCURRENT_MATCHES, 10) || 1000,
    batchSize: parseInt(process.env.BATCH_SIZE, 10) || 100,
  },
  
  monitoring: {
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
    metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9090,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    correlationIdEnabled: process.env.CORRELATION_ID_ENABLED === 'true',
  },
});
