import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { NotificationService } from './notification.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { NotificationType } from '../../common/entities/notification.entity';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // Setup event consumers for different marketplace events
    
    // Match events
    await this.rabbitMQService.consumeEvents(
      'notification-match-found',
      ['match.found'],
      this.handleMatchFound.bind(this),
    );

    // Bid events
    await this.rabbitMQService.consumeEvents(
      'notification-bid-submitted',
      ['bid.submitted'],
      this.handleBidSubmitted.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'notification-bid-accepted',
      ['bid.accepted'],
      this.handleBidAccepted.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'notification-bid-rejected',
      ['bid.rejected'],
      this.handleBidRejected.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'notification-bid-expired',
      ['bid.expired'],
      this.handleBidExpired.bind(this),
    );

    // Request events
    await this.rabbitMQService.consumeEvents(
      'notification-request-completed',
      ['request.completed'],
      this.handleRequestCompleted.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'notification-request-cancelled',
      ['request.cancelled'],
      this.handleRequestCancelled.bind(this),
    );

    // User events
    await this.rabbitMQService.consumeEvents(
      'notification-user-banned',
      ['user.banned'],
      this.handleUserBanned.bind(this),
    );

    console.log('Notification Service event consumers initialized');
  }

  private async handleMatchFound(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchants } = event.data;
      
      console.log(`Processing match.found event for request ${requestId}, notifying ${merchants.length} merchants`);

      // Notify each matched merchant
      for (const merchant of merchants) {
        await this.notificationService.createNotification({
          user_id: merchant.merchantId,
          type: NotificationType.MATCH_FOUND,
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
    } catch (error) {
      console.error('Error handling match.found event:', error);
    }
  }

  private async handleBidSubmitted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
      
      console.log(`Processing bid.submitted event for request ${requestId}, notifying buyer ${buyerId}`);

      await this.notificationService.createNotification({
        user_id: buyerId,
        type: NotificationType.BID_SUBMITTED,
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
    } catch (error) {
      console.error('Error handling bid.submitted event:', error);
    }
  }

  private async handleBidAccepted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
      
      console.log(`Processing bid.accepted event for request ${requestId}`);

      // Notify merchant that their bid was accepted
      await this.notificationService.createNotification({
        user_id: merchantId,
        type: NotificationType.BID_ACCEPTED,
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

      // Notify buyer that bid was accepted (they will also get chat notification)
      await this.notificationService.createNotification({
        user_id: buyerId,
        type: NotificationType.BID_ACCEPTED,
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
    } catch (error) {
      console.error('Error handling bid.accepted event:', error);
    }
  }

  private async handleBidRejected(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, rejectionReason } = event.data;
      
      console.log(`Processing bid.rejected event for request ${requestId}`);

      await this.notificationService.createNotification({
        user_id: merchantId,
        type: NotificationType.BID_REJECTED,
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
    } catch (error) {
      console.error('Error handling bid.rejected event:', error);
    }
  }

  private async handleBidExpired(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, bidAmount, currency } = event.data;
      
      console.log(`Processing bid.expired event for request ${requestId}`);

      // Notify merchant
      await this.notificationService.createNotification({
        user_id: merchantId,
        type: NotificationType.BID_EXPIRED,
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

      // Optionally notify buyer if they had pending bids
      if (event.data.notifyBuyer) {
        await this.notificationService.createNotification({
          user_id: buyerId,
          type: NotificationType.BID_EXPIRED,
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
    } catch (error) {
      console.error('Error handling bid.expired event:', error);
    }
  }

  private async handleRequestCompleted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId } = event.data;
      
      console.log(`Processing request.completed event for request ${requestId}`);

      // Notify buyer
      await this.notificationService.createNotification({
        user_id: buyerId,
        type: NotificationType.REQUEST_COMPLETED,
        title: 'تم إكمال طلبك بنجاح',
        body: 'شكراً لاستخدامك منصتنا. تم إكمال طلبك بنجاح. يرجى تقييم التجربة.',
        payload: {
          requestId,
          merchantId,
        },
        priority: 'HIGH',
      });

      // Notify merchant
      await this.notificationService.createNotification({
        user_id: merchantId,
        type: NotificationType.REQUEST_COMPLETED,
        title: 'تم إكمال الطلب بنجاح',
        body: 'تهانينا! تم إكمال الطلب بنجاح. الدفع سيتم تحويله قريباً.',
        payload: {
          requestId,
          buyerId,
        },
        priority: 'HIGH',
      });

      console.log(`Successfully notified both parties about request completion`);
    } catch (error) {
      console.error('Error handling request.completed event:', error);
    }
  }

  private async handleRequestCancelled(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, cancellationReason } = event.data;
      
      console.log(`Processing request.cancelled event for request ${requestId}`);

      // Notify buyer
      await this.notificationService.createNotification({
        user_id: buyerId,
        type: NotificationType.REQUEST_CANCELLED,
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

      // Notify merchant if there's an active bid
      if (merchantId) {
        await this.notificationService.createNotification({
          user_id: merchantId,
          type: NotificationType.REQUEST_CANCELLED,
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
    } catch (error) {
      console.error('Error handling request.cancelled event:', error);
    }
  }

  private async handleUserBanned(event: DomainEvent): Promise<void> {
    try {
      const { userId, reason, bannedBy } = event.data;
      
      console.log(`Processing user.banned event for user ${userId}`);

      // Set user offline in Redis
      await this.redisService.setUserOffline(userId);
      
      // Clear all device tokens
      const deviceTypes = ['ANDROID', 'IOS', 'WEB'];
      for (const deviceType of deviceTypes) {
        const tokens = await this.redisService.getDeviceTokens(userId, deviceType);
        for (const token of tokens) {
          await this.redisService.removeDeviceToken(userId, deviceType, token);
        }
      }

      // Send final notification
      await this.notificationService.createNotification({
        user_id: userId,
        type: NotificationType.USER_BANNED,
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
    } catch (error) {
      console.error('Error handling user.banned event:', error);
    }
  }

  // Helper method to get Arabic notification titles and bodies based on type
  private getNotificationContent(type: NotificationType, data: any): { title: string; body: string } {
    const contentMap = {
      [NotificationType.MATCH_FOUND]: {
        title: 'طلب جديد مطابق لخدماتك',
        body: 'عميل في منطقتك يبحث عن خدمة تطابق تخصصك. انقر لعرض التفاصيل.',
      },
      [NotificationType.BID_SUBMITTED]: {
        title: 'عرض جديد على طلبك',
        body: 'تاجر قدم عرضًا على طلبك. انقر لمراجعة العرض.',
      },
      [NotificationType.BID_ACCEPTED]: {
        title: 'تم قبول العرض',
        body: 'تم قبول العرض. يمكنك الآن بدء المحادثة لتنفيذ الطلب.',
      },
      [NotificationType.BID_REJECTED]: {
        title: 'تم رفض العرض',
        body: 'تم رفض العرض. يمكنك تقديم عروض أخرى.',
      },
      [NotificationType.BID_EXPIRED]: {
        title: 'انتهت صلاحية العرض',
        body: 'انتهت صلاحية العرض. يمكنك تقديم عرض جديد إذا كان الطلب لا يزال نشطًا.',
      },
      [NotificationType.REQUEST_COMPLETED]: {
        title: 'تم إكمال الطلب',
        body: 'تم إكمال الطلب بنجاح. شكراً لاستخدامك منصتنا.',
      },
      [NotificationType.REQUEST_CANCELLED]: {
        title: 'تم إلغاء الطلب',
        body: 'تم إلغاء الطلب. يمكنك إنشاء طلب جديد في أي وقت.',
      },
      [NotificationType.USER_BANNED]: {
        title: 'تم تعليق الحساب',
        body: 'تم تعليق حسابك لمخالفة شروط الخدمة.',
      },
    };

    return contentMap[type] || {
      title: 'إشعار جديد',
      body: 'لديك إشعار جديد في منصتنا.',
    };
  }
}
