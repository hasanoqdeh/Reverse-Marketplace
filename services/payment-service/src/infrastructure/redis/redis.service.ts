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

    console.log('Redis service initialized for Payment Service');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
  }

  // Distributed Locking for Financial Operations
  async acquireLock(
    resource: string, 
    ttl: number = 30000
  ): Promise<string | null> {
    const lockKey = `lock:${resource}`;
    const lockValue = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await this.client.set(lockKey, lockValue, 'PX', ttl, 'NX');
    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(resource: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.client.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }

  async isLocked(resource: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    const exists = await this.client.exists(lockKey);
    return exists === 1;
  }

  // Wallet Balance Caching
  async cacheWalletBalance(userId: string, balance: number, ttl: number = 300): Promise<void> {
    const key = `wallet:balance:${userId}`;
    await this.client.setex(key, ttl, balance.toString());
  }

  async getCachedWalletBalance(userId: string): Promise<number | null> {
    const key = `wallet:balance:${userId}`;
    const balance = await this.client.get(key);
    return balance ? parseFloat(balance) : null;
  }

  async invalidateWalletBalance(userId: string): Promise<void> {
    const key = `wallet:balance:${userId}`;
    await this.client.del(key);
  }

  // Payment Intent Caching
  async cachePaymentIntent(paymentIntentId: string, data: any, ttl: number = 600): Promise<void> {
    const key = `payment_intent:${paymentIntentId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedPaymentIntent(paymentIntentId: string): Promise<any | null> {
    const key = `payment_intent:${paymentIntentId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Subscription Status Caching
  async cacheSubscriptionStatus(userId: string, status: any, ttl: number = 3600): Promise<void> {
    const key = `subscription:status:${userId}`;
    await this.client.setex(key, ttl, JSON.stringify(status));
  }

  async getCachedSubscriptionStatus(userId: string): Promise<any | null> {
    const key = `subscription:status:${userId}`;
    const status = await this.client.get(key);
    return status ? JSON.parse(status) : null;
  }

  // Rate Limiting
  async checkRateLimit(
    identifier: string, 
    limit: number, 
    window: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `rate_limit:${identifier}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, window);
    }
    
    const ttl = await this.client.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime,
    };
  }

  // Idempotency Keys
  async setIdempotencyKey(key: string, response: any, ttl: number = 86400): Promise<void> {
    const idempotencyKey = `idempotency:${key}`;
    await this.client.setex(idempotencyKey, ttl, JSON.stringify(response));
  }

  async getIdempotencyResponse(key: string): Promise<any | null> {
    const idempotencyKey = `idempotency:${key}`;
    const response = await this.client.get(idempotencyKey);
    return response ? JSON.parse(response) : null;
  }

  // Payment Gateway Configuration Caching
  async cacheGatewayConfig(gateway: string, config: any, ttl: number = 3600): Promise<void> {
    const key = `gateway:config:${gateway}`;
    await this.client.setex(key, ttl, JSON.stringify(config));
  }

  async getCachedGatewayConfig(gateway: string): Promise<any | null> {
    const key = `gateway:config:${gateway}`;
    const config = await this.client.get(key);
    return config ? JSON.parse(config) : null;
  }

  // Financial Metrics Caching
  async cacheMetrics(key: string, data: any, ttl: number = 300): Promise<void> {
    const metricsKey = `metrics:${key}`;
    await this.client.setex(metricsKey, ttl, JSON.stringify(data));
  }

  async getCachedMetrics(key: string): Promise<any | null> {
    const metricsKey = `metrics:${key}`;
    const data = await this.client.get(metricsKey);
    return data ? JSON.parse(data) : null;
  }

  // Pub/Sub for Real-time Updates
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

  // Financial Operation Queue
  async addToQueue(queue: string, data: any, priority: number = 0): Promise<void> {
    const queueKey = `queue:${queue}`;
    await this.client.lpush(queueKey, JSON.stringify({
      data,
      priority,
      timestamp: Date.now(),
    }));
  }

  async getNextFromQueue(queue: string): Promise<any | null> {
    const queueKey = `queue:${queue}`;
    const item = await this.client.rpop(queueKey);
    return item ? JSON.parse(item) : null;
  }

  async getQueueSize(queue: string): Promise<number> {
    const queueKey = `queue:${queue}`;
    return await this.client.llen(queueKey);
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

  // Utility Methods
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }
}
