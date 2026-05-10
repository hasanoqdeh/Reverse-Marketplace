import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { WalletService } from './wallet.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { TransactionType } from '../../common/entities/wallet.entity';

@Injectable()
export class WalletEventConsumerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly walletService: WalletService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    // Setup event consumers for different marketplace events
    
    // User events
    await this.rabbitMQService.consumeEvents(
      'payment-user-registered',
      ['user.registered'],
      this.handleUserRegistered.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'payment-user-banned',
      ['user.banned'],
      this.handleUserBanned.bind(this),
    );

    // Bid events
    await this.rabbitMQService.consumeEvents(
      'payment-bid-submitted',
      ['bid.submitted'],
      this.handleBidSubmitted.bind(this),
    );

    await this.rabbitMQService.consumeEvents(
      'payment-bid-accepted',
      ['bid.accepted'],
      this.handleBidAccepted.bind(this),
    );

    // Request events
    await this.rabbitMQService.consumeEvents(
      'payment-request-completed',
      ['request.completed'],
      this.handleRequestCompleted.bind(this),
    );

    console.log('Payment Service event consumers initialized');
  }

  private async handleUserRegistered(event: DomainEvent): Promise<void> {
    try {
      const { userId, email, role } = event.data;
      
      console.log(`Processing user.registered event for user ${userId}`);

      // Auto-create wallet for new users
      await this.walletService.createWallet({
        user_id: userId,
        currency: 'SAR',
      });

      console.log(`Successfully created wallet for user ${userId}`);
    } catch (error) {
      console.error('Error handling user.registered event:', error);
    }
  }

  private async handleUserBanned(event: DomainEvent): Promise<void> {
    try {
      const { userId, reason, bannedBy } = event.data;
      
      console.log(`Processing user.banned event for user ${userId}`);

      // Freeze wallet for banned users
      await this.walletService.freezeWallet(userId, reason || 'User banned');

      console.log(`Successfully froze wallet for banned user ${userId}`);
    } catch (error) {
      console.error('Error handling user.banned event:', error);
    }
  }

  private async handleBidSubmitted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, merchantId, bidAmount, categoryId } = event.data;
      
      console.log(`Processing bid.submitted event for bid on request ${requestId}`);

      // Get bid fee configuration based on category
      const bidFee = await this.getBidFeeForCategory(categoryId);

      // Check if merchant has sufficient balance
      const hasSufficientBalance = await this.walletService.validateSufficientBalance(
        merchantId,
        bidFee
      );

      if (!hasSufficientBalance) {
        console.log(`Merchant ${merchantId} has insufficient balance for bid fee: ${bidFee}`);
        
        // Publish insufficient balance event
        const insufficientBalanceEvent = this.rabbitMQService.createDomainEvent(
          'payment.insufficient_balance',
          merchantId,
          {
            requestId,
            bidAmount,
            requiredFee: bidFee,
            currentBalance: await this.walletService.getWalletBalance(merchantId),
          }
        );
        await this.rabbitMQService.publishEvent('payment.insufficient_balance', insufficientBalanceEvent);
        return;
      }

      // Deduct bid fee from merchant wallet
      const transaction = await this.walletService.createTransaction({
        user_id: merchantId,
        type: TransactionType.BID_FEE,
        amount: bidFee,
        description: `Bid fee for request ${requestId}`,
        reference_id: requestId,
        reference_type: 'request',
        metadata: {
          bidAmount,
          categoryId,
          requestId,
        },
      });

      console.log(`Successfully deducted bid fee ${bidFee} from merchant ${merchantId}`);

      // Publish fee deducted event
      const feeDeductedEvent = this.rabbitMQService.createDomainEvent(
        'payment.bid_fee_deducted',
        transaction.id,
        {
          merchantId,
          requestId,
          bidAmount,
          fee: bidFee,
          transactionId: transaction.id,
        }
      );
      await this.rabbitMQService.publishEvent('payment.bid_fee_deducted', feeDeductedEvent);

    } catch (error) {
      console.error('Error handling bid.submitted event:', error);
    }
  }

  private async handleBidAccepted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, bidAmount } = event.data;
      
      console.log(`Processing bid.accepted event for request ${requestId}`);

      // This could trigger subscription validation or other business logic
      // For now, we'll just log the event
      console.log(`Bid accepted for request ${requestId} - merchant ${merchantId}, buyer ${buyerId}`);

      // Publish payment processing event
      const paymentProcessingEvent = this.rabbitMQService.createDomainEvent(
        'payment.processing_started',
        requestId,
        {
          buyerId,
          merchantId,
          bidAmount,
          requestId,
        }
      );
      await this.rabbitMQService.publishEvent('payment.processing_started', paymentProcessingEvent);

    } catch (error) {
      console.error('Error handling bid.accepted event:', error);
    }
  }

  private async handleRequestCompleted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId, finalAmount } = event.data;
      
      console.log(`Processing request.completed event for request ${requestId}`);

      // This could trigger payment release to merchant
      // For now, we'll just log the event
      console.log(`Request completed - payment to be released to merchant ${merchantId}`);

      // TODO: Implement payment release logic when escrow is implemented
      // This would involve moving money from platform escrow to merchant wallet

    } catch (error) {
      console.error('Error handling request.completed event:', error);
    }
  }

  private async getBidFeeForCategory(categoryId: string): Promise<number> {
    // TODO: Implement category-based bid fee configuration
    // For now, return a default fee
    const defaultFee = parseFloat(process.env.DEFAULT_BID_FEE || '2.00');
    
    // Try to get from cache first
    const cacheKey = `bid_fee:${categoryId}`;
    const cachedFee = await this.redisService.get(cacheKey);
    
    if (cachedFee) {
      return parseFloat(cachedFee);
    }

    // In a real implementation, this would fetch from database or configuration service
    const fee = defaultFee;
    
    // Cache for 1 hour
    await this.redisService.set(cacheKey, fee.toString(), 3600);
    
    return fee;
  }

  // Helper method to get Arabic notification titles and bodies based on type
  private getNotificationContent(type: string, data: any): { title: string; body: string } {
    const contentMap = {
      'insufficient_balance': {
        title: 'رصيد المحفظة غير كافٍ',
        body: 'رصيد محفظتك غير كافٍ لتقديم العرض. يرجى شحن المحفظة والمحاولة مرة أخرى.',
      },
      'bid_fee_deducted': {
        title: 'تم خصم رسوم العرض',
        body: `تم خصم رسوم العرض بنجاح من محفظتك.`,
      },
      'payment_completed': {
        title: 'تم إكمال الدفعة',
        body: 'تمت معالجة الدفعة بنجاح. شكراً لاستخدامك منصتنا.',
      },
      'payment_failed': {
        title: 'فشل الدفعة',
        body: 'فشلت معالجة الدفعة. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.',
      },
    };

    return contentMap[type] || {
      title: 'إشعار دفعة',
      body: 'لديك إشعار جديد بخصوص معاملة الدفع.',
    };
  }
}
