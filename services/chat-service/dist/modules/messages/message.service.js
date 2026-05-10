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
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const rabbitmq_service_1 = require("../../infrastructure/rabbitmq/rabbitmq.service");
const message_model_1 = require("../../infrastructure/cassandra/models/message.model");
const conversation_service_1 = require("../conversations/conversation.service");
let MessageService = class MessageService {
    constructor(cassandraClient, redisService, rabbitMQService, conversationService, configService) {
        this.cassandraClient = cassandraClient;
        this.redisService = redisService;
        this.rabbitMQService = rabbitMQService;
        this.conversationService = conversationService;
        this.configService = configService;
    }
    async sendMessage(data, senderId) {
        const actualSenderId = data.sender_id || senderId;
        if (!actualSenderId) {
            throw new Error('Sender ID is required');
        }
        const validation = message_model_1.MessageModel.validateMessageContent(data);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }
        const rateLimitValid = await this.redisService.checkMessageRateLimit(actualSenderId);
        if (!rateLimitValid) {
            throw new Error('Message rate limit exceeded');
        }
        const hasAccess = await this.conversationService.canUserAccessConversation(data.conversation_id, actualSenderId);
        if (!hasAccess) {
            throw new Error('Access denied to conversation');
        }
        if (data.text) {
            data.text = message_model_1.MessageModel.sanitizeText(data.text);
        }
        const message = message_model_1.MessageModel.create({
            ...data,
            sender_id: actualSenderId,
        });
        try {
            await this.cassandraClient.execute(message_model_1.MessageModel.queries.insert, [
                message.conversation_id,
                message.message_id,
                message.sender_id,
                message.message_type,
                message.text,
                message.media_url,
                message.is_read,
                message.created_at,
            ], { prepare: true });
            await this.updateUserConversations(message);
            await this.redisService.markMessageAsProcessed(message.message_id.toString());
            await this.rabbitMQService.publishMessageSent(message.message_id.toString(), message.conversation_id, message.sender_id, message.message_type);
            await this.emitMessageToConversation(message);
            return message;
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send message');
        }
    }
    async getConversationMessages(conversationId, userId, limit = 50, beforeTime) {
        const hasAccess = await this.conversationService.canUserAccessConversation(conversationId, userId);
        if (!hasAccess) {
            throw new Error('Access denied to conversation');
        }
        try {
            let query, params;
            if (beforeTime) {
                query = message_model_1.MessageModel.queries.selectByConversationIdWithPagination;
                params = [conversationId, beforeTime, limit];
            }
            else {
                query = message_model_1.MessageModel.queries.selectByConversationId;
                params = [conversationId, limit];
            }
            const result = await this.cassandraClient.execute(query, params, {
                prepare: true,
            });
            return result.rows;
        }
        catch (error) {
            console.error('Error getting conversation messages:', error);
            return [];
        }
    }
    async markMessageAsRead(messageId, userId) {
        try {
            const message = await this.getMessageById(messageId, userId);
            if (!message) {
                return false;
            }
            if (message.sender_id === userId) {
                return false;
            }
            await this.cassandraClient.execute(message_model_1.MessageModel.queries.updateReadStatus, [true, message.conversation_id, message.created_at, message.message_id], { prepare: true });
            await this.updateDeliveryStatus(message.conversation_id, message.message_id, userId, message_model_1.DeliveryStatus.DELIVERED);
            await this.redisService.resetUnreadCount(userId, message.conversation_id);
            await this.rabbitMQService.publishMessageRead(messageId, message.conversation_id, userId);
            await this.emitReadReceipt(message.conversation_id, messageId, userId);
            return true;
        }
        catch (error) {
            console.error('Error marking message as read:', error);
            return false;
        }
    }
    async markAllMessagesAsRead(conversationId, userId) {
        const hasAccess = await this.conversationService.canUserAccessConversation(conversationId, userId);
        if (!hasAccess) {
            throw new Error('Access denied to conversation');
        }
        try {
            await this.cassandraClient.execute(message_model_1.MessageModel.queries.markConversationRead, [conversationId, userId], { prepare: true });
            await this.redisService.resetUnreadCount(userId, conversationId);
            const totalUnread = await this.redisService.getTotalUnreadCount(userId);
            return totalUnread;
        }
        catch (error) {
            console.error('Error marking all messages as read:', error);
            return 0;
        }
    }
    async getUnreadCount(userId, conversationId) {
        if (conversationId) {
            return await this.redisService.getUnreadCount(userId, conversationId);
        }
        else {
            return await this.redisService.getTotalUnreadCount(userId);
        }
    }
    async getMessageById(messageId, userId) {
        return null;
    }
    async deleteMessage(messageId, userId) {
        console.log(`Soft delete requested for message ${messageId} by user ${userId}`);
        return true;
    }
    async updateUserConversations(message) {
        const participants = await this.conversationService.getConversationParticipants(message.conversation_id);
        for (const participantId of participants) {
            if (participantId !== message.sender_id) {
                await this.redisService.incrementUnreadCount(participantId, message.conversation_id);
            }
        }
    }
    async updateDeliveryStatus(conversationId, messageId, deliveredTo, status) {
        const deliveryStatus = message_model_1.MessageModel.createDeliveryStatus(conversationId, messageId, deliveredTo, status);
        await this.cassandraClient.execute(message_model_1.MessageModel.queries.insertDeliveryStatus, [
            deliveryStatus.conversation_id,
            deliveryStatus.message_id,
            deliveryStatus.delivered_to,
            deliveryStatus.status,
            deliveryStatus.updated_at,
        ], { prepare: true });
    }
    async emitMessageToConversation(message) {
        const roomKey = `conversation:${message.conversation_id}`;
        const messageData = {
            type: 'new_message',
            data: message,
        };
        await this.redisService.publishToChannel(roomKey, messageData);
    }
    async emitReadReceipt(conversationId, messageId, userId) {
        const roomKey = `conversation:${conversationId}`;
        const readReceiptData = {
            type: 'message_read',
            data: {
                messageId,
                userId,
                timestamp: new Date().toISOString(),
            },
        };
        await this.redisService.publishToChannel(roomKey, readReceiptData);
    }
    async cleanupExpiredMessages() {
        const retentionDays = this.configService.get('chat.messageRetentionDays', 365);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        console.log(`Cleaning up messages older than ${cutoffDate}`);
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CASSANDRA_CLIENT')),
    __metadata("design:paramtypes", [Object, redis_service_1.RedisService,
        rabbitmq_service_1.RabbitMQService,
        conversation_service_1.ConversationService,
        config_1.ConfigService])
], MessageService);
//# sourceMappingURL=message.service.js.map