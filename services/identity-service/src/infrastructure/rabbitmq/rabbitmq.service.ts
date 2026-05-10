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
    console.log('RabbitMQ channel and exchange initialized');
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

    console.log(`Event published: ${event.eventType} to ${routingKey}`);
  }

  async consumeEvents(queueName: string, routingKeys: string[], callback: (event: DomainEvent) => Promise<void>): Promise<void> {
    // Assert queue
    await this.channel.assertQueue(queueName, { durable: true });
    
    // Bind queue to exchange with routing keys
    for (const routingKey of routingKeys) {
      await this.channel.bindQueue(queueName, this.exchange, routingKey);
    }

    // Set prefetch
    await this.channel.prefetch(1);

    // Start consuming
    await this.channel.consume(queueName, async (msg: any) => {
      if (!msg) {
        console.log('Consumer cancelled by server');
        return;
      }

      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await callback(event);
        this.channel.ack(msg);
        console.log(`Event processed: ${event.eventType} from ${queueName}`);
      } catch (error) {
        console.error(`Error processing event from ${queueName}:`, error);
        this.channel.nack(msg, false, false); // Reject and don't requeue
      }
    });

    console.log(`Consumer started for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
  }

  // Specific event publishing methods
  async publishUserRegistered(userId: string, role: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'user.registered',
      aggregateId: userId,
      data: { userId, role },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('user.registered', event);
  }

  async publishUserVerified(userId: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'user.verified',
      aggregateId: userId,
      data: { userId },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('user.verified', event);
  }

  async publishMerchantVerified(userId: string, businessName: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'merchant.verified',
      aggregateId: userId,
      data: { userId, businessName },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('merchant.verified', event);
  }

  async publishUserBanned(userId: string, reason: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'user.banned',
      aggregateId: userId,
      data: { userId, reason },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('user.banned', event);
  }

  async publishProfileUpdated(userId: string, changes: any): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'user.profile.updated',
      aggregateId: userId,
      data: { userId, changes },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('user.profile.updated', event);
  }

  // SMS Queue for OTP
  async publishSMS(phone: string, message: string): Promise<void> {
    const queueName = 'sms_queue';
    const smsPayload = { phone, message, timestamp: new Date().toISOString() };
    
    await this.channel.assertQueue(queueName, { durable: true });
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(smsPayload)), {
      persistent: true,
    });

    console.log(`SMS queued for ${phone}`);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
