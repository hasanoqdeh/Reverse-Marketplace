import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { MessageService } from '../messages/message.service';
import { ConversationService } from '../conversations/conversation.service';
import { MessageType } from '../../infrastructure/cassandra/models/message.model';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly configService;
    private readonly redisService;
    private readonly messageService;
    private readonly conversationService;
    server: Server;
    private readonly logger;
    constructor(configService: ConfigService, redisService: RedisService, messageService: MessageService, conversationService: ConversationService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinConversation(data: {
        conversation_id: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleLeaveConversation(data: {
        conversation_id: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleSendMessage(data: {
        conversation_id: string;
        message_type: MessageType;
        text?: string;
        media_url?: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
        message: import("../../infrastructure/cassandra/models/message.model").Message;
    }>;
    handleMarkRead(data: {
        message_id: string;
    }, client: AuthenticatedSocket): Promise<{
        success: boolean;
    }>;
    handleTyping(data: {
        conversation_id: string;
        is_typing: boolean;
    }, client: AuthenticatedSocket): Promise<void>;
    handleGetOnlineUsers(client: AuthenticatedSocket): Promise<void>;
    private setupRedisAdapter;
    private extractUserIdFromToken;
    handleRedisEvent(channel: string, data: any): Promise<void>;
}
export {};
