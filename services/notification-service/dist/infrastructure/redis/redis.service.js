"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        const redisConfig = {
            host: this.configService.get('redis.host'),
            port: this.configService.get('redis.port'),
            password: this.configService.get('redis.password'),
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        };
        this.client = new ioredis_1.Redis(redisConfig);
        this.subscriber = new ioredis_1.Redis(redisConfig);
        await this.client.connect();
        await this.subscriber.connect();
        console.log('Redis service initialized for Notification Service');
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.disconnect();
        }
        if (this.subscriber) {
            await this.subscriber.disconnect();
        }
    }
    async setUserOnline(userId, socketId) {
        const key = `user:${userId}:presence`;
        const presenceData = {
            isOnline: true,
            socketId,
            lastSeen: new Date().toISOString(),
        };
        await this.client.hset(key, presenceData);
        await this.client.expire(key, 3600);
    }
    async setUserOffline(userId) {
        const key = `user:${userId}:presence`;
        await this.client.hset(key, 'isOnline', 'false');
        await this.client.hset(key, 'lastSeen', new Date().toISOString());
        await this.client.expire(key, 3600);
    }
    async isUserOnline(userId) {
        const key = `user:${userId}:presence`;
        const presence = await this.client.hgetall(key);
        return presence?.isOnline === 'true';
    }
    async getUserPresence(userId) {
        const key = `user:${userId}:presence`;
        return await this.client.hgetall(key);
    }
    async addSocketSession(userId, socketId) {
        const key = `user:${userId}:sockets`;
        await this.client.sadd(key, socketId);
        await this.client.expire(key, 3600);
    }
    async removeSocketSession(userId, socketId) {
        const key = `user:${userId}:sockets`;
        await this.client.srem(key, socketId);
    }
    async getUserSockets(userId) {
        const key = `user:${userId}:sockets`;
        return await this.client.smembers(key);
    }
    async setNotificationDedupeKey(notificationId, ttl = 300) {
        const key = `notification:${notificationId}:dedupe`;
        await this.client.setex(key, ttl, '1');
    }
    async isNotificationDuplicate(notificationId) {
        const key = `notification:${notificationId}:dedupe`;
        const exists = await this.client.exists(key);
        return exists === 1;
    }
    async checkNotificationRateLimit(userId, limit = 10, window = 60) {
        const key = `rate_limit:notification:${userId}`;
        const current = await this.client.incr(key);
        if (current === 1) {
            await this.client.expire(key, window);
        }
        return current <= limit;
    }
    async publishToChannel(channel, data) {
        await this.client.publish(channel, JSON.stringify(data));
    }
    async subscribeToChannel(channel, callback) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on('message', (receivedChannel, message) => {
            if (receivedChannel === channel) {
                try {
                    const data = JSON.parse(message);
                    callback(data);
                }
                catch (error) {
                    console.error('Error parsing Redis message:', error);
                }
            }
        });
    }
    async setDeviceToken(userId, deviceType, token) {
        const key = `user:${userId}:tokens:${deviceType}`;
        await this.client.sadd(key, token);
        await this.client.expire(key, 86400 * 30);
    }
    async getDeviceTokens(userId, deviceType) {
        if (deviceType) {
            const key = `user:${userId}:tokens:${deviceType}`;
            return await this.client.smembers(key);
        }
        const keys = await this.client.keys(`user:${userId}:tokens:*`);
        const tokens = [];
        for (const key of keys) {
            const deviceTokens = await this.client.smembers(key);
            tokens.push(...deviceTokens);
        }
        return tokens;
    }
    async removeDeviceToken(userId, deviceType, token) {
        const key = `user:${userId}:tokens:${deviceType}`;
        await this.client.srem(key, token);
    }
    async getHealthStatus() {
        try {
            const pong = await this.client.ping();
            const info = await this.client.info('memory');
            return {
                status: 'healthy',
                redis: {
                    connected: pong === 'PONG',
                    memory: info,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map