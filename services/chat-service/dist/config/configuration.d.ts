declare const _default: () => {
    port: number;
    nodeEnv: string;
    cassandra: {
        contactPoints: string[];
        localDataCenter: string;
        keyspace: string;
        username: string;
        password: string;
        replicationFactor: number;
        consistencyLevel: string;
        requestTimeout: number;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        db: number;
    };
    rabbitmq: {
        host: string;
        port: number;
        username: string;
        password: string;
        exchange: string;
    };
    socket: {
        cors: {
            origin: string[];
            credentials: boolean;
        };
        pingTimeout: number;
        pingInterval: number;
    };
    storage: {
        type: string;
        s3: {
            bucket: string;
            region: string;
            accessKeyId: string;
            secretAccessKey: string;
            endpoint: string;
        };
        maxFileSize: number;
        allowedFileTypes: string[];
    };
    chat: {
        maxMessageLength: number;
        messageRetentionDays: number;
        typingTimeoutSeconds: number;
        conversationArchiveDays: number;
    };
    rateLimiting: {
        messageRateLimit: number;
        uploadRateLimit: number;
    };
    performance: {
        redisLookupTimeoutMs: number;
        concurrentSocketConnections: number;
    };
    monitoring: {
        prometheusEnabled: boolean;
        metricsPort: number;
    };
    logging: {
        level: string;
        correlationIdEnabled: boolean;
    };
    security: {
        jwtSecret: string;
        apiKeyHeader: string;
    };
};
export default _default;
