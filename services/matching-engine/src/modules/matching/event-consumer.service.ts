import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { MatchingService } from './matching.service';
import { MerchantRegistryService } from '../merchants/merchant-registry.service';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly matchingService: MatchingService,
    private readonly merchantRegistryService: MerchantRegistryService,
  ) {}

  async onModuleInit() {
    await this.setupEventConsumers();
  }

  private async setupEventConsumers(): Promise<void> {
    // Consume request.created events
    await this.rabbitMQService.consumeEvents(
      'matching-engine.requests',
      ['request.created'],
      async (event: DomainEvent) => {
        await this.handleRequestCreated(event);
      },
    );

    // Consume merchant profile update events
    await this.rabbitMQService.consumeEvents(
      'matching-engine.merchants',
      ['merchant.profile.updated', 'merchant.verified', 'merchant.availability.updated'],
      async (event: DomainEvent) => {
        await this.handleMerchantUpdate(event);
      },
    );

    // Consume user ban events
    await this.rabbitMQService.consumeEvents(
      'matching-engine.users',
      ['user.banned'],
      async (event: DomainEvent) => {
        await this.handleUserBanned(event);
      },
    );

    console.log('Event consumers setup completed for Matching Engine');
  }

  private async handleRequestCreated(event: DomainEvent): Promise<void> {
    console.log(`Processing request.created event: ${event.aggregateId}`);
    
    try {
      await this.matchingService.processRequestEvent(event);
    } catch (error) {
      console.error(`Error processing request.created event: ${event.aggregateId}`, error);
      throw error; // Re-queue for retry
    }
  }

  private async handleMerchantUpdate(event: DomainEvent): Promise<void> {
    console.log(`Processing merchant update event: ${event.eventType} for merchant: ${event.aggregateId}`);
    
    try {
      const merchantId = event.aggregateId;
      
      switch (event.eventType) {
        case 'merchant.profile.updated':
          await this.handleMerchantProfileUpdated(merchantId, event.data);
          break;
        case 'merchant.verified':
          await this.handleMerchantVerified(merchantId, event.data);
          break;
        case 'merchant.availability.updated':
          await this.handleMerchantAvailabilityUpdated(merchantId, event.data);
          break;
      }
    } catch (error) {
      console.error(`Error processing merchant update event: ${event.aggregateId}`, error);
      // Don't re-queue merchant updates as they're not critical
    }
  }

  private async handleMerchantProfileUpdated(merchantId: string, data: any): Promise<void> {
    // Update merchant status in cache
    await this.merchantRegistryService.updateMerchantStatus(merchantId, {
      trustScore: data.trustScore,
      metadata: data.metadata,
    });

    // Sync to Redis if needed
    await this.merchantRegistryService.syncMerchantToRedis(merchantId);
  }

  private async handleMerchantVerified(merchantId: string, data: any): Promise<void> {
    // Update merchant verification status
    await this.merchantRegistryService.updateMerchantStatus(merchantId, {
      isVerified: data.verified,
      lastSeen: new Date(),
    });

    // Sync to Redis
    await this.merchantRegistryService.syncMerchantToRedis(merchantId);
  }

  private async handleMerchantAvailabilityUpdated(merchantId: string, data: any): Promise<void> {
    // Update merchant online status
    await this.merchantRegistryService.updateMerchantStatus(merchantId, {
      isOnline: data.isOnline,
      lastSeen: new Date(),
    });

    // Update Redis cache
    await this.merchantRegistryService.updateMerchantStatus(merchantId, {
      isOnline: data.isOnline,
    });
  }

  private async handleUserBanned(event: DomainEvent): Promise<void> {
    console.log(`Processing user.banned event: ${event.aggregateId}`);
    
    try {
      const userId = event.aggregateId;
      
      // Remove merchant from matching system if they're banned
      await this.merchantRegistryService.removeMerchantFromRedis(userId);
      
      // Update merchant status to banned
      await this.merchantRegistryService.updateMerchantStatus(userId, {
        isBanned: true,
        isOnline: false,
      });
      
      console.log(`Banned user ${userId} removed from matching system`);
    } catch (error) {
      console.error(`Error processing user.banned event: ${event.aggregateId}`, error);
      // Don't re-queue ban events as they're administrative
    }
  }
}
