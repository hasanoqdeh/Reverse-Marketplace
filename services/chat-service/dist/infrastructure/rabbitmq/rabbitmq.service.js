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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RabbitMQService = class RabbitMQService {
    constructor(connection, configService) {
        this.connection = connection;
        this.configService = configService;
    }
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
    async publishEvent(routingKey, event) {
        const message = Buffer.from(JSON.stringify(event));
        const published = this.channel.publish(this.exchange, routingKey, message, {
            persistent: true,
            messageId: event.eventId,
            timestamp: Date.now(),
            headers: {
                'event-type': event.eventType,
                'aggregate-id': event.aggregateId,
                version: event.version,
            },
        });
        if (!published) {
            throw new Error(`Failed to publish event to routing key: ${routingKey}`);
        }
        console.log(`Chat Service Event published: ${event.eventType} to ${routingKey}`);
    }
    async consumeEvents(queueName, routingKeys, callback) {
        await this.channel.assertQueue(queueName, { durable: true });
        for (const routingKey of routingKeys) {
            await this.channel.bindQueue(queueName, this.exchange, routingKey);
        }
        await this.channel.prefetch(1);
        await this.channel.consume(queueName, async (msg) => {
            if (!msg) {
                console.log('Consumer cancelled by server');
                return;
            }
            try {
                const event = JSON.parse(msg.content.toString());
                await callback(event);
                this.channel.ack(msg);
                console.log(`Chat Service Event processed: ${event.eventType} from ${queueName}`);
            }
            catch (error) {
                console.error(`Error processing event from ${queueName}:`, error);
                this.channel.nack(msg, false, false);
            }
        });
        console.log(`Chat Service Consumer started for queue: ${queueName} with routing keys: ${routingKeys.join(', ')}`);
    }
    async publishMessageSent(messageId, conversationId, senderId, messageType) {
        const event = {
            eventId: this.generateEventId(),
            eventType: 'chat.message.sent',
            aggregateId: messageId,
            data: { messageId, conversationId, senderId, messageType },
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        await this.publishEvent('chat.message.sent', event);
    }
    async publishMessageRead(messageId, conversationId, userId) {
        const event = {
            eventId: this.generateEventId(),
            eventType: 'chat.message.read',
            aggregateId: messageId,
            data: { messageId, conversationId, userId },
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        await this.publishEvent('chat.message.read', event);
    }
    async publishConversationCreated(conversationId, requestId, buyerId, merchantId) {
        const event = {
            eventId: this.generateEventId(),
            eventType: 'chat.conversation.created',
            aggregateId: conversationId,
            data: { conversationId, requestId, buyerId, merchantId },
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        await this.publishEvent('chat.conversation.created', event);
    }
    async publishUserTyping(conversationId, userId, isTyping) {
        const event = {
            eventId: this.generateEventId(),
            eventType: 'chat.user.typing',
            aggregateId: conversationId,
            data: { conversationId, userId, isTyping },
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        await this.publishEvent('chat.user.typing', event);
    }
    async publishUserOnline(userId, isOnline) {
        const event = {
            eventId: this.generateEventId(),
            eventType: 'chat.user.online',
            aggregateId: userId,
            data: { userId, isOnline },
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        await this.publishEvent('chat.user.online', event);
    }
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async setupDeadLetterQueue(queueName) {
        const dlqName = `${queueName}.dlq`;
        await this.channel.assertQueue(dlqName, { durable: true });
        await this.channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': dlqName,
                'x-message-ttl': 60000,
            },
        });
    }
    async healthCheck() {
        try {
            const queues = await this.channel.checkQueue('chat-service.events');
            return {
                status: 'healthy',
                queues: ['chat-service.events'],
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                queues: [],
            };
        }
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('RABBITMQ_CONNECTION')),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map