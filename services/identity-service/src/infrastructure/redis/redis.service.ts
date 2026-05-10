import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: any,
    private readonly configService: ConfigService,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiration = ttl || this.configService.get('otp.ttl');
    await this.redisClient.setEx(key, expiration, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async setWithTTL(key: string, value: string, ttl: number): Promise<void> {
    await this.redisClient.setEx(key, ttl, value);
  }

  // OTP specific methods
  async setOTP(phoneNumber: string, otp: string): Promise<void> {
    const key = `otp:${phoneNumber}`;
    const ttl = this.configService.get('otp.ttl');
    await this.set(key, otp, ttl);
  }

  async getOTP(phoneNumber: string): Promise<string | null> {
    const key = `otp:${phoneNumber}`;
    return await this.get(key);
  }

  async deleteOTP(phoneNumber: string): Promise<void> {
    const key = `otp:${phoneNumber}`;
    await this.del(key);
  }

  async otpExists(phoneNumber: string): Promise<boolean> {
    const key = `otp:${phoneNumber}`;
    return await this.exists(key);
  }

  // Rate limiting methods
  async incrementRateLimit(key: string, window: number): Promise<number> {
    const current = await this.redisClient.incr(key);
    if (current === 1) {
      await this.redisClient.expire(key, window);
    }
    return current;
  }

  async getRateLimit(key: string): Promise<number> {
    const value = await this.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  // Session management
  async setSession(sessionId: string, sessionData: any, ttl: number): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, JSON.stringify(sessionData), ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }
}
