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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RedisService = class RedisService {
    constructor(client, configService) {
        this.client = client;
        this.configService = configService;
    }
    async onModuleInit() {
        console.log('Redis service initialized for Chat Service');
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.disconnect();
        }
    }
    async publishToChannel(channel, message) {
        await this.client.publish(channel, JSON.stringify(message));
    }
    async subscribeToChannel(channel, callback) {
        const subscriber = this.client.duplicate();
        await subscriber.connect();
        await subscriber.subscribe(channel, (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                callback(parsedMessage);
            }
            catch (error) {
                console.error('Error parsing Redis message:', error);
            }
        });
    }
    async setUserOnline(userId, socketId) {
        const key = `presence:${userId}`;
        const presence = {
            isOnline: true,
            lastSeen: new Date().toISOString(),
            socketId,
        };
        await this.client.setEx(key, 3600, JSON.stringify(presence));
    }
    async setUserOffline(userId) {
        const key = `presence:${userId}`;
        const presence = {
            isOnline: false,
            lastSeen: new Date().toISOString(),
            socketId: null,
        };
        await this.client.setEx(key, 86400, JSON.stringify(presence));
    }
    async getUserPresence(userId) {
        const key = `presence:${userId}`;
        const presence = await this.client.get(key);
        return presence ? JSON.parse(presence) : null;
    }
    async isUserOnline(userId) {
        const presence = await this.getUserPresence(userId);
        return presence ? presence.isOnline : false;
    }
    async setUserTyping(conversationId, userId, isTyping) {
        const key = `typing:${conversationId}:${userId}`;
        if (isTyping) {
            await this.client.setEx(key, 10, '1');
        }
        else {
            await this.client.del(key);
        }
    }
    async getTypingUsers(conversationId) {
        const pattern = `typing:${conversationId}:*`;
        const keys = await this.client.keys(pattern);
        const userIds = keys.map(key => key.split(':').pop());
        return userIds;
    }
    async cacheConversation(conversationId, conversation, ttl = 3600) {
        const key = `conversation:${conversationId}`;
        await this.client.setEx(key, ttl, JSON.stringify(conversation));
    }
    async getCachedConversation(conversationId) {
        const key = `conversation:${conversationId}`;
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    async invalidateConversationCache(conversationId) {
        const key = `conversation:${conversationId}`;
        await this.client.del(key);
    }
    async cacheUserConversations(userId, conversations, ttl = 1800) {
        const key = `user_conversations:${userId}`;
        await this.client.setEx(key, ttl, JSON.stringify(conversations));
    }
    async getCachedUserConversations(userId) {
        const key = `user_conversations:${userId}`;
        const cached = await this.client.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    async invalidateUserConversationsCache(userId) {
        const key = `user_conversations:${userId}`;
        await this.client.del(key);
    }
    async incrementUnreadCount(userId, conversationId) {
        const key = `unread:${userId}:${conversationId}`;
        return await this.client.incr(key);
    }
    async getUnreadCount(userId, conversationId) {
        const key = `unread:${userId}:${conversationId}`;
        const count = await this.client.get(key);
        return count ? parseInt(count) : 0;
    }
    async resetUnreadCount(userId, conversationId) {
        const key = `unread:${userId}:${conversationId}`;
        await this.client.del(key);
    }
    async getTotalUnreadCount(userId) {
        const pattern = `unread:${userId}:*`;
        const keys = await this.client.keys(pattern);
        if (keys.length === 0)
            return 0;
        const counts = await Promise.all(keys.map(key => this.client.get(key)));
        return counts.reduce((sum, count) => sum + (count ? parseInt(count) : 0), 0);
    }
    async checkMessageRateLimit(userId, windowSeconds = 60, maxMessages = 30) {
        const key = `rate_limit:message:${userId}`;
        const current = await this.client.incr(key);
        if (current === 1) {
            await this.client.expire(key, windowSeconds);
        }
        return current <= maxMessages;
    }
    async checkUploadRateLimit(userId, windowSeconds = 60, maxUploads = 5) {
        const key = `rate_limit:upload:${userId}`;
        const current = await this.client.incr(key);
        if (current === 1) {
            await this.client.expire(key, windowSeconds);
        }
        return current <= maxUploads;
    }
    async addSocketConnection(userId, socketId) {
        const key = `sockets:${userId}`;
        await this.client.sAdd(key, socketId);
        await this.client.expire(key, 3600);
    }
    async removeSocketConnection(userId, socketId) {
        const key = `sockets:${userId}`;
        await this.client.sRem(key, socketId);
    }
    async getUserSocketIds(userId) {
        const key = `sockets:${userId}`;
        return await this.client.sMembers(key);
    }
    async getUserConnectionCount(userId) {
        const key = `sockets:${userId}`;
        return await this.client.sCard(key);
    }
    async hasMessageBeenProcessed(messageId) {
        const key = `processed_messages:${messageId}`;
        const exists = await this.client.exists(key);
        return exists === 1;
    }
    async markMessageAsProcessed(messageId, ttl = 3600) {
        const key = `processed_messages:${messageId}`;
        await this.client.setEx(key, ttl, '1');
    }
    async addToConversationRoom(conversationId, userId) {
        const key = `room:${conversationId}`;
        await this.client.sAdd(key, userId);
        await this.client.expire(key, 86400);
    }
    async removeFromConversationRoom(conversationId, userId) {
        const key = `room:${conversationId}`;
        await this.client.sRem(key, userId);
    }
    async getConversationRoomMembers(conversationId) {
        const key = `room:${conversationId}`;
        return await this.client.sMembers(key);
    }
    async isUserInConversationRoom(conversationId, userId) {
        const key = `room:${conversationId}`;
        return await this.client.sIsMember(key, userId);
    }
    async recordMetric(metric, value) {
        const key = `metrics:${metric}`;
        await this.client.lPush(key, value.toString());
        await this.client.lTrim(key, 0, 999);
        await this.client.expire(key, 3600);
    }
    async getAverageMetric(metric) {
        const key = `metrics:${metric}`;
        const values = await this.client.lRange(key, 0, -1);
        if (values.length === 0)
            return 0;
        const sum = values.reduce((acc, val) => acc + parseFloat(val), 0);
        return sum / values.length;
    }
    async healthCheck() {
        const start = Date.now();
        await this.client.ping();
        const latency = Date.now() - start;
        return {
            status: 'healthy',
            latency,
        };
    }
    async cleanupExpiredData() {
        console.log('Cleaning up expired Redis data...');
    }
    async publishUserOnline(userId, isOnline) {
        const channel = `user:${userId}`;
        await this.publishToChannel(channel, {
            type: 'presence_update',
            data: { userId, isOnline, timestamp: new Date().toISOString() },
        });
    }
    async publishUserTyping(conversationId, userId, isTyping) {
        const channel = `conversation:${conversationId}`;
        await this.publishToChannel(channel, {
            type: 'typing_update',
            data: { conversationId, userId, isTyping, timestamp: new Date().toISOString() },
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map