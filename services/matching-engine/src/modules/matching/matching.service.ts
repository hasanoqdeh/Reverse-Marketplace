import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { MerchantRegistryService } from '../merchants/merchant-registry.service';
import { MatchLog } from '../../common/entities/match-log.entity';
import { DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';

export interface MatchRequest {
  requestId: string;
  buyerId: string;
  categoryId: string;
  locationId?: string;
  latitude: number;
  longitude: number;
  publishedAt: string;
}

export interface MatchResult {
  requestId: string;
  buyerId: string;
  merchants: Array<{
    merchantId: string;
    score: number;
    distance?: number;
    trustScore: number;
  }>;
  latencyMs: number;
  totalCandidates: number;
  eligibleCandidates: number;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(MatchLog)
    private readonly matchLogRepository: Repository<MatchLog>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly merchantRegistryService: MerchantRegistryService,
    private readonly configService: ConfigService,
  ) {}

  async processRequestEvent(event: DomainEvent): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if request already processed (idempotency)
      if (await this.redisService.isRequestMatched(event.aggregateId)) {
        console.log(`Request ${event.aggregateId} already processed, skipping`);
        return;
      }

      const matchRequest: MatchRequest = {
        requestId: event.aggregateId,
        buyerId: event.data.buyerId,
        categoryId: event.data.categoryId,
        locationId: event.data.locationId,
        latitude: event.data.latitude || 0,
        longitude: event.data.longitude || 0,
        publishedAt: event.data.publishedAt,
      };

      // Perform matching
      const result = await this.performMatching(matchRequest, startTime);

      // Log the match
      await this.logMatch(matchRequest, result);

      // Publish appropriate event
      await this.publishMatchEvent(result);

      // Mark request as processed
      await this.redisService.markRequestMatched(event.aggregateId);

      console.log(`Matching completed for request ${event.aggregateId}: ${result.merchants.length} merchants matched`);
    } catch (error) {
      console.error(`Error processing request ${event.aggregateId}:`, error);
      
      // Publish failure event
      await this.rabbitMQService.publishMerchantMatchFailed(
        event.aggregateId,
        event.data.buyerId,
        error.message,
      );
    }
  }

  private async performMatching(request: MatchRequest, startTime: number): Promise<MatchResult> {
    const radiusKm = this.configService.get('matching.geoRadiusKm', 50);
    const maxMerchants = this.configService.get('matching.maxMerchantsPerRequest', 50);
    
    // Get eligible merchants
    const eligibleMerchants = await this.merchantRegistryService.getEligibleMerchants(
      request.categoryId,
      request.latitude,
      request.longitude,
      radiusKm,
    );

    // Filter merchants on cooldown
    const availableMerchants = [];
    for (const merchantId of eligibleMerchants) {
      const isOnCooldown = await this.redisService.isMerchantOnCooldown(merchantId);
      if (!isOnCooldown) {
        availableMerchants.push(merchantId);
      }
    }

    // Score and rank merchants
    const scoredMerchants = await this.scoreMerchants(
      availableMerchants,
      request.latitude,
      request.longitude,
    );

    // Sort by score (descending) and limit
    scoredMerchants.sort((a, b) => b.score - a.score);
    const finalMerchants = scoredMerchants.slice(0, maxMerchants);

    // Set cooldown for matched merchants
    const cooldownMinutes = this.configService.get('matching.merchantCooldownMinutes', 5);
    for (const merchant of finalMerchants) {
      await this.redisService.setMerchantCooldown(merchant.merchantId, cooldownMinutes);
    }

    const latency = Date.now() - startTime;

    return {
      requestId: request.requestId,
      buyerId: request.buyerId,
      merchants: finalMerchants,
      latencyMs: latency,
      totalCandidates: eligibleMerchants.length,
      eligibleCandidates: availableMerchants.length,
    };
  }

  private async scoreMerchants(
    merchantIds: string[],
    requestLatitude: number,
    requestLongitude: number,
  ): Promise<Array<{ merchantId: string; score: number; distance?: number; trustScore: number }>> {
    const scoredMerchants = [];

    for (const merchantId of merchantIds) {
      const score = await this.calculateMerchantScore(merchantId, requestLatitude, requestLongitude);
      scoredMerchants.push(score);
    }

    return scoredMerchants;
  }

  private async calculateMerchantScore(
    merchantId: string,
    requestLatitude: number,
    requestLongitude: number,
  ): Promise<{ merchantId: string; score: number; distance?: number; trustScore: number }> {
    const status = await this.merchantRegistryService.getMerchantStatus(merchantId);
    const coverageAreas = await this.merchantRegistryService.getMerchantCoverageAreas(merchantId);

    let score = 0;
    let distance: number | undefined;

    // Distance scoring (40% weight)
    if (coverageAreas.length > 0) {
      const nearestArea = this.findNearestCoverageArea(
        coverageAreas,
        requestLatitude,
        requestLongitude,
      );
      
      if (nearestArea) {
        distance = this.calculateDistance(
          requestLatitude,
          requestLongitude,
          nearestArea.latitude,
          nearestArea.longitude,
        );
        
        // Score based on distance (closer = higher score)
        const maxDistance = 50; // km
        const distanceScore = Math.max(0, 100 - (distance / maxDistance) * 100);
        score += distanceScore * 0.4;
      }
    }

    // Trust score scoring (30% weight)
    if (status && status.trustScore) {
      const trustScore = Math.min(5, Math.max(0, status.trustScore));
      const trustScoreNormalized = (trustScore / 5) * 100;
      score += trustScoreNormalized * 0.3;
    }

    // Online status scoring (20% weight)
    if (status && status.isOnline) {
      score += 100 * 0.2;
    }

    // Response speed (10% weight) - this would come from historical data
    // For now, we'll use a random factor to simulate
    const responseSpeed = Math.random() * 100;
    score += responseSpeed * 0.1;

    return {
      merchantId,
      score: Math.round(score),
      distance,
      trustScore: status?.trustScore || 0,
    };
  }

  private findNearestCoverageArea(
    coverageAreas: any[],
    requestLatitude: number,
    requestLongitude: number,
  ): any {
    let nearestArea = null;
    let minDistance = Infinity;

    for (const area of coverageAreas) {
      const distance = this.calculateDistance(
        requestLatitude,
        requestLongitude,
        area.latitude,
        area.longitude,
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestArea = area;
      }
    }

    return nearestArea;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private async logMatch(request: MatchRequest, result: MatchResult): Promise<void> {
    const matchLog = this.matchLogRepository.create({
      requestId: request.requestId,
      matchedMerchants: result.merchants,
      latencyMs: result.latencyMs,
      totalCandidates: result.totalCandidates,
      eligibleCandidates: result.eligibleCandidates,
      filters: {
        categoryId: request.categoryId,
        location: request.locationId ? {
          latitude: request.latitude,
          longitude: request.longitude,
          radiusKm: this.configService.get('matching.geoRadiusKm', 50),
        } : undefined,
        minTrustScore: this.configService.get('matching.minTrustScore', 3.5),
      },
    });

    await this.matchLogRepository.save(matchLog);

    // Record metrics
    await this.redisService.incrementCounter('matches.total');
    await this.redisService.recordLatency('matching', result.latencyMs);
  }

  private async publishMatchEvent(result: MatchResult): Promise<void> {
    if (result.merchants.length === 0) {
      // No merchants found
      await this.rabbitMQService.publishMerchantMatchFailed(
        result.requestId,
        result.buyerId,
        'No eligible merchants found',
      );
    } else if (result.merchants.length < 10) {
      // Partial match
      await this.rabbitMQService.publishMerchantMatchPartial(
        result.requestId,
        result.buyerId,
        result.merchants,
        `Limited merchant availability: ${result.merchants.length} merchants found`,
      );
    } else {
      // Good match
      await this.rabbitMQService.publishMatchFound(
        result.requestId,
        result.buyerId,
        result.merchants,
      );
    }
  }

  // Health check for matching service
  async healthCheck(): Promise<{ status: string; metrics: any }> {
    const redisHealth = await this.redisService.healthCheck();
    const rabbitmqHealth = await this.rabbitMQService.healthCheck();
    
    const avgLatency = await this.redisService.getAverageLatency('matching');
    const totalMatches = await this.redisService.incrementCounter('health.check');

    return {
      status: redisHealth.status === 'healthy' && rabbitmqHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      metrics: {
        redisLatency: redisHealth.latency,
        averageMatchingLatency: avgLatency,
        totalMatches,
        rabbitmqQueues: rabbitmqHealth.queues,
      },
    };
  }
}
