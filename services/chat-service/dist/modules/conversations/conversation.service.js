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
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const rabbitmq_service_1 = require("../../infrastructure/rabbitmq/rabbitmq.service");
const conversation_model_1 = require("../../infrastructure/cassandra/models/conversation.model");
let ConversationService = class ConversationService {
    constructor(cassandraClient, redisService, rabbitMQService, configService) {
        this.cassandraClient = cassandraClient;
        this.redisService = redisService;
        this.rabbitMQService = rabbitMQService;
        this.configService = configService;
    }
    async createConversation(data) {
        const existingConversation = await this.findByRequestIdAndMerchant(data.request_id, data.merchant_id);
        if (existingConversation) {
            return existingConversation;
        }
        const conversation = conversation_model_1.ConversationModel.create(data);
        try {
            await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.insert, [
                conversation.conversation_id,
                conversation.request_id,
                conversation.buyer_id,
                conversation.merchant_id,
                conversation.status,
                conversation.created_at,
                conversation.updated_at,
            ], { prepare: true });
            await this.redisService.cacheConversation(conversation.conversation_id, conversation);
            await this.redisService.addToConversationRoom(conversation.conversation_id, conversation.buyer_id);
            await this.redisService.addToConversationRoom(conversation.conversation_id, conversation.merchant_id);
            await this.initializeUserConversations(conversation);
            await this.rabbitMQService.publishConversationCreated(conversation.conversation_id, conversation.request_id, conversation.buyer_id, conversation.merchant_id);
            return conversation;
        }
        catch (error) {
            console.error('Error creating conversation:', error);
            throw new Error('Failed to create conversation');
        }
    }
    async getConversationById(conversationId) {
        const cached = await this.redisService.getCachedConversation(conversationId);
        if (cached) {
            return cached;
        }
        try {
            const result = await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.selectById, [conversationId], { prepare: true });
            if (result.rows.length === 0) {
                return null;
            }
            const conversation = result.rows[0];
            await this.redisService.cacheConversation(conversationId, conversation);
            return conversation;
        }
        catch (error) {
            console.error('Error getting conversation:', error);
            return null;
        }
    }
    async findByRequestId(requestId) {
        try {
            const result = await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.selectByRequestId, [requestId], { prepare: true });
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Error finding conversation by request ID:', error);
            return null;
        }
    }
    async findByRequestIdAndMerchant(requestId, merchantId) {
        try {
            const result = await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.selectByParticipants, [merchantId, requestId], { prepare: true });
            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0];
        }
        catch (error) {
            console.error('Error finding conversation by request and merchant:', error);
            return null;
        }
    }
    async getUserConversations(userId, page = 1, limit = 20) {
        const cacheKey = `user_conversations:${userId}:${page}:${limit}`;
        const cached = await this.redisService.getCachedUserConversations(userId);
        if (cached) {
            const startIndex = (page - 1) * limit;
            const paginatedConversations = cached.slice(startIndex, startIndex + limit);
            return {
                conversations: paginatedConversations,
                total: cached.length,
                page,
                totalPages: Math.ceil(cached.length / limit),
            };
        }
        try {
            const buyerResult = await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.selectByBuyerId, [userId], { prepare: true });
            const merchantResult = await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.selectByMerchantId, [userId], { prepare: true });
            const allConversations = [...buyerResult.rows, ...merchantResult.rows];
            const uniqueConversations = allConversations.filter((conv, index, self) => index === self.findIndex((c) => c.conversation_id === conv.conversation_id));
            uniqueConversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            await this.redisService.cacheUserConversations(userId, uniqueConversations);
            const startIndex = (page - 1) * limit;
            const paginatedConversations = uniqueConversations.slice(startIndex, startIndex + limit);
            return {
                conversations: paginatedConversations,
                total: uniqueConversations.length,
                page,
                totalPages: Math.ceil(uniqueConversations.length / limit),
            };
        }
        catch (error) {
            console.error('Error getting user conversations:', error);
            return {
                conversations: [],
                total: 0,
                page,
                totalPages: 0,
            };
        }
    }
    async updateConversationStatus(conversationId, status) {
        try {
            const updated_at = new Date();
            await this.cassandraClient.execute(conversation_model_1.ConversationModel.queries.updateStatus, [status, updated_at, conversationId], { prepare: true });
            await this.redisService.invalidateConversationCache(conversationId);
            const updatedConversation = await this.getConversationById(conversationId);
            if (updatedConversation) {
                await this.redisService.invalidateUserConversationsCache(updatedConversation.buyer_id);
                await this.redisService.invalidateUserConversationsCache(updatedConversation.merchant_id);
            }
            return updatedConversation;
        }
        catch (error) {
            console.error('Error updating conversation status:', error);
            return null;
        }
    }
    async archiveConversation(conversationId, userId) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation) {
            return false;
        }
        if (conversation.buyer_id !== userId && conversation.merchant_id !== userId) {
            return false;
        }
        const updated = await this.updateConversationStatus(conversationId, conversation_model_1.ConversationStatus.ARCHIVED);
        return updated !== null;
    }
    async blockConversation(conversationId, userId) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation) {
            return false;
        }
        if (conversation.buyer_id !== userId) {
            return false;
        }
        const updated = await this.updateConversationStatus(conversationId, conversation_model_1.ConversationStatus.BLOCKED);
        return updated !== null;
    }
    async closeConversation(conversationId) {
        const updated = await this.updateConversationStatus(conversationId, conversation_model_1.ConversationStatus.CLOSED);
        return updated !== null;
    }
    async canUserAccessConversation(conversationId, userId) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation) {
            return false;
        }
        return conversation.buyer_id === userId || conversation.merchant_id === userId;
    }
    async getConversationParticipants(conversationId) {
        const conversation = await this.getConversationById(conversationId);
        if (!conversation) {
            return [];
        }
        return [conversation.buyer_id, conversation.merchant_id];
    }
    async initializeUserConversations(conversation) {
        console.log(`Initializing user conversations for ${conversation.conversation_id}`);
    }
    async cleanupExpiredConversations() {
        const archiveDays = this.configService.get('chat.conversationArchiveDays', 30);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - archiveDays);
        console.log(`Cleaning up conversations older than ${cutoffDate}`);
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CASSANDRA_CLIENT')),
    __metadata("design:paramtypes", [Object, redis_service_1.RedisService,
        rabbitmq_service_1.RabbitMQService,
        config_1.ConfigService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map