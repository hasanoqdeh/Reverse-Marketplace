import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { NotificationService } from './notification.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
export declare class EventConsumerService implements OnModuleInit {
    private readonly rabbitMQService;
    private readonly notificationService;
    private readonly redisService;
    constructor(rabbitMQService: RabbitMQService, notificationService: NotificationService, redisService: RedisService);
    onModuleInit(): Promise<void>;
    private handleMatchFound;
    private handleBidSubmitted;
    private handleBidAccepted;
    private handleBidRejected;
    private handleBidExpired;
    private handleRequestCompleted;
    private handleRequestCancelled;
    private handleUserBanned;
    private getNotificationContent;
}
