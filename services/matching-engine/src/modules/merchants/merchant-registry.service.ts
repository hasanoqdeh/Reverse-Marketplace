import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { MerchantInterest } from '../../common/entities/merchant-interest.entity';
import { MerchantCoverageArea } from '../../common/entities/merchant-coverage-area.entity';
import { MerchantStatusCache } from '../../common/entities/merchant-status-cache.entity';

@Injectable()
export class MerchantRegistryService {
  constructor(
    @InjectRepository(MerchantInterest)
    private readonly merchantInterestRepository: Repository<MerchantInterest>,
    @InjectRepository(MerchantCoverageArea)
    private readonly merchantCoverageAreaRepository: Repository<MerchantCoverageArea>,
    @InjectRepository(MerchantStatusCache)
    private readonly merchantStatusCacheRepository: Repository<MerchantStatusCache>,
    private readonly redisService: RedisService,
  ) {}

  // Merchant Interest Registry
  async addMerchantInterest(merchantId: string, categoryId: string): Promise<void> {
    // Save to database
    const interest = this.merchantInterestRepository.create({
      merchantId,
      categoryId,
    });
    await this.merchantInterestRepository.save(interest);

    // Update Redis cache
    await this.redisService.addMerchantToCategory(categoryId, merchantId);
  }

  async removeMerchantInterest(merchantId: string, categoryId: string): Promise<void> {
    // Remove from database
    await this.merchantInterestRepository.delete({
      merchantId,
      categoryId,
    });

    // Update Redis cache
    await this.redisService.removeMerchantFromCategory(categoryId, merchantId);
  }

  async getMerchantInterests(merchantId: string): Promise<string[]> {
    const interests = await this.merchantInterestRepository.find({
      where: { merchantId },
    });
    return interests.map(interest => interest.categoryId);
  }

  async getMerchantsByCategory(categoryId: string): Promise<string[]> {
    // Try Redis first for performance
    let merchants = await this.redisService.getMerchantsByCategory(categoryId);
    
    if (merchants.length === 0) {
      // Fallback to database if Redis is empty
      const interests = await this.merchantInterestRepository.find({
        where: { categoryId },
      });
      merchants = interests.map(interest => interest.merchantId);
      
      // Rebuild Redis cache
      await this.redisService.rebuildCategoryCache(categoryId, merchants);
    }
    
    return merchants;
  }

  // Merchant Coverage Areas
  async addMerchantCoverageArea(
    merchantId: string,
    locationId: string,
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<void> {
    // Save to database
    const coverageArea = this.merchantCoverageAreaRepository.create({
      merchantId,
      locationId,
      latitude,
      longitude,
      radiusKm,
    });
    await this.merchantCoverageAreaRepository.save(coverageArea);

    // Update Redis cache
    await this.redisService.addMerchantToLocation(locationId, merchantId);
  }

  async removeMerchantCoverageArea(merchantId: string, locationId: string): Promise<void> {
    // Remove from database
    await this.merchantCoverageAreaRepository.delete({
      merchantId,
      locationId,
    });

    // Update Redis cache
    await this.redisService.removeMerchantFromLocation(locationId, merchantId);
  }

  async getMerchantCoverageAreas(merchantId: string): Promise<MerchantCoverageArea[]> {
    return await this.merchantCoverageAreaRepository.find({
      where: { merchantId },
    });
  }

  async getMerchantsByLocation(locationId: string): Promise<string[]> {
    // Try Redis first for performance
    let merchants = await this.redisService.getMerchantsByLocation(locationId);
    
    if (merchants.length === 0) {
      // Fallback to database if Redis is empty
      const coverageAreas = await this.merchantCoverageAreaRepository.find({
        where: { locationId },
      });
      merchants = coverageAreas.map(area => area.merchantId);
      
      // Rebuild Redis cache
      await this.redisService.rebuildLocationCache(locationId, merchants);
    }
    
    return merchants;
  }

  // Geo-based merchant search with PostGIS
  async getMerchantsWithinRadius(
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<string[]> {
    const query = `
      SELECT DISTINCT merchant_id
      FROM merchant_coverage_areas
      WHERE ST_DWithin(
        geography(ST_MakePoint(longitude, latitude)),
        geography(ST_MakePoint($1, $2)),
        $3 * 1000
      )
    `;

    const result = await this.merchantCoverageAreaRepository.query(query, [
      longitude,
      latitude,
      radiusKm,
    ]);

    return result.map((row: any) => row.merchant_id);
  }

  // Merchant Status Management
  async updateMerchantStatus(
    merchantId: string,
    status: {
      isOnline?: boolean;
      isVerified?: boolean;
      isBanned?: boolean;
      trustScore?: number;
      lastSeen?: Date;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    // Update database
    await this.merchantStatusCacheRepository.upsert(
      {
        merchantId,
        ...status,
      },
      ['merchantId'],
    );

    // Update Redis cache
    await this.redisService.updateMerchantStatus(merchantId, status);
  }

  async getMerchantStatus(merchantId: string): Promise<MerchantStatusCache | null> {
    // Try Redis first for performance
    const cachedStatus = await this.redisService.getMerchantStatus(merchantId);
    
    if (cachedStatus) {
      return cachedStatus;
    }

    // Fallback to database
    const status = await this.merchantStatusCacheRepository.findOne({
      where: { merchantId },
    });

    if (status) {
      // Update Redis cache
      await this.redisService.setMerchantStatus(merchantId, status);
    }

    return status;
  }

  async getEligibleMerchants(
    categoryId: string,
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<string[]> {
    // Get merchants by category
    const categoryMerchants = await this.getMerchantsByCategory(categoryId);
    
    if (categoryMerchants.length === 0) {
      return [];
    }

    // Get merchants within geographic radius
    const geoMerchants = await this.getMerchantsWithinRadius(
      latitude,
      longitude,
      radiusKm,
    );

    // Find intersection (merchants who match both category and location)
    const eligibleMerchants = categoryMerchants.filter(merchantId =>
      geoMerchants.includes(merchantId),
    );

    // Filter by status (online, verified, not banned, trust score)
    const statusMap = await this.redisService.batchGetMerchantStatuses(eligibleMerchants);
    const finalMerchants = eligibleMerchants.filter(merchantId => {
      const status = statusMap.get(merchantId);
      return (
        status &&
        status.isOnline &&
        status.isVerified &&
        !status.isBanned &&
        status.trustScore >= 3.5 // Configurable threshold
      );
    });

    return finalMerchants;
  }

  // Redis Synchronization
  async syncMerchantToRedis(merchantId: string): Promise<void> {
    // Sync interests
    const interests = await this.getMerchantInterests(merchantId);
    for (const categoryId of interests) {
      await this.redisService.addMerchantToCategory(categoryId, merchantId);
    }

    // Sync coverage areas
    const coverageAreas = await this.getMerchantCoverageAreas(merchantId);
    for (const area of coverageAreas) {
      if (area.locationId) {
        await this.redisService.addMerchantToLocation(area.locationId, merchantId);
      }
    }

    // Sync status
    const status = await this.getMerchantStatus(merchantId);
    if (status) {
      await this.redisService.setMerchantStatus(merchantId, status);
    }
  }

  async removeMerchantFromRedis(merchantId: string): Promise<void> {
    // Get merchant data to clean up
    const interests = await this.getMerchantInterests(merchantId);
    const coverageAreas = await this.getMerchantCoverageAreas(merchantId);

    // Remove from categories
    for (const categoryId of interests) {
      await this.redisService.removeMerchantFromCategory(categoryId, merchantId);
    }

    // Remove from locations
    for (const area of coverageAreas) {
      if (area.locationId) {
        await this.redisService.removeMerchantFromLocation(area.locationId, merchantId);
      }
    }

    // Remove status
    await this.redisService.removeMerchantStatus(merchantId);
  }

  // Full Redis Rebuild
  async rebuildRedisCache(): Promise<void> {
    console.log('Starting full Redis cache rebuild...');

    // Clear existing cache
    // This would need to be implemented based on your Redis key pattern

    // Rebuild categories
    const allInterests = await this.merchantInterestRepository.find();
    const categoryMap = new Map<string, string[]>();
    
    allInterests.forEach(interest => {
      if (!categoryMap.has(interest.categoryId)) {
        categoryMap.set(interest.categoryId, []);
      }
      categoryMap.get(interest.categoryId)!.push(interest.merchantId);
    });

    for (const [categoryId, merchants] of Array.from(categoryMap.entries())) {
      await this.redisService.rebuildCategoryCache(categoryId, merchants);
    }

    // Rebuild locations
    const allCoverageAreas = await this.merchantCoverageAreaRepository.find();
    const locationMap = new Map<string, string[]>();
    
    allCoverageAreas.forEach(area => {
      if (area.locationId) {
        if (!locationMap.has(area.locationId)) {
          locationMap.set(area.locationId, []);
        }
        locationMap.get(area.locationId)!.push(area.merchantId);
      }
    });

    for (const [locationId, merchants] of Array.from(locationMap.entries())) {
      await this.redisService.rebuildLocationCache(locationId, merchants);
    }

    // Rebuild statuses
    const allStatuses = await this.merchantStatusCacheRepository.find();
    for (const status of allStatuses) {
      await this.redisService.setMerchantStatus(status.merchantId, status);
    }

    console.log('Redis cache rebuild completed');
  }
}
