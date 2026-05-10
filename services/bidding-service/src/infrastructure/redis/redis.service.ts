import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    console.log('Redis service initialized for Bidding Service');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  // Bid caching
  async cacheBid(bidId: string, bidData: any, ttl: number = 3600): Promise<void> {
    const key = `bid:${bidId}`;
    await this.client.setEx(key, ttl, JSON.stringify(bidData));
  }

  async getCachedBid(bidId: string): Promise<any> {
    const key = `bid:${bidId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateBidCache(bidId: string): Promise<void> {
    const key = `bid:${bidId}`;
    await this.client.del(key);
  }

  // Request bids caching
  async cacheRequestBids(requestId: string, bids: any[], ttl: number = 1800): Promise<void> {
    const key = `request:bids:${requestId}`;
    await this.client.setEx(key, ttl, JSON.stringify(bids));
  }

  async getCachedRequestBids(requestId: string): Promise<any[]> {
    const key = `request:bids:${requestId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateRequestBidsCache(requestId: string): Promise<void> {
    const key = `request:bids:${requestId}`;
    await this.client.del(key);
  }

  // Distributed locking for bid operations
  async acquireLock(resource: string, ttl: number = 30): Promise<string | null> {
    const lockKey = `lock:${resource}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    const result = await this.client.set(lockKey, lockValue, {
      NX: true,
      EX: ttl,
    });
    
    return result === 'OK' ? lockValue : null;
  }

  async releaseLock(resource: string, lockValue: string): Promise<boolean> {
    const lockKey = `lock:${resource}`;
    
    // Lua script for atomic lock release
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.client.eval(luaScript, {
      keys: [lockKey],
      arguments: [lockValue],
    });
    
    return result === 1;
  }

  // Bid submission rate limiting
  async checkBidRateLimit(merchantId: string, windowSeconds: number = 60, maxBids: number = 10): Promise<boolean> {
    const key = `rate_limit:bid:${merchantId}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }
    
    return current <= maxBids;
  }

  // Request bid tracking
  async incrementRequestBidCount(requestId: string): Promise<number> {
    const key = `request:bid_count:${requestId}`;
    return await this.client.incr(key);
  }

  async getRequestBidCount(requestId: string): Promise<number> {
    const key = `request:bid_count:${requestId}`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  // Merchant bid tracking
  async getMerchantActiveBidCount(merchantId: string): Promise<number> {
    const key = `merchant:active_bids:${merchantId}`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  async incrementMerchantActiveBidCount(merchantId: string): Promise<number> {
    const key = `merchant:active_bids:${merchantId}`;
    return await this.client.incr(key);
  }

  async decrementMerchantActiveBidCount(merchantId: string): Promise<number> {
    const key = `merchant:active_bids:${merchantId}`;
    return await this.client.decr(key);
  }

  // Bid analytics caching
  async cacheBidAnalytics(requestId: string, analytics: any, ttl: number = 1800): Promise<void> {
    const key = `analytics:${requestId}`;
    await this.client.setEx(key, ttl, JSON.stringify(analytics));
  }

  async getCachedBidAnalytics(requestId: string): Promise<any> {
    const key = `analytics:${requestId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Merchant performance metrics
  async recordBidSubmission(merchantId: string): Promise<void> {
    const key = `metrics:merchant:${merchantId}:bids_submitted`;
    await this.client.incr(key);
    await this.client.expire(key, 86400); // 24 hours TTL
  }

  async recordBidAcceptance(merchantId: string): Promise<void> {
    const key = `metrics:merchant:${merchantId}:bids_accepted`;
    await this.client.incr(key);
    await this.client.expire(key, 86400); // 24 hours TTL
  }

  async getMerchantMetrics(merchantId: string): Promise<{
    bidsSubmitted: number;
    bidsAccepted: number;
    acceptanceRate: number;
  }> {
    const submittedKey = `metrics:merchant:${merchantId}:bids_submitted`;
    const acceptedKey = `metrics:merchant:${merchantId}:bids_accepted`;
    
    const [submitted, accepted] = await Promise.all([
      this.client.get(submittedKey),
      this.client.get(acceptedKey),
    ]);
    
    const submittedCount = submitted ? parseInt(submitted) : 0;
    const acceptedCount = accepted ? parseInt(accepted) : 0;
    const acceptanceRate = submittedCount > 0 ? (acceptedCount / submittedCount) * 100 : 0;
    
    return {
      bidsSubmitted: submittedCount,
      bidsAccepted: acceptedCount,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    };
  }

  // Request status caching
  async cacheRequestStatus(requestId: string, status: string, ttl: number = 3600): Promise<void> {
    const key = `request:status:${requestId}`;
    await this.client.setEx(key, ttl, status);
  }

  async getCachedRequestStatus(requestId: string): Promise<string | null> {
    const key = `request:status:${requestId}`;
    return await this.client.get(key);
  }

  async invalidateRequestStatus(requestId: string): Promise<void> {
    const key = `request:status:${requestId}`;
    await this.client.del(key);
  }

  // Bid deduplication
  async hasBidBeenSubmitted(requestId: string, merchantId: string): Promise<boolean> {
    const key = `bid_exists:${requestId}:${merchantId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async markBidSubmitted(requestId: string, merchantId: string, ttl: number = 86400): Promise<void> {
    const key = `bid_exists:${requestId}:${merchantId}`;
    await this.client.setEx(key, ttl, '1');
  }

  // Performance monitoring
  async recordBidProcessingTime(operation: string, timeMs: number): Promise<void> {
    const key = `performance:${operation}`;
    await this.client.lPush(key, timeMs.toString());
    await this.client.lTrim(key, 0, 999); // Keep last 1000 measurements
    await this.client.expire(key, 3600); // 1 hour TTL
  }

  async getAverageProcessingTime(operation: string): Promise<number> {
    const key = `performance:${operation}`;
    const values = await this.client.lRange(key, 0, -1);
    
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc: number, val: string) => acc + parseFloat(val), 0);
    return sum / values.length;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    await this.client.ping();
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  }

  // Cleanup expired data
  async cleanupExpiredData(): Promise<void> {
    // This would be called by a scheduled job
    console.log('Cleaning up expired Redis data...');
    // Implementation would depend on specific cleanup needs
  }
}
