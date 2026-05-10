export declare enum DeviceType {
    IOS = "IOS",
    ANDROID = "ANDROID",
    WEB = "WEB"
}
export declare class NotificationToken {
    id: string;
    user_id: string;
    device_type: DeviceType;
    token: string;
    is_active: boolean;
    last_used_at: Date;
    created_at: Date;
}
