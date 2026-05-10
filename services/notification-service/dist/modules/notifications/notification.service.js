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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const rabbitmq_service_1 = require("../../infrastructure/rabbitmq/rabbitmq.service");
const notification_gateway_1 = require("../websocket/notification.gateway");
const notification_entity_1 = require("../../common/entities/notification.entity");
const notification_delivery_log_entity_1 = require("../../common/entities/notification-delivery-log.entity");
let NotificationService = class NotificationService {
    constructor(notificationRepository, deliveryLogRepository, redisService, rabbitMQService, notificationGateway, configService, dataSource) {
        this.notificationRepository = notificationRepository;
        this.deliveryLogRepository = deliveryLogRepository;
        this.redisService = redisService;
        this.rabbitMQService = rabbitMQService;
        this.notificationGateway = notificationGateway;
        this.configService = configService;
        this.dataSource = dataSource;
    }
    async createNotification(data) {
        const rateLimitValid = await this.redisService.checkNotificationRateLimit(data.user_id, this.configService.get('notifications.rateLimit', 10), this.configService.get('notifications.rateWindow', 60));
        if (!rateLimitValid) {
            throw new Error('Notification rate limit exceeded');
        }
        const notification = this.notificationRepository.create({
            ...data,
            delivery_status: notification_entity_1.DeliveryStatus.PENDING,
        });
        const savedNotification = await this.notificationRepository.save(notification);
        this.deliverNotification(savedNotification);
        return savedNotification;
    }
    async deliverNotification(notification) {
        const results = [];
        try {
            const isDuplicate = await this.redisService.isNotificationDuplicate(notification.id);
            if (isDuplicate) {
                return [{
                        notificationId: notification.id,
                        userId: notification.user_id,
                        delivered: false,
                        channel: notification_entity_1.DeliveryChannel.SOCKET,
                        timestamp: new Date(),
                        error: 'Duplicate notification',
                    }];
            }
            await this.redisService.setNotificationDedupeKey(notification.id, 300);
            const socketResult = await this.deliverViaWebSocket(notification);
            results.push(socketResult);
            if (!socketResult.delivered) {
                const pushResults = await this.deliverViaPush(notification);
                results.push(...pushResults);
            }
            const anyDelivered = results.some(r => r.delivered);
            await this.updateNotificationStatus(notification.id, anyDelivered ? notification_entity_1.DeliveryStatus.DELIVERED : notification_entity_1.DeliveryStatus.FAILED);
            const deliveryEvent = this.rabbitMQService.createDomainEvent('notification.sent', notification.id, {
                userId: notification.user_id,
                type: notification.type,
                delivered: anyDelivered,
                channels: results.map(r => r.channel),
            });
            await this.rabbitMQService.publishEvent('notification.sent', deliveryEvent);
            return results;
        }
        catch (error) {
            console.error(`Error delivering notification ${notification.id}:`, error);
            await this.updateNotificationStatus(notification.id, notification_entity_1.DeliveryStatus.FAILED);
            const failureEvent = this.rabbitMQService.createDomainEvent('notification.failed', notification.id, {
                userId: notification.user_id,
                type: notification.type,
                error: error.message,
            });
            await this.rabbitMQService.publishEvent('notification.failed', failureEvent);
            throw error;
        }
    }
    async deliverViaWebSocket(notification) {
        try {
            const result = await this.notificationGateway.sendNotificationToUser(notification.user_id, {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                payload: notification.payload,
                timestamp: notification.created_at,
            });
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.SOCKET, result.delivered ? notification_entity_1.DeliveryLogStatus.DELIVERED : notification_entity_1.DeliveryLogStatus.FAILED, result.error);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: result.delivered,
                channel: notification_entity_1.DeliveryChannel.SOCKET,
                timestamp: new Date(),
                error: result.error,
            };
        }
        catch (error) {
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.SOCKET, notification_entity_1.DeliveryLogStatus.FAILED, error.message);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: false,
                channel: notification_entity_1.DeliveryChannel.SOCKET,
                timestamp: new Date(),
                error: error.message,
            };
        }
    }
    async deliverViaPush(notification) {
        const results = [];
        try {
            const fcmTokens = await this.redisService.getDeviceTokens(notification.user_id, 'ANDROID');
            const apnsTokens = await this.redisService.getDeviceTokens(notification.user_id, 'IOS');
            if (fcmTokens.length > 0) {
                const fcmResult = await this.sendFCMNotification(notification, fcmTokens);
                results.push(fcmResult);
            }
            if (apnsTokens.length > 0) {
                const apnsResult = await this.sendAPNSNotification(notification, apnsTokens);
                results.push(apnsResult);
            }
            return results;
        }
        catch (error) {
            console.error(`Error delivering push notification ${notification.id}:`, error);
            return [{
                    notificationId: notification.id,
                    userId: notification.user_id,
                    delivered: false,
                    channel: notification_entity_1.DeliveryChannel.FCM,
                    timestamp: new Date(),
                    error: error.message,
                }];
        }
    }
    async sendFCMNotification(notification, tokens) {
        try {
            console.log(`Sending FCM notification ${notification.id} to ${tokens.length} Android devices`);
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.FCM, notification_entity_1.DeliveryLogStatus.DELIVERED);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: true,
                channel: notification_entity_1.DeliveryChannel.FCM,
                timestamp: new Date(),
            };
        }
        catch (error) {
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.FCM, notification_entity_1.DeliveryLogStatus.FAILED, error.message);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: false,
                channel: notification_entity_1.DeliveryChannel.FCM,
                timestamp: new Date(),
                error: error.message,
            };
        }
    }
    async sendAPNSNotification(notification, tokens) {
        try {
            console.log(`Sending APNS notification ${notification.id} to ${tokens.length} iOS devices`);
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.APNS, notification_entity_1.DeliveryLogStatus.DELIVERED);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: true,
                channel: notification_entity_1.DeliveryChannel.APNS,
                timestamp: new Date(),
            };
        }
        catch (error) {
            await this.logDeliveryAttempt(notification.id, notification_entity_1.DeliveryChannel.APNS, notification_entity_1.DeliveryLogStatus.FAILED, error.message);
            return {
                notificationId: notification.id,
                userId: notification.user_id,
                delivered: false,
                channel: notification_entity_1.DeliveryChannel.APNS,
                timestamp: new Date(),
                error: error.message,
            };
        }
    }
    async logDeliveryAttempt(notificationId, channel, status, failureReason) {
        const deliveryLog = this.deliveryLogRepository.create({
            notification_id: notificationId,
            channel,
            status,
            failure_reason: failureReason,
            delivered_at: status === notification_entity_1.DeliveryLogStatus.DELIVERED ? new Date() : null,
        });
        await this.deliveryLogRepository.save(deliveryLog);
    }
    async updateNotificationStatus(notificationId, status) {
        await this.notificationRepository.update(notificationId, { delivery_status: status });
    }
    async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.user_id = :userId', { userId });
        if (unreadOnly) {
            queryBuilder.andWhere('notification.is_read = :isRead', { isRead: false });
        }
        const [notifications, total] = await queryBuilder
            .orderBy('notification.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { notifications, total };
    }
    async markNotificationAsRead(notificationId, userId) {
        await this.notificationRepository.update({ id: notificationId, user_id: userId }, { is_read: true, delivery_status: notification_entity_1.DeliveryStatus.READ });
        const readEvent = this.rabbitMQService.createDomainEvent('notification.read', notificationId, { userId, timestamp: new Date().toISOString() });
        await this.rabbitMQService.publishEvent('notification.read', readEvent);
    }
    async markAllNotificationsAsRead(userId) {
        await this.notificationRepository.update({ user_id: userId, is_read: false }, { is_read: true, delivery_status: notification_entity_1.DeliveryStatus.READ });
    }
    async getUnreadCount(userId) {
        return await this.notificationRepository.count({
            where: { user_id: userId, is_read: false },
        });
    }
    async deleteNotification(notificationId, userId) {
        await this.notificationRepository.delete({
            id: notificationId,
            user_id: userId,
        });
    }
    async sendBulkNotifications(userIds, notificationData) {
        const allResults = [];
        for (const userId of userIds) {
            try {
                const notification = await this.createNotification({
                    ...notificationData,
                    user_id: userId,
                });
                const results = await this.deliverNotification(notification);
                allResults.push(...results);
            }
            catch (error) {
                console.error(`Failed to send bulk notification to user ${userId}:`, error);
                allResults.push({
                    notificationId: 'bulk-failed',
                    userId,
                    delivered: false,
                    channel: notification_entity_1.DeliveryChannel.SOCKET,
                    timestamp: new Date(),
                    error: error.message,
                });
            }
        }
        return allResults;
    }
    async getNotificationStats(userId) {
        const queryBuilder = this.notificationRepository.createQueryBuilder('notification');
        if (userId) {
            queryBuilder.where('notification.user_id = :userId', { userId });
        }
        const stats = await queryBuilder
            .select('notification.delivery_status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('notification.delivery_status')
            .getRawMany();
        const total = await queryBuilder.getCount();
        return {
            total,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = parseInt(stat.count);
                return acc;
            }, {}),
        };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_delivery_log_entity_1.NotificationDeliveryLog)),
    __param(6, (0, common_1.Inject)('DataSource')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        rabbitmq_service_1.RabbitMQService,
        notification_gateway_1.NotificationGateway,
        config_1.ConfigService,
        typeorm_2.DataSource])
], NotificationService);
//# sourceMappingURL=notification.service.js.map