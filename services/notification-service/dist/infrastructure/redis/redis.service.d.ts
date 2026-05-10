import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private client;
    private subscriber;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    setUserOnline(userId: string, socketId: string): Promise<void>;
    setUserOffline(userId: string): Promise<void>;
    isUserOnline(userId: string): Promise<boolean>;
    getUserPresence(userId: string): Promise<any>;
    addSocketSession(userId: string, socketId: string): Promise<void>;
    removeSocketSession(userId: string, socketId: string): Promise<void>;
    getUserSockets(userId: string): Promise<string[]>;
    setNotificationDedupeKey(notificationId: string, ttl?: number): Promise<void>;
    isNotificationDuplicate(notificationId: string): Promise<boolean>;
    checkNotificationRateLimit(userId: string, limit?: number, window?: number): Promise<boolean>;
    publishToChannel(channel: string, data: any): Promise<void>;
    subscribeToChannel(channel: string, callback: (data: any) => void): Promise<void>;
    setDeviceToken(userId: string, deviceType: string, token: string): Promise<void>;
    getDeviceTokens(userId: string, deviceType?: string): Promise<string[]>;
    removeDeviceToken(userId: string, deviceType: string, token: string): Promise<void>;
    getHealthStatus(): Promise<any>;
}
