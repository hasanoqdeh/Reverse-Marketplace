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
exports.EventConsumerService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("../../infrastructure/rabbitmq/rabbitmq.service");
const conversation_service_1 = require("../conversations/conversation.service");
const message_service_1 = require("../messages/message.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const message_model_1 = require("../../infrastructure/cassandra/models/message.model");
const conversation_model_1 = require("../../infrastructure/cassandra/models/conversation.model");
let EventConsumerService = class EventConsumerService {
    constructor(rabbitMQService, conversationService, messageService, redisService) {
        this.rabbitMQService = rabbitMQService;
        this.conversationService = conversationService;
        this.messageService = messageService;
        this.redisService = redisService;
    }
    async onModuleInit() {
        await this.setupEventConsumers();
    }
    async setupEventConsumers() {
        await this.rabbitMQService.consumeEvents('chat-service.bid-events', ['bid.accepted'], this.handleBidAccepted.bind(this));
        await this.rabbitMQService.consumeEvents('chat-service.request-events', ['request.completed', 'request.cancelled', 'request.closed'], this.handleRequestLifecycleEvent.bind(this));
        await this.rabbitMQService.consumeEvents('chat-service.user-events', ['user.banned', 'user.deleted'], this.handleUserManagementEvent.bind(this));
        console.log('Chat Service event consumers initialized');
    }
    async handleBidAccepted(event) {
        try {
            const { requestId, buyerId, merchantId } = event.data;
            console.log(`Creating conversation for accepted bid: ${event.aggregateId}`);
            const conversation = await this.conversationService.createConversation({
                request_id: requestId,
                buyer_id: buyerId,
                merchant_id: merchantId,
            });
            await this.messageService.sendMessage({
                conversation_id: conversation.conversation_id,
                message_type: message_model_1.MessageType.SYSTEM,
                text: 'Conversation started. You can now chat with the merchant.',
            }, 'system');
            console.log(`Conversation created: ${conversation.conversation_id}`);
        }
        catch (error) {
            console.error('Error handling bid.accepted event:', error);
        }
    }
    async handleRequestLifecycleEvent(event) {
        try {
            const { requestId } = event.data;
            const conversation = await this.conversationService.findByRequestId(requestId);
            if (!conversation) {
                console.log(`No conversation found for request: ${requestId}`);
                return;
            }
            let statusMessage = '';
            let shouldClose = false;
            switch (event.eventType) {
                case 'request.completed':
                    statusMessage = 'Request has been completed. Thank you for using our service!';
                    shouldClose = true;
                    break;
                case 'request.cancelled':
                    statusMessage = 'Request has been cancelled by the buyer.';
                    shouldClose = true;
                    break;
                case 'request.closed':
                    statusMessage = 'Request has been closed by the system.';
                    shouldClose = true;
                    break;
            }
            await this.messageService.sendMessage({
                conversation_id: conversation.conversation_id,
                message_type: message_model_1.MessageType.SYSTEM,
                text: statusMessage,
            }, 'system');
            if (shouldClose) {
                await this.conversationService.closeConversation(conversation.conversation_id);
            }
            console.log(`Processed request lifecycle event: ${event.eventType} for conversation: ${conversation.conversation_id}`);
        }
        catch (error) {
            console.error(`Error handling ${event.eventType} event:`, error);
        }
    }
    async handleUserManagementEvent(event) {
        try {
            const { userId } = event.data;
            if (event.eventType === 'user.banned') {
                const socketIds = await this.redisService.getUserSocketIds(userId);
                for (const socketId of socketIds) {
                    console.log(`Should disconnect socket ${socketId} for banned user ${userId}`);
                }
                await this.blockUserFromMessaging(userId);
                console.log(`User ${userId} banned and blocked from messaging`);
            }
            else if (event.eventType === 'user.deleted') {
                await this.cleanupUserData(userId);
                console.log(`Cleaned up data for deleted user ${userId}`);
            }
        }
        catch (error) {
            console.error(`Error handling ${event.eventType} event:`, error);
        }
    }
    async blockUserFromMessaging(userId) {
        await this.redisService.setUserOffline(userId);
        const blockedKey = `blocked:${userId}`;
        await this.redisService['client'].setEx(blockedKey, 86400 * 365, 'true');
    }
    async cleanupUserData(userId) {
        const userConversations = await this.conversationService.getUserConversations(userId, 1, 1000);
        for (const conversation of userConversations.conversations) {
            await this.conversationService.updateConversationStatus(conversation.conversation_id, conversation_model_1.ConversationStatus.ARCHIVED);
        }
        await this.redisService.removeSocketConnection(userId, 'all');
        await this.redisService.setUserOffline(userId);
        for (const conversation of userConversations.conversations) {
            await this.redisService.removeFromConversationRoom(conversation.conversation_id, userId);
        }
    }
    async handleChatMessageSent(event) {
        try {
            const { conversationId, senderId, messageType } = event.data;
            const participants = await this.conversationService.getConversationParticipants(conversationId);
            for (const participantId of participants) {
                if (participantId !== senderId) {
                    await this.redisService.incrementUnreadCount(participantId, conversationId);
                }
            }
            const roomKey = `conversation:${conversationId}`;
            await this.redisService.publishToChannel(roomKey, {
                type: 'message_sent',
                data: event.data,
            });
        }
        catch (error) {
            console.error('Error handling chat.message.sent event:', error);
        }
    }
    async handleChatMessageRead(event) {
        try {
            const { messageId, conversationId, userId } = event.data;
            await this.redisService.resetUnreadCount(userId, conversationId);
            const roomKey = `conversation:${conversationId}`;
            await this.redisService.publishToChannel(roomKey, {
                type: 'message_read',
                data: event.data,
            });
        }
        catch (error) {
            console.error('Error handling chat.message.read event:', error);
        }
    }
    async handleChatUserTyping(event) {
        try {
            const { conversationId, userId, isTyping } = event.data;
            await this.redisService.setUserTyping(conversationId, userId, isTyping);
            const roomKey = `conversation:${conversationId}`;
            await this.redisService.publishToChannel(roomKey, {
                type: 'user_typing',
                data: event.data,
            });
        }
        catch (error) {
            console.error('Error handling chat.user.typing event:', error);
        }
    }
    async handleChatUserOnline(event) {
        try {
            const { userId, isOnline } = event.data;
            if (isOnline) {
                await this.redisService.setUserOnline(userId, 'system');
            }
            else {
                await this.redisService.setUserOffline(userId);
            }
            const userConversations = await this.conversationService.getUserConversations(userId, 1, 50);
            for (const conversation of userConversations.conversations) {
                const participants = await this.conversationService.getConversationParticipants(conversation.conversation_id);
                for (const participantId of participants) {
                    if (participantId !== userId) {
                        const userRoomKey = `user:${participantId}`;
                        await this.redisService.publishToChannel(userRoomKey, {
                            type: 'user_presence_updated',
                            data: { userId, isOnline },
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error handling chat.user.online event:', error);
        }
    }
};
exports.EventConsumerService = EventConsumerService;
exports.EventConsumerService = EventConsumerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        conversation_service_1.ConversationService,
        message_service_1.MessageService,
        redis_service_1.RedisService])
], EventConsumerService);
//# sourceMappingURL=event-consumer.service.js.map