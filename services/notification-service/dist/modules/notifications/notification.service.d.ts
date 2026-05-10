import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { NotificationGateway } from '../websocket/notification.gateway';
import { Notification, NotificationType, DeliveryChannel } from '../../common/entities/notification.entity';
import { NotificationDeliveryLog } from '../../common/entities/notification-delivery-log.entity';
export interface CreateNotificationDto {
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, any>;
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
}
export interface NotificationDeliveryResult {
    notificationId: string;
    userId: string;
    delivered: boolean;
    channel: DeliveryChannel;
    timestamp: Date;
    error?: string;
}
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly deliveryLogRepository;
    private readonly redisService;
    private readonly rabbitMQService;
    private readonly notificationGateway;
    private readonly configService;
    private readonly dataSource;
    constructor(notificationRepository: Repository<Notification>, deliveryLogRepository: Repository<NotificationDeliveryLog>, redisService: RedisService, rabbitMQService: RabbitMQService, notificationGateway: NotificationGateway, configService: ConfigService, dataSource: DataSource);
    createNotification(data: CreateNotificationDto): Promise<Notification>;
    deliverNotification(notification: Notification): Promise<NotificationDeliveryResult[]>;
    private deliverViaWebSocket;
    private deliverViaPush;
    private sendFCMNotification;
    private sendAPNSNotification;
    private logDeliveryAttempt;
    private updateNotificationStatus;
    getUserNotifications(userId: string, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    markNotificationAsRead(notificationId: string, userId: string): Promise<void>;
    markAllNotificationsAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    sendBulkNotifications(userIds: string[], notificationData: Omit<CreateNotificationDto, 'user_id'>): Promise<NotificationDeliveryResult[]>;
    getNotificationStats(userId?: string): Promise<any>;
}
