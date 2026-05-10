import { NotificationService } from './notification.service';
import { NotificationType } from '../../common/entities/notification.entity';
export declare class CreateNotificationEndpointDto {
    type: NotificationType;
    title: string;
    body: string;
    payload?: Record<string, any>;
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
}
export declare class BulkNotificationDto {
    userIds: string[];
    notification: CreateNotificationEndpointDto;
}
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    createNotification(createNotificationDto: CreateNotificationEndpointDto, req: any): Promise<{
        data: import("../../common/entities/notification.entity").Notification;
        message: string;
    }>;
    getUserNotifications(req: any, page?: number, limit?: number, unreadOnly?: boolean): Promise<{
        data: import("../../common/entities/notification.entity").Notification[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(req: any): Promise<{
        data: {
            unreadCount: number;
        };
    }>;
    getNotificationStats(req: any): Promise<{
        data: any;
    }>;
    markNotificationAsRead(id: string, req: any): Promise<{
        message: string;
    }>;
    markAllNotificationsAsRead(req: any): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, req: any): Promise<{
        message: string;
    }>;
    sendBulkNotifications(bulkNotificationDto: BulkNotificationDto): Promise<{
        data: import("./notification.service").NotificationDeliveryResult[];
        message: string;
        summary: {
            total: number;
            delivered: number;
            failed: number;
        };
    }>;
}
export declare class AdminNotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    broadcastNotification(createNotificationDto: CreateNotificationEndpointDto): Promise<{
        data: import("../../common/entities/notification.entity").Notification;
        message: string;
    }>;
    getSystemNotificationStats(): Promise<{
        data: any;
    }>;
}
