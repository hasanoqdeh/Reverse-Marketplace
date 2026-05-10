import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

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
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel;
  private exchange: string;
  private consumers: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get('rabbitmq.url');
    this.exchange = this.configService.get('rabbitmq.exchange', 'reverse-marketplace');

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Assert exchange
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      // Assert dead letter exchange
      await this.channel.assertExchange(`${this.exchange}.dlq`, 'topic', { durable: true });

      console.log('RabbitMQ connection established for Payment Service');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // Close all consumers
    for (const [queue, consumer] of this.consumers) {
      try {
        if (consumer && consumer.consumerTag) {
          await this.channel.cancel(consumer.consumerTag);
        }
      } catch (error) {
        console.error(`Error canceling consumer for queue ${queue}:`, error);
      }
    }

    if (this.channel) {
      try {
        await this.channel.close();
      } catch (error) {
        console.error('Error closing channel:', error);
      }
    }
    if (this.connection) {
      try {
        await this.connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }

  async publishEvent(eventType: string, event: DomainEvent): Promise<void> {
    try {
      const routingKey = `payment.${eventType}`;
      const message = Buffer.from(JSON.stringify(event));

      await this.channel.publish(this.exchange, routingKey, message, {
        messageId: event.eventId,
        timestamp: Date.now(),
        persistent: true,
      });

      console.log(`Published event: ${eventType} with ID: ${event.eventId}`);
    } catch (error) {
      console.error(`Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  async consumeEvents(
    queueName: string,
    routingKeys: string[],
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<void> {
    try {
      // Assert queue with dead letter configuration
      await this.channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': `${this.exchange}.dlq`,
          'x-dead-letter-routing-key': routingKeys[0],
        },
      });

      // Bind queue to exchange for each routing key
      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(queueName, this.exchange, routingKey);
      }

      // Set prefetch
      await this.channel.prefetch(10);

      // Start consuming
      const consumer = await this.channel.consume(queueName, async (msg: any) => {
        if (!msg) {
          console.log('Received null message, skipping');
          return;
        }

        try {
          const event: DomainEvent = JSON.parse(msg.content.toString());
          
          console.log(`Processing event: ${event.eventType} with ID: ${event.eventId}`);
          
          await handler(event);
          
          // Acknowledge message on successful processing
          if (msg.fields) {
            this.channel.ack(msg);
          }
          
          console.log(`Successfully processed event: ${event.eventType}`);
        } catch (error) {
          console.error(`Error processing event from queue ${queueName}:`, error);
          
          // Negative acknowledgment with requeue=false to send to DLQ
          this.channel.nack(msg, false, false);
        }
      });

      this.consumers.set(queueName, consumer);
      
      console.log(`Started consuming events for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
    } catch (error) {
      console.error(`Failed to setup consumer for queue ${queueName}:`, error);
      throw error;
    }
  }

  async createQueue(queueName: string, options?: any): Promise<void> {
    try {
      await this.channel.assertQueue(queueName, {
        durable: true,
        ...options,
      });
      console.log(`Created queue: ${queueName}`);
    } catch (error) {
      console.error(`Failed to create queue ${queueName}:`, error);
      throw error;
    }
  }

  async bindQueue(queueName: string, routingKey: string): Promise<void> {
    try {
      await this.channel.bindQueue(queueName, this.exchange, routingKey);
      console.log(`Bound queue ${queueName} to routing key ${routingKey}`);
    } catch (error) {
      console.error(`Failed to bind queue ${queueName} to routing key ${routingKey}:`, error);
      throw error;
    }
  }

  async getQueueInfo(queueName: string): Promise<any> {
    try {
      const info = await this.channel.checkQueue(queueName);
      return {
        queue: queueName,
        messageCount: info.messageCount,
        consumerCount: info.consumerCount,
      };
    } catch (error) {
      console.error(`Failed to get queue info for ${queueName}:`, error);
      return null;
    }
  }

  async purgeQueue(queueName: string): Promise<void> {
    try {
      await this.channel.purgeQueue(queueName);
      console.log(`Purged queue: ${queueName}`);
    } catch (error) {
      console.error(`Failed to purge queue ${queueName}:`, error);
      throw error;
    }
  }

  // Helper method to create standardized domain events
  createDomainEvent(eventType: string, aggregateId: string, data: any): DomainEvent {
    return {
      eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      aggregateId,
      data,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    try {
      if (!this.connection) {
        return {
          status: 'unhealthy',
          error: 'No connection to RabbitMQ',
        };
      }

      const serverInfo = this.connection.connection.serverProperties;
      
      return {
        status: 'healthy',
        rabbitmq: {
          connected: true,
          server: serverInfo.product,
          version: serverInfo.version,
          exchange: this.exchange,
          activeConsumers: this.consumers.size,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
