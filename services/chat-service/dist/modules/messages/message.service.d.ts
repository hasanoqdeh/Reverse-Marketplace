import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { Message, CreateMessageDto } from '../../infrastructure/cassandra/models/message.model';
import { ConversationService } from '../conversations/conversation.service';
export declare class MessageService {
    private readonly cassandraClient;
    private readonly redisService;
    private readonly rabbitMQService;
    private readonly conversationService;
    private readonly configService;
    constructor(cassandraClient: any, redisService: RedisService, rabbitMQService: RabbitMQService, conversationService: ConversationService, configService: ConfigService);
    sendMessage(data: CreateMessageDto, senderId?: string): Promise<Message>;
    getConversationMessages(conversationId: string, userId: string, limit?: number, beforeTime?: Date): Promise<Message[]>;
    markMessageAsRead(messageId: string, userId: string): Promise<boolean>;
    markAllMessagesAsRead(conversationId: string, userId: string): Promise<number>;
    getUnreadCount(userId: string, conversationId?: string): Promise<number>;
    getMessageById(messageId: string, userId: string): Promise<Message | null>;
    deleteMessage(messageId: string, userId: string): Promise<boolean>;
    private updateUserConversations;
    private updateDeliveryStatus;
    private emitMessageToConversation;
    private emitReadReceipt;
    cleanupExpiredMessages(): Promise<void>;
}
