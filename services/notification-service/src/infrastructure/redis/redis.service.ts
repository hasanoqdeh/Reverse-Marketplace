import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.client = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);

    await this.client.connect();
    await this.subscriber.connect();

    console.log('Redis service initialized for Notification Service');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
  }

  // Presence Management
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const key = `user:${userId}:presence`;
    const presenceData = {
      isOnline: true,
      socketId,
      lastSeen: new Date().toISOString(),
    };
    
    await this.client.hset(key, presenceData);
    await this.client.expire(key, 3600); // 1 hour TTL
  }

  async setUserOffline(userId: string): Promise<void> {
    const key = `user:${userId}:presence`;
    await this.client.hset(key, 'isOnline', 'false');
    await this.client.hset(key, 'lastSeen', new Date().toISOString());
    await this.client.expire(key, 3600);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const key = `user:${userId}:presence`;
    const presence = await this.client.hgetall(key);
    return presence?.isOnline === 'true';
  }

  async getUserPresence(userId: string): Promise<any> {
    const key = `user:${userId}:presence`;
    return await this.client.hgetall(key);
  }

  // Socket Session Management
  async addSocketSession(userId: string, socketId: string): Promise<void> {
    const key = `user:${userId}:sockets`;
    await this.client.sadd(key, socketId);
    await this.client.expire(key, 3600);
  }

  async removeSocketSession(userId: string, socketId: string): Promise<void> {
    const key = `user:${userId}:sockets`;
    await this.client.srem(key, socketId);
  }

  async getUserSockets(userId: string): Promise<string[]> {
    const key = `user:${userId}:sockets`;
    return await this.client.smembers(key);
  }

  // Notification Deduplication
  async setNotificationDedupeKey(notificationId: string, ttl: number = 300): Promise<void> {
    const key = `notification:${notificationId}:dedupe`;
    await this.client.setex(key, ttl, '1');
  }

  async isNotificationDuplicate(notificationId: string): Promise<boolean> {
    const key = `notification:${notificationId}:dedupe`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Rate Limiting
  async checkNotificationRateLimit(userId: string, limit: number = 10, window: number = 60): Promise<boolean> {
    const key = `rate_limit:notification:${userId}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    return current <= limit;
  }

  // Pub/Sub for Cross-Instance Communication
  async publishToChannel(channel: string, data: any): Promise<void> {
    await this.client.publish(channel, JSON.stringify(data));
  }

  async subscribeToChannel(channel: string, callback: (data: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const data = JSON.parse(message);
          callback(data);
        } catch (error) {
          console.error('Error parsing Redis message:', error);
        }
      }
    });
  }

  // Device Token Management
  async setDeviceToken(userId: string, deviceType: string, token: string): Promise<void> {
    const key = `user:${userId}:tokens:${deviceType}`;
    await this.client.sadd(key, token);
    await this.client.expire(key, 86400 * 30); // 30 days TTL
  }

  async getDeviceTokens(userId: string, deviceType?: string): Promise<string[]> {
    if (deviceType) {
      const key = `user:${userId}:tokens:${deviceType}`;
      return await this.client.smembers(key);
    }
    
    // Get all device types
    const keys = await this.client.keys(`user:${userId}:tokens:*`);
    const tokens: string[] = [];
    
    for (const key of keys) {
      const deviceTokens = await this.client.smembers(key);
      tokens.push(...deviceTokens);
    }
    
    return tokens;
  }

  async removeDeviceToken(userId: string, deviceType: string, token: string): Promise<void> {
    const key = `user:${userId}:tokens:${deviceType}`;
    await this.client.srem(key, token);
  }

  // Health Check
  async getHealthStatus(): Promise<any> {
    try {
      const pong = await this.client.ping();
      const info = await this.client.info('memory');
      
      return {
        status: 'healthy',
        redis: {
          connected: pong === 'PONG',
          memory: info,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}
