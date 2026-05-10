import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { Conversation, ConversationStatus, CreateConversationDto } from '../../infrastructure/cassandra/models/conversation.model';
export declare class ConversationService {
    private readonly cassandraClient;
    private readonly redisService;
    private readonly rabbitMQService;
    private readonly configService;
    constructor(cassandraClient: any, redisService: RedisService, rabbitMQService: RabbitMQService, configService: ConfigService);
    createConversation(data: CreateConversationDto): Promise<Conversation>;
    getConversationById(conversationId: string): Promise<Conversation | null>;
    findByRequestId(requestId: string): Promise<Conversation | null>;
    findByRequestIdAndMerchant(requestId: string, merchantId: string): Promise<Conversation | null>;
    getUserConversations(userId: string, page?: number, limit?: number): Promise<{
        conversations: Conversation[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateConversationStatus(conversationId: string, status: ConversationStatus): Promise<Conversation | null>;
    archiveConversation(conversationId: string, userId: string): Promise<boolean>;
    blockConversation(conversationId: string, userId: string): Promise<boolean>;
    closeConversation(conversationId: string): Promise<boolean>;
    canUserAccessConversation(conversationId: string, userId: string): Promise<boolean>;
    getConversationParticipants(conversationId: string): Promise<string[]>;
    private initializeUserConversations;
    cleanupExpiredConversations(): Promise<void>;
}
