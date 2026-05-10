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
    @Inject('RABBITMQ_CONNECTION')
    private readonly connection: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.channel = await this.connection.createChannel();
    this.exchange = this.configService.get('rabbitmq.exchange');
    
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    console.log('RabbitMQ channel and exchange initialized for Matching Engine');
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

    console.log(`Matching Engine Event published: ${event.eventType} to ${routingKey}`);
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
        console.log(`Matching Engine Event processed: ${event.eventType} from ${queueName}`);
      } catch (error) {
        console.error(`Error processing event from ${queueName}:`, error);
        this.channel.nack(msg, false, false);
      }
    });

    console.log(`Matching Engine Consumer started for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
  }

  // Matching Engine specific event publishing methods
  async publishMatchFound(requestId: string, buyerId: string, merchants: Array<{ merchantId: string; score: number }>): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'match.found',
      aggregateId: requestId,
      data: { requestId, buyerId, merchants },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('match.found', event);
  }

  async publishMerchantMatchFailed(requestId: string, buyerId: string, reason: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'merchant.match.failed',
      aggregateId: requestId,
      data: { requestId, buyerId, reason },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('merchant.match.failed', event);
  }

  async publishMerchantMatchPartial(requestId: string, buyerId: string, merchants: Array<{ merchantId: string; score: number }>, reason: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'merchant.match.partial',
      aggregateId: requestId,
      data: { requestId, buyerId, merchants, reason },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('merchant.match.partial', event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Setup dead letter queue for failed events
  async setupDeadLetterQueue(queueName: string): Promise<void> {
    const dlqName = `${queueName}.dlq`;
    
    await this.channel.assertQueue(dlqName, { durable: true });
    
    await this.channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': dlqName,
        'x-message-ttl': 60000, // 1 minute TTL
      },
    });
  }

  // Health check for RabbitMQ
  async healthCheck(): Promise<{ status: string; queues: string[] }> {
    try {
      const queues = await this.channel.checkQueue('matching-engine.requests');
      return {
        status: 'healthy',
        queues: ['matching-engine.requests'],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queues: [],
      };
    }
  }
}
