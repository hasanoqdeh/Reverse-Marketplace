export interface UserPresence {
    user_id: string;
    is_online: boolean;
    last_seen: Date;
    socket_id?: string;
}
export interface TypingIndicator {
    conversation_id: string;
    user_id: string;
    is_typing: boolean;
    last_seen: Date;
}
export interface UserConversations {
    user_id: string;
    conversation_id: string;
    last_message_time: Date;
    unread_count: number;
}
export declare class PresenceModel {
    static tableName: string;
    static createQueries: {
        createTable: string;
    };
    static queries: {
        upsert: string;
        selectById: string;
        selectOnlineUsers: string;
        deleteById: string;
    };
    static create(data: Partial<UserPresence>): UserPresence;
}
export declare class TypingIndicatorModel {
    static tableName: string;
    static createQueries: {
        createTable: string;
    };
    static queries: {
        upsert: string;
        selectByConversation: string;
        selectByUser: string;
        deleteByUser: string;
        cleanupExpired: string;
    };
    static create(data: Partial<TypingIndicator>): TypingIndicator;
}
export declare class UserConversationsModel {
    static tableName: string;
    static createQueries: {
        createTable: string;
    };
    static queries: {
        incrementUnread: string;
        resetUnread: string;
        updateLastMessageTime: string;
        selectByUser: string;
        selectByUserWithPagination: string;
        selectUnreadCount: string;
        getTotalUnreadCount: string;
        deleteById: string;
    };
    static create(data: Partial<UserConversations>): UserConversations;
}
