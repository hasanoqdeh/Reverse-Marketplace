"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = require("amqplib");
let RabbitMQService = class RabbitMQService {
    constructor(configService) {
        this.configService = configService;
        this.consumers = new Map();
    }
    async onModuleInit() {
        const rabbitmqUrl = this.configService.get('rabbitmq.url');
        this.exchange = this.configService.get('rabbitmq.exchange', 'reverse-marketplace');
        try {
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();
            await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
            await this.channel.assertExchange(`${this.exchange}.dlq`, 'topic', { durable: true });
            console.log('RabbitMQ connection established for Notification Service');
        }
        catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        for (const [queue, consumer] of this.consumers) {
            try {
                await this.channel.cancel(consumer.consumerTag);
            }
            catch (error) {
                console.error(`Error canceling consumer for queue ${queue}:`, error);
            }
        }
        if (this.channel) {
            await this.channel.close();
        }
        if (this.connection) {
            await this.connection.close();
        }
    }
    async publishEvent(eventType, event) {
        try {
            const routingKey = `notification.${eventType}`;
            const message = Buffer.from(JSON.stringify(event));
            await this.channel.publish(this.exchange, routingKey, message, {
                messageId: event.eventId,
                timestamp: new Date().toISOString(),
                persistent: true,
            });
            console.log(`Published event: ${eventType} with ID: ${event.eventId}`);
        }
        catch (error) {
            console.error(`Failed to publish event ${eventType}:`, error);
            throw error;
        }
    }
    async consumeEvents(queueName, routingKeys, handler) {
        try {
            await this.channel.assertQueue(queueName, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': `${this.exchange}.dlq`,
                    'x-dead-letter-routing-key': routingKeys[0],
                },
            });
            for (const routingKey of routingKeys) {
                await this.channel.bindQueue(queueName, this.exchange, routingKey);
            }
            await this.channel.prefetch(10);
            const consumer = await this.channel.consume(queueName, async (msg) => {
                if (!msg) {
                    console.log('Received null message, skipping');
                    return;
                }
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log(`Processing event: ${event.eventType} with ID: ${event.eventId}`);
                    await handler(event);
                    this.channel.ack(msg);
                    console.log(`Successfully processed event: ${event.eventType}`);
                }
                catch (error) {
                    console.error(`Error processing event from queue ${queueName}:`, error);
                    this.channel.nack(msg, false, false);
                }
            });
            this.consumers.set(queueName, consumer);
            console.log(`Started consuming events for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
        }
        catch (error) {
            console.error(`Failed to setup consumer for queue ${queueName}:`, error);
            throw error;
        }
    }
    async createQueue(queueName, options) {
        try {
            await this.channel.assertQueue(queueName, {
                durable: true,
                ...options,
            });
            console.log(`Created queue: ${queueName}`);
        }
        catch (error) {
            console.error(`Failed to create queue ${queueName}:`, error);
            throw error;
        }
    }
    async bindQueue(queueName, routingKey) {
        try {
            await this.channel.bindQueue(queueName, this.exchange, routingKey);
            console.log(`Bound queue ${queueName} to routing key ${routingKey}`);
        }
        catch (error) {
            console.error(`Failed to bind queue ${queueName} to routing key ${routingKey}:`, error);
            throw error;
        }
    }
    async getQueueInfo(queueName) {
        try {
            const info = await this.channel.checkQueue(queueName);
            return {
                queue: queueName,
                messageCount: info.messageCount,
                consumerCount: info.consumerCount,
            };
        }
        catch (error) {
            console.error(`Failed to get queue info for ${queueName}:`, error);
            return null;
        }
    }
    async purgeQueue(queueName) {
        try {
            await this.channel.purgeQueue(queueName);
            console.log(`Purged queue: ${queueName}`);
        }
        catch (error) {
            console.error(`Failed to purge queue ${queueName}:`, error);
            throw error;
        }
    }
    createDomainEvent(eventType, aggregateId, data) {
        return {
            eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            eventType,
            aggregateId,
            data,
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
    }
    async getHealthStatus() {
        try {
            if (!this.connection || this.connection.connection.serverProperties === undefined) {
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
        }
        catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map