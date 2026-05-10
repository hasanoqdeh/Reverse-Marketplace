import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ConversationService } from '../conversations/conversation.service';
import { MessageService } from '../messages/message.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
export declare class EventConsumerService implements OnModuleInit {
    private readonly rabbitMQService;
    private readonly conversationService;
    private readonly messageService;
    private readonly redisService;
    constructor(rabbitMQService: RabbitMQService, conversationService: ConversationService, messageService: MessageService, redisService: RedisService);
    onModuleInit(): Promise<void>;
    private setupEventConsumers;
    private handleBidAccepted;
    private handleRequestLifecycleEvent;
    private handleUserManagementEvent;
    private blockUserFromMessaging;
    private cleanupUserData;
    handleChatMessageSent(event: DomainEvent): Promise<void>;
    handleChatMessageRead(event: DomainEvent): Promise<void>;
    handleChatUserTyping(event: DomainEvent): Promise<void>;
    handleChatUserOnline(event: DomainEvent): Promise<void>;
}
