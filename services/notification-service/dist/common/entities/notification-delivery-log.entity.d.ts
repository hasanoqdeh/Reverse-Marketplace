import { Notification, DeliveryChannel, DeliveryLogStatus } from './notification.entity';
export declare class NotificationDeliveryLog {
    id: string;
    notification_id: string;
    channel: DeliveryChannel;
    status: DeliveryLogStatus;
    failure_reason: string;
    delivered_at: Date;
    created_at: Date;
    notification: Notification;
}
