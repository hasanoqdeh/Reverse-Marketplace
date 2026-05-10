"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    port: parseInt(process.env.PORT, 10) || 3005,
    nodeEnv: process.env.NODE_ENV || 'development',
    cassandra: {
        contactPoints: process.env.CASSANDRA_CONTACT_POINTS?.split(',') || ['localhost:9042'],
        localDataCenter: process.env.CASSANDRA_LOCAL_DATACENTER || 'datacenter1',
        keyspace: process.env.CASSANDRA_KEYSPACE || 'reverse_marketplace_chat',
        username: process.env.CASSANDRA_USERNAME || undefined,
        password: process.env.CASSANDRA_PASSWORD || undefined,
        replicationFactor: parseInt(process.env.CASSANDRA_REPLICATION_FACTOR, 10) || 3,
        consistencyLevel: process.env.CASSANDRA_CONSISTENCY_LEVEL || 'QUORUM',
        requestTimeout: parseInt(process.env.CASSANDRA_REQUEST_TIMEOUT, 10) || 5000,
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
    socket: {
        cors: {
            origin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
            credentials: true,
        },
        pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT, 10) || 60000,
        pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL, 10) || 25000,
    },
    storage: {
        type: process.env.STORAGE_TYPE || 's3',
        s3: {
            bucket: process.env.S3_BUCKET || 'reverse-marketplace-chat',
            region: process.env.S3_REGION || 'us-east-1',
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            endpoint: process.env.S3_ENDPOINT,
        },
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760,
        allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'audio/mpeg',
        ],
    },
    chat: {
        maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH, 10) || 1000,
        messageRetentionDays: parseInt(process.env.MESSAGE_RETENTION_DAYS, 10) || 365,
        typingTimeoutSeconds: parseInt(process.env.TYPING_TIMEOUT_SECONDS, 10) || 5,
        conversationArchiveDays: parseInt(process.env.CONVERSATION_ARCHIVE_DAYS, 10) || 30,
    },
    rateLimiting: {
        messageRateLimit: parseInt(process.env.MESSAGE_RATE_LIMIT, 10) || 30,
        uploadRateLimit: parseInt(process.env.UPLOAD_RATE_LIMIT, 10) || 5,
    },
    performance: {
        redisLookupTimeoutMs: parseInt(process.env.REDIS_LOOKUP_TIMEOUT_MS, 10) || 50,
        concurrentSocketConnections: parseInt(process.env.CONCURRENT_SOCKET_CONNECTIONS, 10) || 100000,
    },
    monitoring: {
        prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
        metricsPort: parseInt(process.env.METRICS_PORT, 10) || 9093,
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
//# sourceMappingURL=configuration.js.map