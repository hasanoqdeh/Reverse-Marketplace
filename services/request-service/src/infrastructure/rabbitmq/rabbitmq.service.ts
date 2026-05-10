import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  data: any;
  timestamp: string;
  version: string;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private channel: any;
  private exchange: string;

  constructor(
    @Inject('RABBITMQ_CONNECTION') private readonly connection: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.channel = await this.connection.createChannel();
    this.exchange = this.configService.get('rabbitmq.exchange');
    
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    console.log('RabbitMQ channel and exchange initialized for Request Service');
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publishEvent(routingKey: string, event: DomainEvent): Promise<void> {
    const message = Buffer.from(JSON.stringify(event));
    
    const published = this.channel.publish(
      this.exchange,
      routingKey,
      message,
      {
        persistent: true,
        messageId: event.eventId,
        timestamp: Date.now(),
        headers: {
          'event-type': event.eventType,
          'aggregate-id': event.aggregateId,
          version: event.version,
        },
      },
    );

    if (!published) {
      throw new Error(`Failed to publish event to routing key: ${routingKey}`);
    }

    console.log(`Request Service Event published: ${event.eventType} to ${routingKey}`);
  }

  async consumeEvents(queueName: string, routingKeys: string[], callback: (event: DomainEvent) => Promise<void>): Promise<void> {
    await this.channel.assertQueue(queueName, { durable: true });
    
    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queueName, this.exchange, routingKey);
    }

    await this.channel.prefetch(1);

    await this.channel.consume(queueName, async (msg: any) => {
      if (!msg) {
        console.log('Consumer cancelled by server');
        return;
      }

      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await callback(event);
        this.channel.ack(msg);
        console.log(`Request Service Event processed: ${event.eventType} from ${queueName}`);
      } catch (error) {
        console.error(`Error processing event from ${queueName}:`, error);
        this.channel.nack(msg, false, false);
      }
    });

    console.log(`Request Service Consumer started for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
  }

  // Request-specific event publishing methods
  async publishRequestCreated(requestId: string, buyerId: string, categoryId: string, locationId: string, publishedAt: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.created',
      aggregateId: requestId,
      data: { requestId, buyerId, categoryId, locationId, publishedAt },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.created', event);
  }

  async publishRequestUpdated(requestId: string, changes: any): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.updated',
      aggregateId: requestId,
      data: { requestId, changes },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.updated', event);
  }

  async publishRequestClosed(requestId: string, reason: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.closed',
      aggregateId: requestId,
      data: { requestId, reason },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.closed', event);
  }

  async publishRequestCancelled(requestId: string, buyerId: string, reason: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.cancelled',
      aggregateId: requestId,
      data: { requestId, buyerId, reason },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.cancelled', event);
  }

  async publishRequestCompleted(requestId: string, buyerId: string, merchantId: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.completed',
      aggregateId: requestId,
      data: { requestId, buyerId, merchantId },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.completed', event);
  }

  async publishRequestExpired(requestId: string, buyerId: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'request.expired',
      aggregateId: requestId,
      data: { requestId, buyerId },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('request.expired', event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
