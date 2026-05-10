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
const notification_service_1 = require("./notification.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const notification_entity_1 = require("../../common/entities/notification.entity");
let EventConsumerService = class EventConsumerService {
    constructor(rabbitMQService, notificationService, redisService) {
        this.rabbitMQService = rabbitMQService;
        this.notificationService = notificationService;
        this.redisService = redisService;
    }
    async onModuleInit() {
        await this.rabbitMQService.consumeEvents('notification-match-found', ['match.found'], this.handleMatchFound.bind(this));
        await this.rabbitMQService.consumeEvents('notification-bid-submitted', ['bid.submitted'], this.handleBidSubmitted.bind(this));
        await this.rabbitMQService.consumeEvents('notification-bid-accepted', ['bid.accepted'], this.handleBidAccepted.bind(this));
        await this.rabbitMQService.consumeEvents('notification-bid-rejected', ['bid.rejected'], this.handleBidRejected.bind(this));
        await this.rabbitMQService.consumeEvents('notification-bid-expired', ['bid.expired'], this.handleBidExpired.bind(this));
        await this.rabbitMQService.consumeEvents('notification-request-completed', ['request.completed'], this.handleRequestCompleted.bind(this));
        await this.rabbitMQService.consumeEvents('notification-request-cancelled', ['request.cancelled'], this.handleRequestCancelled.bind(this));
        await this.rabbitMQService.consumeEvents('notification-user-banned', ['user.banned'], this.handleUserBanned.bind(this));
        console.log('Notification Service event consumers initialized');
    }
    async handleMatchFound(event) {
        try {
            const { requestId, buyerId, merchants } = event.data;
            console.log(`Processing match.found event for request ${requestId}, notifying ${merchants.length} merchants`);
            for (const merchant of merchants) {
                await this.notificationService.createNotification({
                    user_id: merchant.merchantId,
                    type: notification_entity_1.NotificationType.MATCH_FOUND,
                    title: 'طلب جديد مطابق لخدماتك',
                    body: `عميل في منطقتك يبحث عن خدمة تطابق تخصصك. انقر لعرض التفاصيل.`,
                    payload: {
                        requestId,
                        buyerId,
                        matchScore: merchant.score,
                        distance: merchant.distance,
                    },
                    priority: 'HIGH',
                });
            }
            console.log(`Successfully notified ${merchants.length} merchants for match found event`);
        }
        catch (error) {
            console.error('Error handling match.found event:', error);
        }
    }
    async handleBidSubmitted(event) {
        try {
            const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
            console.log(`Processing bid.submitted event for request ${requestId}, notifying buyer ${buyerId}`);
            await this.notificationService.createNotification({
                user_id: buyerId,
                type: notification_entity_1.NotificationType.BID_SUBMITTED,
                title: 'عرض جديد على طلبك',
                body: `تاجر قدم عرضًا بقيمة ${bidAmount} ${currency} على طلبك. انقر لمراجعة العرض.`,
                payload: {
                    requestId,
                    merchantId,
                    bidAmount,
                    currency,
                },
                priority: 'HIGH',
            });
            console.log(`Successfully notified buyer ${buyerId} about new bid`);
        }
        catch (error) {
            console.error('Error handling bid.submitted event:', error);
        }
    }
    async handleBidAccepted(event) {
        try {
            const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
            console.log(`Processing bid.accepted event for request ${requestId}`);
            await this.notificationService.createNotification({
                user_id: merchantId,
                type: notification_entity_1.NotificationType.BID_ACCEPTED,
                title: 'تم قبول عرضك!',
                body: `تهانينا! تم قبول عرضك بقيمة ${bidAmount} ${currency}. يمكنك الآن بدء التواصل مع العميل.`,
                payload: {
                    requestId,
                    buyerId,
                    bidAmount,
                    currency,
                },
                priority: 'HIGH',
            });
            await this.notificationService.createNotification({
                user_id: buyerId,
                type: notification_entity_1.NotificationType.BID_ACCEPTED,
                title: 'تم قبول العرض',
                body: `تم قبول عرض التاجر. يمكنك الآن بدء المحادثة لتنفيذ الطلب.`,
                payload: {
                    requestId,
                    merchantId,
                    bidAmount,
                    currency,
                },
                priority: 'HIGH',
            });
            console.log(`Successfully notified both parties about bid acceptance`);
        }
        catch (error) {
            console.error('Error handling bid.accepted event:', error);
        }
    }
    async handleBidRejected(event) {
        try {
            const { requestId, buyerId, merchantId, rejectionReason } = event.data;
            console.log(`Processing bid.rejected event for request ${requestId}`);
            await this.notificationService.createNotification({
                user_id: merchantId,
                type: notification_entity_1.NotificationType.BID_REJECTED,
                title: 'تم رفض عرضك',
                body: rejectionReason
                    ? `تم رفض عرضك: ${rejectionReason}`
                    : 'تم رفض عرضك على طلب العميل. يمكنك تقديم عروض أخرى.',
                payload: {
                    requestId,
                    buyerId,
                    rejectionReason,
                },
                priority: 'NORMAL',
            });
            console.log(`Successfully notified merchant ${merchantId} about bid rejection`);
        }
        catch (error) {
            console.error('Error handling bid.rejected event:', error);
        }
    }
    async handleBidExpired(event) {
        try {
            const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
            console.log(`Processing bid.expired event for request ${requestId}`);
            await this.notificationService.createNotification({
                user_id: merchantId,
                type: notification_entity_1.NotificationType.BID_EXPIRED,
                title: 'انتهت صلاحية العرض',
                body: `عرضك بقيمة ${bidAmount} ${currency} على طلب العميل قد انتهت صلاحيته.`,
                payload: {
                    requestId,
                    buyerId,
                    bidAmount,
                    currency,
                },
                priority: 'LOW',
            });
            if (event.data.notifyBuyer) {
                await this.notificationService.createNotification({
                    user_id: buyerId,
                    type: notification_entity_1.NotificationType.BID_EXPIRED,
                    title: 'انتهت صلاحية أحد العروض',
                    body: 'أحد العروض على طلبك قد انتهت صلاحيته.',
                    payload: {
                        requestId,
                        merchantId,
                    },
                    priority: 'LOW',
                });
            }
            console.log(`Successfully handled bid expiration notification`);
        }
        catch (error) {
            console.error('Error handling bid.expired event:', error);
        }
    }
    async handleRequestCompleted(event) {
        try {
            const { requestId, buyerId, merchantId } = event.data;
            console.log(`Processing request.completed event for request ${requestId}`);
            await this.notificationService.createNotification({
                user_id: buyerId,
                type: notification_entity_1.NotificationType.REQUEST_COMPLETED,
                title: 'تم إكمال طلبك بنجاح',
                body: 'شكراً لاستخدامك منصتنا. تم إكمال طلبك بنجاح. يرجى تقييم التجربة.',
                payload: {
                    requestId,
                    merchantId,
                },
                priority: 'HIGH',
            });
            await this.notificationService.createNotification({
                user_id: merchantId,
                type: notification_entity_1.NotificationType.REQUEST_COMPLETED,
                title: 'تم إكمال الطلب بنجاح',
                body: 'تهانينا! تم إكمال الطلب بنجاح. الدفع سيتم تحويله قريباً.',
                payload: {
                    requestId,
                    buyerId,
                },
                priority: 'HIGH',
            });
            console.log(`Successfully notified both parties about request completion`);
        }
        catch (error) {
            console.error('Error handling request.completed event:', error);
        }
    }
    async handleRequestCancelled(event) {
        try {
            const { requestId, buyerId, merchantId, cancellationReason } = event.data;
            console.log(`Processing request.cancelled event for request ${requestId}`);
            await this.notificationService.createNotification({
                user_id: buyerId,
                type: notification_entity_1.NotificationType.REQUEST_CANCELLED,
                title: 'تم إلغاء طلبك',
                body: cancellationReason
                    ? `تم إلغاء طلبك: ${cancellationReason}`
                    : 'تم إلغاء طلبك. يمكنك إنشاء طلب جديد في أي وقت.',
                payload: {
                    requestId,
                    merchantId,
                    cancellationReason,
                },
                priority: 'HIGH',
            });
            if (merchantId) {
                await this.notificationService.createNotification({
                    user_id: merchantId,
                    type: notification_entity_1.NotificationType.REQUEST_CANCELLED,
                    title: 'تم إلغاء الطلب',
                    body: 'قام العميل بإلغاء الطلب. يمكنك البحث عن فرص أخرى.',
                    payload: {
                        requestId,
                        buyerId,
                        cancellationReason,
                    },
                    priority: 'HIGH',
                });
            }
            console.log(`Successfully handled request cancellation notifications`);
        }
        catch (error) {
            console.error('Error handling request.cancelled event:', error);
        }
    }
    async handleUserBanned(event) {
        try {
            const { userId, reason, bannedBy } = event.data;
            console.log(`Processing user.banned event for user ${userId}`);
            await this.redisService.setUserOffline(userId);
            const deviceTypes = ['ANDROID', 'IOS', 'WEB'];
            for (const deviceType of deviceTypes) {
                const tokens = await this.redisService.getDeviceTokens(userId, deviceType);
                for (const token of tokens) {
                    await this.redisService.removeDeviceToken(userId, deviceType, token);
                }
            }
            await this.notificationService.createNotification({
                user_id: userId,
                type: notification_entity_1.NotificationType.USER_BANNED,
                title: 'تم تعليق حسابك',
                body: reason
                    ? `تم تعليق حسابك: ${reason}`
                    : 'تم تعليق حسابك لمخالفة شروط الخدمة.',
                payload: {
                    reason,
                    bannedBy,
                    timestamp: new Date().toISOString(),
                },
                priority: 'HIGH',
            });
            console.log(`Successfully handled user ban for ${userId}`);
        }
        catch (error) {
            console.error('Error handling user.banned event:', error);
        }
    }
    getNotificationContent(type, data) {
        const contentMap = {
            [notification_entity_1.NotificationType.MATCH_FOUND]: {
                title: 'طلب جديد مطابق لخدماتك',
                body: 'عميل في منطقتك يبحث عن خدمة تطابق تخصصك. انقر لعرض التفاصيل.',
            },
            [notification_entity_1.NotificationType.BID_SUBMITTED]: {
                title: 'عرض جديد على طلبك',
                body: 'تاجر قدم عرضًا على طلبك. انقر لمراجعة العرض.',
            },
            [notification_entity_1.NotificationType.BID_ACCEPTED]: {
                title: 'تم قبول العرض',
                body: 'تم قبول العرض. يمكنك الآن بدء المحادثة لتنفيذ الطلب.',
            },
            [notification_entity_1.NotificationType.BID_REJECTED]: {
                title: 'تم رفض العرض',
                body: 'تم رفض العرض. يمكنك تقديم عروض أخرى.',
            },
            [notification_entity_1.NotificationType.BID_EXPIRED]: {
                title: 'انتهت صلاحية العرض',
                body: 'انتهت صلاحية العرض. يمكنك تقديم عرض جديد إذا كان الطلب لا يزال نشطًا.',
            },
            [notification_entity_1.NotificationType.REQUEST_COMPLETED]: {
                title: 'تم إكمال الطلب',
                body: 'تم إكمال الطلب بنجاح. شكراً لاستخدامك منصتنا.',
            },
            [notification_entity_1.NotificationType.REQUEST_CANCELLED]: {
                title: 'تم إلغاء الطلب',
                body: 'تم إلغاء الطلب. يمكنك إنشاء طلب جديد في أي وقت.',
            },
            [notification_entity_1.NotificationType.USER_BANNED]: {
                title: 'تم تعليق الحساب',
                body: 'تم تعليق حسابك لمخالفة شروط الخدمة.',
            },
        };
        return contentMap[type] || {
            title: 'إشعار جديد',
            body: 'لديك إشعار جديد في منصتنا.',
        };
    }
};
exports.EventConsumerService = EventConsumerService;
exports.EventConsumerService = EventConsumerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService,
        notification_service_1.NotificationService,
        redis_service_1.RedisService])
], EventConsumerService);
//# sourceMappingURL=event-consumer.service.js.map