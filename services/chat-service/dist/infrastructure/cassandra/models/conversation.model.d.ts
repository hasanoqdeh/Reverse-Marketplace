export declare enum ConversationStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    BLOCKED = "BLOCKED",
    CLOSED = "CLOSED"
}
export interface Conversation {
    conversation_id: string;
    request_id: string;
    buyer_id: string;
    merchant_id: string;
    status: ConversationStatus;
    created_at: Date;
    updated_at: Date;
}
export interface CreateConversationDto {
    request_id: string;
    buyer_id: string;
    merchant_id: string;
    status?: ConversationStatus;
}
export interface UpdateConversationDto {
    status?: ConversationStatus;
    updated_at?: Date;
}
export declare class ConversationModel {
    static tableName: string;
    static createQueries: {
        createTable: string;
        createIndexes: string[];
    };
    static queries: {
        insert: string;
        selectById: string;
        selectByRequestId: string;
        selectByBuyerId: string;
        selectByMerchantId: string;
        selectByParticipants: string;
        updateStatus: string;
        deleteById: string;
    };
    static create(data: CreateConversationDto): Conversation;
    static validate(data: any): Conversation | null;
}
