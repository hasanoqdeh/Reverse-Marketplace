import { ConversationService } from './conversation.service';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    getUserConversations(page: number, limit: number, req: any): Promise<{
        data: {
            conversations: import("../../infrastructure/cassandra/models/conversation.model").Conversation[];
            total: number;
            page: number;
            totalPages: number;
        };
    }>;
    getConversation(conversationId: string, req: any): Promise<{
        data: import("../../infrastructure/cassandra/models/conversation.model").Conversation;
    }>;
    archiveConversation(conversationId: string, req: any): Promise<{
        message: string;
    }>;
    blockConversation(conversationId: string, req: any): Promise<{
        message: string;
    }>;
    closeConversation(conversationId: string, req: any): Promise<{
        message: string;
    }>;
    getConversationParticipants(conversationId: string, req: any): Promise<{
        data: {
            participants: string[];
        };
    }>;
}
