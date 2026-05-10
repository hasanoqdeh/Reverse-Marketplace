import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface DomainEvent {
    eventId: string;
    eventType: string;
    aggregateId: string;
    data: any;
    timestamp: string;
    version: string;
}
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly connection;
    private readonly configService;
    private channel;
    private exchange;
    constructor(connection: any, configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishEvent(routingKey: string, event: DomainEvent): Promise<void>;
    consumeEvents(queueName: string, routingKeys: string[], callback: (event: DomainEvent) => Promise<void>): Promise<void>;
    publishMessageSent(messageId: string, conversationId: string, senderId: string, messageType: string): Promise<void>;
    publishMessageRead(messageId: string, conversationId: string, userId: string): Promise<void>;
    publishConversationCreated(conversationId: string, requestId: string, buyerId: string, merchantId: string): Promise<void>;
    publishUserTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void>;
    publishUserOnline(userId: string, isOnline: boolean): Promise<void>;
    private generateEventId;
    setupDeadLetterQueue(queueName: string): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        queues: string[];
    }>;
}
