export declare enum DeliveryStatus {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    READ = "READ",
    RETRYING = "RETRYING"
}
export declare enum NotificationType {
    MATCH_FOUND = "MATCH_FOUND",
    BID_SUBMITTED = "BID_SUBMITTED",
    BID_ACCEPTED = "BID_ACCEPTED",
    BID_REJECTED = "BID_REJECTED",
    BID_EXPIRED = "BID_EXPIRED",
    REQUEST_COMPLETED = "REQUEST_COMPLETED",
    REQUEST_CANCELLED = "REQUEST_CANCELLED",
    USER_BANNED = "USER_BANNED",
    SYSTEM = "SYSTEM"
}
export declare enum DeliveryChannel {
    SOCKET = "SOCKET",
    FCM = "FCM",
    APNS = "APNS"
}
export declare enum DeliveryLogStatus {
    PENDING = "PENDING",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    RETRYING = "RETRYING"
}
export declare class Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    body: string;
    payload: Record<string, any>;
    delivery_status: DeliveryStatus;
    is_read: boolean;
    created_at: Date;
}
