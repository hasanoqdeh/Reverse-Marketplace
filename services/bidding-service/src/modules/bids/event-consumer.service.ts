import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { BidService } from './bid.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { BidStatus } from '../../infrastructure/mongodb/schemas/bid.schema';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly bidService: BidService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.setupEventConsumers();
  }

  private async setupEventConsumers(): Promise<void> {
    // Consume request events
    await this.rabbitMQService.consumeEvents(
      'bidding-service.requests',
      [
        'request.created',
        'request.completed',
        'request.cancelled',
        'request.closed',
      ],
      async (event: DomainEvent) => {
        await this.handleRequestEvent(event);
      },
    );

    // Consume merchant events
    await this.rabbitMQService.consumeEvents(
      'bidding-service.merchants',
      [
        'merchant.match.failed',
        'user.banned',
      ],
      async (event: DomainEvent) => {
        await this.handleMerchantEvent(event);
      },
    );

    console.log('Event consumers setup completed for Bidding Service');
  }

  private async handleRequestEvent(event: DomainEvent): Promise<void> {
    console.log(`Processing request event: ${event.eventType} for request: ${event.aggregateId}`);
    
    try {
      const requestId = event.aggregateId;
      
      switch (event.eventType) {
        case 'request.created':
          await this.handleRequestCreated(requestId, event.data);
          break;
        case 'request.completed':
          await this.handleRequestCompleted(requestId);
          break;
        case 'request.cancelled':
          await this.handleRequestCancelled(requestId);
          break;
        case 'request.closed':
          await this.handleRequestClosed(requestId);
          break;
      }
    } catch (error) {
      console.error(`Error processing request event: ${event.aggregateId}`, error);
      // Don't re-queue request events as they're administrative
    }
  }

  private async handleMerchantEvent(event: DomainEvent): Promise<void> {
    console.log(`Processing merchant event: ${event.eventType} for merchant: ${event.aggregateId}`);
    
    try {
      const merchantId = event.aggregateId;
      
      switch (event.eventType) {
        case 'merchant.match.failed':
          await this.handleMerchantMatchFailed(merchantId, event.data);
          break;
        case 'user.banned':
          await this.handleUserBanned(merchantId);
          break;
      }
    } catch (error) {
      console.error(`Error processing merchant event: ${event.aggregateId}`, error);
      // Don't re-queue merchant events as they're administrative
    }
  }

  private async handleRequestCreated(requestId: string, data: any): Promise<void> {
    // Cache request status for bid validation
    await this.redisService.cacheRequestStatus(requestId, 'ACTIVE');
    
    // Initialize bid count counter
    await this.redisService.incrementRequestBidCount(requestId);
    
    console.log(`Request ${requestId} initialized for bidding`);
  }

  private async handleRequestCompleted(requestId: string): Promise<void> {
    // Update request status to prevent new bids
    await this.redisService.cacheRequestStatus(requestId, 'COMPLETED');
    
    // Auto-reject all pending bids for this request
    // This would typically involve querying the bid service
    // For now, we'll just update the cache status
    
    console.log(`Request ${requestId} marked as completed - no new bids allowed`);
  }

  private async handleRequestCancelled(requestId: string): Promise<void> {
    // Update request status to prevent new bids
    await this.redisService.cacheRequestStatus(requestId, 'CANCELLED');
    
    // Auto-reject all pending bids for this request
    // This would typically involve querying the bid service
    
    console.log(`Request ${requestId} marked as cancelled - no new bids allowed`);
  }

  private async handleRequestClosed(requestId: string): Promise<void> {
    // Update request status to prevent new bids
    await this.redisService.cacheRequestStatus(requestId, 'CLOSED');
    
    // Auto-reject all pending bids for this request
    // This would typically involve querying the bid service
    
    console.log(`Request ${requestId} marked as closed - no new bids allowed`);
  }

  private async handleMerchantMatchFailed(merchantId: string, data: any): Promise<void> {
    // This event indicates a merchant failed to match with a request
    // Could be used for analytics or to update merchant performance metrics
    console.log(`Merchant ${merchantId} failed to match with request: ${data.requestId}`);
    
    // Could update merchant performance metrics here
    // For now, we'll just log the event
  }

  private async handleUserBanned(userId: string): Promise<void> {
    // If a user is banned, we need to handle their active bids
    // This would typically involve:
    // 1. Withdrawing all active bids if they're a merchant
    // 2. Marking their requests as closed if they're a buyer
    
    console.log(`User ${userId} banned - handling active bids`);
    
    // This would involve querying the bid service to find and handle active bids
    // For now, we'll just log the event
  }
}
