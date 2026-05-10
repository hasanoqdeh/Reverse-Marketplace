import { MessageService } from './message.service';
import { MessageType } from '../../infrastructure/cassandra/models/message.model';
export declare class SendMessageDto {
    conversation_id: string;
    message_type: MessageType;
    text?: string;
    media_url?: string;
}
export declare class MarkMessageReadDto {
    message_id: string;
}
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    sendMessage(sendMessageDto: SendMessageDto, req: any): Promise<{
        data: import("../../infrastructure/cassandra/models/message.model").Message;
        message: string;
    }>;
    getConversationMessages(conversationId: string, req: any, limit?: number, before?: string): Promise<{
        data: {
            messages: import("../../infrastructure/cassandra/models/message.model").Message[];
        };
    }>;
    markMessageAsRead(markReadDto: MarkMessageReadDto, req: any): Promise<{
        message: string;
    }>;
    markAllMessagesAsRead(conversationId: string, req: any): Promise<{
        message: string;
        data: {
            unreadCount: number;
        };
    }>;
    getUnreadCount(req: any, conversationId?: string): Promise<{
        data: {
            unreadCount: number;
        };
    }>;
    getMessage(messageId: string, req: any): Promise<{
        data: import("../../infrastructure/cassandra/models/message.model").Message;
    }>;
    deleteMessage(messageId: string, req: any): Promise<{
        message: string;
    }>;
}
