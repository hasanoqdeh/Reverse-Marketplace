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
    console.log('RabbitMQ channel and exchange initialized for Chat Service');
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

    console.log(`Chat Service Event published: ${event.eventType} to ${routingKey}`);
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
        console.log(`Chat Service Event processed: ${event.eventType} from ${queueName}`);
      } catch (error) {
        console.error(`Error processing event from ${queueName}:`, error);
        this.channel.nack(msg, false, false);
      }
    });

    console.log(`Chat Service Consumer started for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
  }

  // Chat Service specific event publishing methods
  async publishMessageSent(messageId: string, conversationId: string, senderId: string, messageType: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'chat.message.sent',
      aggregateId: messageId,
      data: { messageId, conversationId, senderId, messageType },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('chat.message.sent', event);
  }

  async publishMessageRead(messageId: string, conversationId: string, userId: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'chat.message.read',
      aggregateId: messageId,
      data: { messageId, conversationId, userId },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('chat.message.read', event);
  }

  async publishConversationCreated(conversationId: string, requestId: string, buyerId: string, merchantId: string): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'chat.conversation.created',
      aggregateId: conversationId,
      data: { conversationId, requestId, buyerId, merchantId },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('chat.conversation.created', event);
  }

  async publishUserTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'chat.user.typing',
      aggregateId: conversationId,
      data: { conversationId, userId, isTyping },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('chat.user.typing', event);
  }

  async publishUserOnline(userId: string, isOnline: boolean): Promise<void> {
    const event: DomainEvent = {
      eventId: this.generateEventId(),
      eventType: 'chat.user.online',
      aggregateId: userId,
      data: { userId, isOnline },
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    await this.publishEvent('chat.user.online', event);
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
      const queues = await this.channel.checkQueue('chat-service.events');
      return {
        status: 'healthy',
        queues: ['chat-service.events'],
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        queues: [],
      };
    }
  }
}
