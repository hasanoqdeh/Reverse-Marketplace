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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const rabbitmq_service_1 = require("../../infrastructure/rabbitmq/rabbitmq.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(redisService, rabbitMQService) {
        this.redisService = redisService;
        this.rabbitMQService = rabbitMQService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway initialized');
        this.setupRedisAdapter();
        this.subscribeToRedisEvents();
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without authentication token`);
                client.disconnect();
                return;
            }
            const userId = 'user-placeholder';
            client.user = {
                sub: userId,
                email: 'placeholder@example.com',
                role: 'USER',
            };
            await client.join(`user:${userId}`);
            await this.redisService.setUserOnline(userId, client.id);
            await this.redisService.addSocketSession(userId, client.id);
            const onlineEvent = this.rabbitMQService.createDomainEvent('user.online', userId, { socketId: client.id, timestamp: new Date().toISOString() });
            await this.rabbitMQService.publishEvent('user.online', onlineEvent);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
            client.emit('connected', {
                message: 'Connected to notification service',
                userId,
                socketId: client.id,
            });
        }
        catch (error) {
            this.logger.error(`Error handling connection for client ${client.id}:`, error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        try {
            const userId = client.user?.sub;
            if (userId) {
                await this.redisService.removeSocketSession(userId, client.id);
                const activeSockets = await this.redisService.getUserSockets(userId);
                if (activeSockets.length === 0) {
                    await this.redisService.setUserOffline(userId);
                    const offlineEvent = this.rabbitMQService.createDomainEvent('user.offline', userId, { socketId: client.id, timestamp: new Date().toISOString() });
                    await this.rabbitMQService.publishEvent('user.offline', offlineEvent);
                }
            }
            this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
        }
        catch (error) {
            this.logger.error(`Error handling disconnect for client ${client.id}:`, error);
        }
    }
    async handleMarkNotificationRead(client, data) {
        try {
            const userId = client.user?.sub;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            client.emit('notification_read_ack', {
                notificationId: data.notificationId,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`User ${userId} marked notification ${data.notificationId} as read`);
        }
        catch (error) {
            this.logger.error('Error marking notification as read:', error);
            client.emit('error', { message: 'Failed to mark notification as read' });
        }
    }
    async handleGetUnreadCount(client) {
        try {
            const userId = client.user?.sub;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            const unreadCount = 0;
            client.emit('unread_count', { count: unreadCount });
        }
        catch (error) {
            this.logger.error('Error getting unread count:', error);
            client.emit('error', { message: 'Failed to get unread count' });
        }
    }
    async handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
    async sendNotificationToUser(userId, notification) {
        try {
            const isOnline = await this.redisService.isUserOnline(userId);
            if (isOnline) {
                this.server.to(`user:${userId}`).emit('notification', notification);
                this.logger.log(`Sent notification to user ${userId} via WebSocket`);
                return { delivered: true, channel: 'websocket' };
            }
            else {
                this.logger.log(`User ${userId} is offline, notification will be sent via push`);
                return { delivered: false, channel: 'push_required' };
            }
        }
        catch (error) {
            this.logger.error(`Error sending notification to user ${userId}:`, error);
            return { delivered: false, error: error.message };
        }
    }
    async broadcastNotification(notification, targetRole) {
        try {
            if (targetRole) {
                this.server.emit('notification', notification);
            }
            else {
                this.server.emit('notification', notification);
            }
            this.logger.log('Broadcasted notification to all users');
        }
        catch (error) {
            this.logger.error('Error broadcasting notification:', error);
        }
    }
    setupRedisAdapter() {
        this.logger.log('Redis adapter setup placeholder');
    }
    subscribeToRedisEvents() {
        this.redisService.subscribeToChannel('notifications', (data) => {
            const { type, userId, notification } = data;
            switch (type) {
                case 'send_to_user':
                    this.sendNotificationToUser(userId, notification);
                    break;
                case 'broadcast':
                    this.broadcastNotification(notification, data.targetRole);
                    break;
                default:
                    this.logger.warn(`Unknown Redis event type: ${type}`);
            }
        });
    }
    async getGatewayStats() {
        const sockets = this.server.sockets.sockets;
        const connectedClients = Array.from(sockets.values()).length;
        return {
            connectedClients,
            serverId: process.env.NODE_ID || 'unknown',
            uptime: process.uptime(),
        };
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_notification_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleMarkNotificationRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_unread_count'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleGetUnreadCount", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handlePing", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: true,
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        rabbitmq_service_1.RabbitMQService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map