import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
interface AuthenticatedSocket extends Socket {
    user?: {
        sub: string;
        email: string;
        role: string;
    };
}
export declare class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly redisService;
    private readonly rabbitMQService;
    server: Server;
    private readonly logger;
    constructor(redisService: RedisService, rabbitMQService: RabbitMQService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleMarkNotificationRead(client: AuthenticatedSocket, data: {
        notificationId: string;
    }): Promise<void>;
    handleGetUnreadCount(client: AuthenticatedSocket): Promise<void>;
    handlePing(client: AuthenticatedSocket): Promise<void>;
    sendNotificationToUser(userId: string, notification: any): Promise<{
        delivered: boolean;
        channel: string;
        error?: undefined;
    } | {
        delivered: boolean;
        error: any;
        channel?: undefined;
    }>;
    broadcastNotification(notification: any, targetRole?: string): Promise<void>;
    private setupRedisAdapter;
    private subscribeToRedisEvents;
    getGatewayStats(): Promise<{
        connectedClients: number;
        serverId: string;
        uptime: number;
    }>;
}
export {};
