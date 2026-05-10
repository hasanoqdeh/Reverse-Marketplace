import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { NotificationGateway } from '../websocket/notification.gateway';
import { 
  Notification, 
  NotificationType, 
  DeliveryStatus,
  DeliveryChannel,
  DeliveryLogStatus
} from '../../common/entities/notification.entity';
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

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepository: Repository<NotificationDeliveryLog>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificationGateway: NotificationGateway,
    private readonly configService: ConfigService,
    @Inject('DataSource') private readonly dataSource: DataSource,
  ) {}

  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    // Check rate limiting
    const rateLimitValid = await this.redisService.checkNotificationRateLimit(
      data.user_id,
      this.configService.get('notifications.rateLimit', 10),
      this.configService.get('notifications.rateWindow', 60)
    );

    if (!rateLimitValid) {
      throw new Error('Notification rate limit exceeded');
    }

    // Create notification record
    const notification = this.notificationRepository.create({
      ...data,
      delivery_status: DeliveryStatus.PENDING,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Start delivery process
    this.deliverNotification(savedNotification);

    return savedNotification;
  }

  async deliverNotification(notification: Notification): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    try {
      // Check for duplicate delivery
      const isDuplicate = await this.redisService.isNotificationDuplicate(notification.id);
      if (isDuplicate) {
        return [{
          notificationId: notification.id,
          userId: notification.user_id,
          delivered: false,
          channel: DeliveryChannel.SOCKET,
          timestamp: new Date(),
          error: 'Duplicate notification',
        }];
      }

      // Set deduplication key
      await this.redisService.setNotificationDedupeKey(notification.id, 300); // 5 minutes

      // Try WebSocket delivery first
      const socketResult = await this.deliverViaWebSocket(notification);
      results.push(socketResult);

      // If WebSocket delivery failed, try push notifications
      if (!socketResult.delivered) {
        const pushResults = await this.deliverViaPush(notification);
        results.push(...pushResults);
      }

      // Update notification status based on results
      const anyDelivered = results.some(r => r.delivered);
      await this.updateNotificationStatus(
        notification.id,
        anyDelivered ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED
      );

      // Publish delivery event
      const deliveryEvent = this.rabbitMQService.createDomainEvent(
        'notification.sent',
        notification.id,
        {
          userId: notification.user_id,
          type: notification.type,
          delivered: anyDelivered,
          channels: results.map(r => r.channel),
        }
      );
      await this.rabbitMQService.publishEvent('notification.sent', deliveryEvent);

      return results;
    } catch (error) {
      console.error(`Error delivering notification ${notification.id}:`, error);
      
      // Mark as failed
      await this.updateNotificationStatus(notification.id, DeliveryStatus.FAILED);
      
      // Publish failure event
      const failureEvent = this.rabbitMQService.createDomainEvent(
        'notification.failed',
        notification.id,
        {
          userId: notification.user_id,
          type: notification.type,
          error: error.message,
        }
      );
      await this.rabbitMQService.publishEvent('notification.failed', failureEvent);

      throw error;
    }
  }

  private async deliverViaWebSocket(notification: Notification): Promise<NotificationDeliveryResult> {
    try {
      const result = await this.notificationGateway.sendNotificationToUser(
        notification.user_id,
        {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          payload: notification.payload,
          timestamp: notification.created_at,
        }
      );

      // Log delivery attempt
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.SOCKET,
        result.delivered ? DeliveryLogStatus.DELIVERED : DeliveryLogStatus.FAILED,
        result.error
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: result.delivered,
        channel: DeliveryChannel.SOCKET,
        timestamp: new Date(),
        error: result.error,
      };
    } catch (error) {
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.SOCKET,
        DeliveryLogStatus.FAILED,
        error.message
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: false,
        channel: DeliveryChannel.SOCKET,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  private async deliverViaPush(notification: Notification): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];

    try {
      // Get user's device tokens
      const fcmTokens = await this.redisService.getDeviceTokens(notification.user_id, 'ANDROID');
      const apnsTokens = await this.redisService.getDeviceTokens(notification.user_id, 'IOS');

      // Send FCM notifications
      if (fcmTokens.length > 0) {
        const fcmResult = await this.sendFCMNotification(notification, fcmTokens);
        results.push(fcmResult);
      }

      // Send APNS notifications
      if (apnsTokens.length > 0) {
        const apnsResult = await this.sendAPNSNotification(notification, apnsTokens);
        results.push(apnsResult);
      }

      return results;
    } catch (error) {
      console.error(`Error delivering push notification ${notification.id}:`, error);
      
      return [{
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: false,
        channel: DeliveryChannel.FCM,
        timestamp: new Date(),
        error: error.message,
      }];
    }
  }

  private async sendFCMNotification(notification: Notification, tokens: string[]): Promise<NotificationDeliveryResult> {
    try {
      // TODO: Implement actual FCM delivery
      // For now, we'll simulate the delivery
      
      console.log(`Sending FCM notification ${notification.id} to ${tokens.length} Android devices`);
      
      // Simulate successful delivery
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.FCM,
        DeliveryLogStatus.DELIVERED
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: true,
        channel: DeliveryChannel.FCM,
        timestamp: new Date(),
      };
    } catch (error) {
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.FCM,
        DeliveryLogStatus.FAILED,
        error.message
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: false,
        channel: DeliveryChannel.FCM,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  private async sendAPNSNotification(notification: Notification, tokens: string[]): Promise<NotificationDeliveryResult> {
    try {
      // TODO: Implement actual APNS delivery
      // For now, we'll simulate the delivery
      
      console.log(`Sending APNS notification ${notification.id} to ${tokens.length} iOS devices`);
      
      // Simulate successful delivery
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.APNS,
        DeliveryLogStatus.DELIVERED
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: true,
        channel: DeliveryChannel.APNS,
        timestamp: new Date(),
      };
    } catch (error) {
      await this.logDeliveryAttempt(
        notification.id,
        DeliveryChannel.APNS,
        DeliveryLogStatus.FAILED,
        error.message
      );

      return {
        notificationId: notification.id,
        userId: notification.user_id,
        delivered: false,
        channel: DeliveryChannel.APNS,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  private async logDeliveryAttempt(
    notificationId: string,
    channel: DeliveryChannel,
    status: DeliveryLogStatus,
    failureReason?: string
  ): Promise<void> {
    const deliveryLog = this.deliveryLogRepository.create({
      notification_id: notificationId,
      channel,
      status,
      failure_reason: failureReason,
      delivered_at: status === DeliveryLogStatus.DELIVERED ? new Date() : null,
    });

    await this.deliveryLogRepository.save(deliveryLog);
  }

  private async updateNotificationStatus(notificationId: string, status: DeliveryStatus): Promise<void> {
    await this.notificationRepository.update(notificationId, { delivery_status: status });
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; total: number }> {
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

  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, user_id: userId },
      { is_read: true, delivery_status: DeliveryStatus.READ }
    );

    // Publish read event
    const readEvent = this.rabbitMQService.createDomainEvent(
      'notification.read',
      notificationId,
      { userId, timestamp: new Date().toISOString() }
    );
    await this.rabbitMQService.publishEvent('notification.read', readEvent);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, delivery_status: DeliveryStatus.READ }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({
      id: notificationId,
      user_id: userId,
    });
  }

  // Bulk notification delivery for multiple users
  async sendBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationDto, 'user_id'>
  ): Promise<NotificationDeliveryResult[]> {
    const allResults: NotificationDeliveryResult[] = [];

    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          ...notificationData,
          user_id: userId,
        });

        const results = await this.deliverNotification(notification);
        allResults.push(...results);
      } catch (error) {
        console.error(`Failed to send bulk notification to user ${userId}:`, error);
        allResults.push({
          notificationId: 'bulk-failed',
          userId,
          delivered: false,
          channel: DeliveryChannel.SOCKET,
          timestamp: new Date(),
          error: error.message,
        });
      }
    }

    return allResults;
  }

  // Get notification statistics
  async getNotificationStats(userId?: string): Promise<any> {
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
}
