import { types } from 'cassandra-driver';
type TimeUuidType = InstanceType<typeof types.TimeUuid>;
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VOICE = "VOICE",
    VIDEO = "VIDEO",
    LOCATION = "LOCATION",
    SYSTEM = "SYSTEM"
}
export declare enum DeliveryStatus {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED"
}
export interface Message {
    conversation_id: string;
    message_id: TimeUuidType;
    sender_id: string;
    message_type: MessageType;
    text?: string;
    media_url?: string;
    is_read: boolean;
    created_at: Date;
}
export interface MessageDeliveryStatus {
    conversation_id: string;
    message_id: TimeUuidType;
    delivered_to: string;
    status: DeliveryStatus;
    updated_at: Date;
}
export interface CreateMessageDto {
    conversation_id: string;
    sender_id?: string;
    message_type: MessageType;
    text?: string;
    media_url?: string;
}
export interface UpdateMessageReadStatusDto {
    message_id: TimeUuidType;
    is_read: boolean;
}
export declare class MessageModel {
    static tableName: string;
    static deliveryTableName: string;
    static createQueries: {
        createTable: string;
        createDeliveryTable: string;
        createIndexes: string[];
    };
    static queries: {
        insert: string;
        selectByConversationId: string;
        selectByConversationIdWithPagination: string;
        selectById: string;
        selectUnreadByUser: string;
        updateReadStatus: string;
        markConversationRead: string;
        insertDeliveryStatus: string;
        updateDeliveryStatus: string;
        selectDeliveryStatus: string;
        deleteById: string;
    };
    static create(data: CreateMessageDto): Message;
    static validate(data: any): Message | null;
    static createDeliveryStatus(conversation_id: string, message_id: TimeUuidType, delivered_to: string, status: DeliveryStatus): MessageDeliveryStatus;
    static sanitizeText(text: string): string;
    static validateMessageContent(message: CreateMessageDto): {
        isValid: boolean;
        error?: string;
    };
}
export {};
