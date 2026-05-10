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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const message_service_1 = require("../messages/message.service");
const conversation_service_1 = require("../conversations/conversation.service");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(configService, redisService, messageService, conversationService) {
        this.configService = configService;
        this.redisService = redisService;
        this.messageService = messageService;
        this.conversationService = conversationService;
        this.logger = new common_1.Logger(ChatGateway_1.name);
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
        this.setupRedisAdapter();
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            const token = client.handshake.query.token || client.handshake.headers.authorization;
            if (!token) {
                throw new websockets_1.WsException('Unauthorized: No token provided');
            }
            const userId = this.extractUserIdFromToken(token);
            if (!userId) {
                throw new websockets_1.WsException('Unauthorized: Invalid token');
            }
            client.userId = userId;
            await this.redisService.setUserOnline(userId, client.id);
            await this.redisService.addSocketConnection(userId, client.id);
            await client.join(`user:${userId}`);
            await this.redisService.publishUserOnline(userId, true);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
        }
        catch (error) {
            this.logger.error(`Connection error: ${error.message}`);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        if (client.userId) {
            await this.redisService.removeSocketConnection(client.userId, client.id);
            const connectionCount = await this.redisService.getUserConnectionCount(client.userId);
            if (connectionCount === 0) {
                await this.redisService.setUserOffline(client.userId);
                await this.redisService.publishUserOnline(client.userId, false);
                this.logger.log(`User ${client.userId} went offline`);
            }
        }
    }
    async handleJoinConversation(data, client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const { conversation_id } = data;
        const hasAccess = await this.conversationService.canUserAccessConversation(conversation_id, client.userId);
        if (!hasAccess) {
            throw new websockets_1.WsException('Access denied to conversation');
        }
        await client.join(`conversation:${conversation_id}`);
        await this.redisService.addToConversationRoom(conversation_id, client.userId);
        client.to(`conversation:${conversation_id}`).emit('user_joined', {
            userId: client.userId,
            conversationId: conversation_id,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`User ${client.userId} joined conversation ${conversation_id}`);
    }
    async handleLeaveConversation(data, client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const { conversation_id } = data;
        await client.leave(`conversation:${conversation_id}`);
        await this.redisService.removeFromConversationRoom(conversation_id, client.userId);
        client.to(`conversation:${conversation_id}`).emit('user_left', {
            userId: client.userId,
            conversationId: conversation_id,
            timestamp: new Date().toISOString(),
        });
        this.logger.log(`User ${client.userId} left conversation ${conversation_id}`);
    }
    async handleSendMessage(data, client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        try {
            const message = await this.messageService.sendMessage(data, client.userId);
            this.server.to(`conversation:${data.conversation_id}`).emit('new_message', {
                ...message,
                timestamp: message.created_at,
            });
            return { success: true, message };
        }
        catch (error) {
            throw new websockets_1.WsException(error.message);
        }
    }
    async handleMarkRead(data, client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        try {
            const success = await this.messageService.markMessageAsRead(data.message_id, client.userId);
            if (success) {
                const message = await this.messageService.getMessageById(data.message_id, client.userId);
                if (message) {
                    this.server.to(`conversation:${message.conversation_id}`).emit('message_read', {
                        messageId: data.message_id,
                        userId: client.userId,
                        timestamp: new Date().toISOString(),
                    });
                }
            }
            return { success };
        }
        catch (error) {
            throw new websockets_1.WsException(error.message);
        }
    }
    async handleTyping(data, client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const { conversation_id, is_typing } = data;
        await this.redisService.setUserTyping(conversation_id, client.userId, is_typing);
        client.to(`conversation:${conversation_id}`).emit('user_typing', {
            conversationId: conversation_id,
            userId: client.userId,
            isTyping: is_typing,
            timestamp: new Date().toISOString(),
        });
        await this.redisService.publishUserTyping(conversation_id, client.userId, is_typing);
    }
    async handleGetOnlineUsers(client) {
        if (!client.userId) {
            throw new websockets_1.WsException('Unauthorized');
        }
        const userConversations = await this.conversationService.getUserConversations(client.userId, 1, 50);
        const onlineUsers = [];
        for (const conversation of userConversations.conversations) {
            const participants = await this.conversationService.getConversationParticipants(conversation.conversation_id);
            for (const participantId of participants) {
                if (participantId !== client.userId) {
                    const isOnline = await this.redisService.isUserOnline(participantId);
                    if (isOnline) {
                        onlineUsers.push(participantId);
                    }
                }
            }
        }
        const uniqueOnlineUsers = [...new Set(onlineUsers)];
        client.emit('online_users', {
            users: uniqueOnlineUsers,
            timestamp: new Date().toISOString(),
        });
    }
    async setupRedisAdapter() {
        this.logger.log('Redis adapter setup completed');
    }
    extractUserIdFromToken(token) {
        try {
            const cleanToken = token.replace('Bearer ', '');
            return 'user-placeholder';
        }
        catch (error) {
            return null;
        }
    }
    async handleRedisEvent(channel, data) {
        if (channel.startsWith('conversation:')) {
            this.server.to(channel).emit(data.type, data.data);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_online_users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetOnlineUsers", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            credentials: true,
        },
        transports: ['websocket'],
    }),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService,
        message_service_1.MessageService,
        conversation_service_1.ConversationService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map