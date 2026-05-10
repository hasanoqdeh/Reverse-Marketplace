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
    private readonly configService;
    private connection;
    private channel;
    private exchange;
    private consumers;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    publishEvent(eventType: string, event: DomainEvent): Promise<void>;
    consumeEvents(queueName: string, routingKeys: string[], handler: (event: DomainEvent) => Promise<void>): Promise<void>;
    createQueue(queueName: string, options?: any): Promise<void>;
    bindQueue(queueName: string, routingKey: string): Promise<void>;
    getQueueInfo(queueName: string): Promise<any>;
    purgeQueue(queueName: string): Promise<void>;
    createDomainEvent(eventType: string, aggregateId: string, data: any): DomainEvent;
    getHealthStatus(): Promise<any>;
}
