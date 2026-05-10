import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    console.log('Redis service initialized for Matching Engine');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  // Category matching
  async getMerchantsByCategory(categoryId: string): Promise<string[]> {
    const key = `category:${categoryId}`;
    const merchants = await this.client.sMembers(key);
    return merchants;
  }

  async addMerchantToCategory(categoryId: string, merchantId: string): Promise<void> {
    const key = `category:${categoryId}`;
    await this.client.sAdd(key, merchantId);
  }

  async removeMerchantFromCategory(categoryId: string, merchantId: string): Promise<void> {
    const key = `category:${categoryId}`;
    await this.client.sRem(key, merchantId);
  }

  // Location matching
  async getMerchantsByLocation(locationId: string): Promise<string[]> {
    const key = `location:${locationId}`;
    const merchants = await this.client.sMembers(key);
    return merchants;
  }

  async addMerchantToLocation(locationId: string, merchantId: string): Promise<void> {
    const key = `location:${locationId}`;
    await this.client.sAdd(key, merchantId);
  }

  async removeMerchantFromLocation(locationId: string, merchantId: string): Promise<void> {
    const key = `location:${locationId}`;
    await this.client.sRem(key, merchantId);
  }

  // Redis set intersection for matching
  async getMerchantsByCategoryAndLocation(categoryId: string, locationId: string): Promise<string[]> {
    const categoryKey = `category:${categoryId}`;
    const locationKey = `location:${locationId}`;
    
    const merchants = await this.client.sInter([categoryKey, locationKey]);
    return merchants;
  }

  // Merchant status cache
  async getMerchantStatus(merchantId: string): Promise<any> {
    const key = `merchant:status:${merchantId}`;
    const status = await this.client.get(key);
    return status ? JSON.parse(status) : null;
  }

  async setMerchantStatus(merchantId: string, status: any): Promise<void> {
    const key = `merchant:status:${merchantId}`;
    await this.client.setEx(key, 3600, JSON.stringify(status)); // 1 hour TTL
  }

  async updateMerchantStatus(merchantId: string, updates: Partial<any>): Promise<void> {
    const key = `merchant:status:${merchantId}`;
    const existing = await this.getMerchantStatus(merchantId);
    
    if (existing) {
      const updated = { ...existing, ...updates };
      await this.setMerchantStatus(merchantId, updated);
    }
  }

  async removeMerchantStatus(merchantId: string): Promise<void> {
    const key = `merchant:status:${merchantId}`;
    await this.client.del(key);
  }

  // Merchant cooldown tracking
  async isMerchantOnCooldown(merchantId: string): Promise<boolean> {
    const key = `merchant:cooldown:${merchantId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async setMerchantCooldown(merchantId: string, minutes: number = 5): Promise<void> {
    const key = `merchant:cooldown:${merchantId}`;
    await this.client.setEx(key, minutes * 60, '1');
  }

  // Match deduplication
  async isRequestMatched(requestId: string): Promise<boolean> {
    const key = `request:matched:${requestId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async markRequestMatched(requestId: string): Promise<void> {
    const key = `request:matched:${requestId}`;
    await this.client.setEx(key, 86400, '1'); // 24 hours TTL
  }

  // Performance metrics
  async incrementCounter(counter: string): Promise<number> {
    const key = `metrics:${counter}`;
    return await this.client.incr(key);
  }

  async setGauge(gauge: string, value: number): Promise<void> {
    const key = `metrics:${gauge}`;
    await this.client.set(key, value);
  }

  async recordLatency(operation: string, latencyMs: number): Promise<void> {
    const key = `latency:${operation}`;
    await this.client.lPush(key, latencyMs.toString());
    await this.client.lTrim(key, 0, 999); // Keep last 1000 measurements
  }

  async getAverageLatency(operation: string): Promise<number> {
    const key = `latency:${operation}`;
    const values = await this.client.lRange(key, 0, -1);
    
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc: number, val: string) => acc + parseFloat(val), 0);
    return sum / values.length;
  }

  // Cache management
  async clearCategoryCache(categoryId: string): Promise<void> {
    const key = `category:${categoryId}`;
    await this.client.del(key);
  }

  async clearLocationCache(locationId: string): Promise<void> {
    const key = `location:${locationId}`;
    await this.client.del(key);
  }

  async rebuildCategoryCache(categoryId: string, merchantIds: string[]): Promise<void> {
    const key = `category:${categoryId}`;
    await this.client.del(key);
    
    if (merchantIds.length > 0) {
      await this.client.sAdd(key, merchantIds);
    }
  }

  async rebuildLocationCache(locationId: string, merchantIds: string[]): Promise<void> {
    const key = `location:${locationId}`;
    await this.client.del(key);
    
    if (merchantIds.length > 0) {
      await this.client.sAdd(key, merchantIds);
    }
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

  // Batch operations for performance
  async batchAddMerchantsToCategory(categoryId: string, merchantIds: string[]): Promise<void> {
    const key = `category:${categoryId}`;
    if (merchantIds.length > 0) {
      await this.client.sAdd(key, merchantIds);
    }
  }

  async batchAddMerchantsToLocation(locationId: string, merchantIds: string[]): Promise<void> {
    const key = `location:${locationId}`;
    if (merchantIds.length > 0) {
      await this.client.sAdd(key, merchantIds);
    }
  }

  async batchGetMerchantStatuses(merchantIds: string[]): Promise<Map<string, any>> {
    const promises = merchantIds.map(async (id) => {
      const status = await this.getMerchantStatus(id);
      return [id, status];
    });

    const results = await Promise.all(promises);
    return new Map(results as [string, any][]);
  }
}
