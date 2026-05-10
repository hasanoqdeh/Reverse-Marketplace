import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { Bid, BidStatus } from '../../infrastructure/mongodb/schemas/bid.schema';
import { BidStatusHistory } from '../../infrastructure/mongodb/schemas/bid-status-history.schema';
import { BidAnalytics } from '../../infrastructure/mongodb/schemas/bid-analytics.schema';

export interface CreateBidDto {
  requestId: string;
  price: number;
  currency: string;
  deliveryTime?: string;
  notes?: string;
}

export interface UpdateBidStatusDto {
  status: BidStatus;
  reason?: string;
}

@Injectable()
export class BidService {
  constructor(
    @InjectModel('Bid') private readonly bidModel: Model<Bid>,
    @InjectModel('BidStatusHistory') private readonly bidStatusHistoryModel: Model<BidStatusHistory>,
    @InjectModel('BidAnalytics') private readonly bidAnalyticsModel: Model<BidAnalytics>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  async createBid(createBidDto: CreateBidDto, merchantId: string, merchantTrustScore: number): Promise<Bid> {
    const { requestId, price, currency, deliveryTime, notes } = createBidDto;

    // Validate bid data
    await this.validateBidSubmission(requestId, merchantId, price, currency);

    // Check if merchant already has an active bid for this request
    const existingBid = await this.bidModel.findOne({
      requestId,
      merchantId,
      status: { $in: [BidStatus.PENDING, BidStatus.ACCEPTED] },
    });

    if (existingBid) {
      throw new Error('Merchant already has an active bid for this request');
    }

    // Create bid
    const bidExpiryHours = this.configService.get('bidding.bidExpiryHours', 24);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + bidExpiryHours);

    const bid = new this.bidModel({
      requestId,
      buyerId: await this.getBuyerIdFromRequest(requestId),
      merchantId,
      price,
      currency,
      deliveryTime,
      notes,
      status: BidStatus.PENDING,
      expiresAt,
      merchantTrustScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedBid = await bid.save();

    // Log status change
    await this.logStatusChange(savedBid._id.toString(), null, BidStatus.PENDING, merchantId);

    // Update caches and counters
    await this.redisService.cacheBid(savedBid._id.toString(), savedBid.toObject());
    await this.redisService.incrementRequestBidCount(requestId);
    await this.redisService.incrementMerchantActiveBidCount(merchantId);
    await this.redisService.markBidSubmitted(requestId, merchantId);
    await this.redisService.invalidateRequestBidsCache(requestId);

    // Record metrics
    await this.redisService.recordBidSubmission(merchantId);

    // Update analytics
    await this.updateBidAnalytics(requestId);

    // Publish event
    await this.rabbitMQService.publishBidSubmitted(
      savedBid._id.toString(),
      requestId,
      savedBid.buyerId,
      merchantId,
      price,
    );

    return savedBid;
  }

  async updateBidStatus(bidId: string, updateDto: UpdateBidStatusDto, changedBy: string): Promise<Bid> {
    const bid = await this.bidModel.findById(bidId);
    if (!bid) {
      throw new Error('Bid not found');
    }

    const { status, reason } = updateDto;

    // Validate status transition
    this.validateStatusTransition(bid.status, status);

    // Acquire lock for bid status update
    const lockKey = `bid_status_update:${bidId}`;
    const lockValue = await this.redisService.acquireLock(lockKey, 30);

    if (!lockValue) {
      throw new Error('Bid is currently being updated by another process');
    }

    try {
      const oldStatus = bid.status;
      bid.status = status;
      bid.updatedAt = new Date();

      await bid.save();

      // Log status change
      await this.logStatusChange(bidId, oldStatus, status, changedBy, reason);

      // Update caches
      await this.redisService.cacheBid(bidId, bid.toObject());
      await this.redisService.invalidateRequestBidsCache(bid.requestId);

      // Handle special status transitions
      if (status === BidStatus.ACCEPTED) {
        await this.handleBidAcceptance(bid, changedBy);
      } else if (status === BidStatus.REJECTED || status === BidStatus.WITHDRAWN) {
        await this.redisService.decrementMerchantActiveBidCount(bid.merchantId);
      }

      // Update analytics
      await this.updateBidAnalytics(bid.requestId);

      // Publish appropriate event
      await this.publishBidStatusEvent(bid, status, reason);

      return bid;
    } finally {
      await this.redisService.releaseLock(lockKey, lockValue);
    }
  }

  async getBidById(bidId: string): Promise<Bid | null> {
    // Try cache first
    const cachedBid = await this.redisService.getCachedBid(bidId);
    if (cachedBid) {
      return cachedBid;
    }

    const bid = await this.bidModel.findById(bidId);
    if (bid) {
      await this.redisService.cacheBid(bidId, bid.toObject());
    }

    return bid;
  }

  async getRequestBids(requestId: string, userId: string, userRole: string): Promise<Bid[]> {
    // Validate user access
    await this.validateRequestAccess(requestId, userId, userRole);

    // Try cache first
    const cachedBids = await this.redisService.getCachedRequestBids(requestId);
    if (cachedBids) {
      return cachedBids;
    }

    const bids = await this.bidModel
      .find({ requestId })
      .sort({ createdAt: -1 })
      .lean();

    // Cache the result
    await this.redisService.cacheRequestBids(requestId, bids);

    return bids;
  }

  async getMerchantBids(merchantId: string, status?: BidStatus, page = 1, limit = 20): Promise<{
    bids: Bid[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { merchantId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await this.bidModel.countDocuments(query);
    const bids = await this.bidModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      bids,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBidAnalytics(requestId: string): Promise<BidAnalytics | null> {
    // Try cache first
    const cachedAnalytics = await this.redisService.getCachedBidAnalytics(requestId);
    if (cachedAnalytics) {
      return cachedAnalytics;
    }

    const analytics = await this.bidAnalyticsModel.findOne({ requestId });
    if (analytics) {
      await this.redisService.cacheBidAnalytics(requestId, analytics.toObject());
    }

    return analytics;
  }

  async expireBids(): Promise<void> {
    const now = new Date();
    const expiredBids = await this.bidModel.find({
      status: BidStatus.PENDING,
      expiresAt: { $lt: now },
    });

    for (const bid of expiredBids) {
      await this.updateBidStatus(bid._id.toString(), {
        status: BidStatus.EXPIRED,
        reason: 'Bid expired automatically',
      }, 'system');
    }
  }

  private async validateBidSubmission(requestId: string, merchantId: string, price: number, currency: string): Promise<void> {
    // Check request status
    const requestStatus = await this.redisService.getCachedRequestStatus(requestId);
    if (requestStatus && requestStatus !== 'ACTIVE') {
      throw new Error(`Request is ${requestStatus} and cannot accept bids`);
    }

    // Validate price
    const minPrice = this.configService.get('bidding.minBidPrice', 0.01);
    const maxPrice = this.configService.get('bidding.maxBidPrice', 100000);
    const supportedCurrencies = this.configService.get('bidding.supportedCurrencies', ['OMR', 'USD', 'EUR']);

    if (price < minPrice || price > maxPrice) {
      throw new Error(`Price must be between ${minPrice} and ${maxPrice}`);
    }

    if (!supportedCurrencies.includes(currency)) {
      throw new Error(`Currency ${currency} is not supported`);
    }

    // Check rate limiting
    const rateLimitValid = await this.redisService.checkBidRateLimit(merchantId);
    if (!rateLimitValid) {
      throw new Error('Bid submission rate limit exceeded');
    }
  }

  private validateStatusTransition(currentStatus: BidStatus, newStatus: BidStatus): void {
    const validTransitions: Record<BidStatus, BidStatus[]> = {
      [BidStatus.PENDING]: [BidStatus.ACCEPTED, BidStatus.REJECTED, BidStatus.EXPIRED, BidStatus.WITHDRAWN],
      [BidStatus.ACCEPTED]: [], // Accepted bids cannot change status
      [BidStatus.REJECTED]: [], // Rejected bids cannot change status
      [BidStatus.EXPIRED]: [], // Expired bids cannot change status
      [BidStatus.WITHDRAWN]: [], // Withdrawn bids cannot change status
      [BidStatus.AUTO_REJECTED]: [], // Auto rejected bids cannot change status
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async logStatusChange(bidId: string, oldStatus: string | null, newStatus: string, changedBy: string, reason?: string): Promise<void> {
    const statusHistory = new this.bidStatusHistoryModel({
      bidId,
      oldStatus,
      newStatus,
      changedBy,
      changedAt: new Date(),
      reason,
    });

    await statusHistory.save();
  }

  private async handleBidAcceptance(bid: Bid, changedBy: string): Promise<void> {
    // Auto-reject other pending bids for the same request
    const otherBids = await this.bidModel.find({
      requestId: bid.requestId,
      status: BidStatus.PENDING,
      _id: { $ne: bid._id },
    });

    for (const otherBid of otherBids) {
      await this.updateBidStatus(otherBid._id.toString(), {
        status: BidStatus.AUTO_REJECTED,
        reason: 'Another bid was accepted',
      }, 'system');
    }

    // Record metrics
    await this.redisService.recordBidAcceptance(bid.merchantId);
  }

  private async publishBidStatusEvent(bid: Bid, status: BidStatus, reason?: string): Promise<void> {
    switch (status) {
      case BidStatus.ACCEPTED:
        await this.rabbitMQService.publishBidAccepted(
          bid._id.toString(),
          bid.requestId,
          bid.buyerId,
          bid.merchantId,
          parseFloat(bid.price.toString()),
        );
        break;
      case BidStatus.REJECTED:
        await this.rabbitMQService.publishBidRejected(
          bid._id.toString(),
          bid.requestId,
          bid.buyerId,
          bid.merchantId,
          reason || 'Rejected by buyer',
        );
        break;
      case BidStatus.EXPIRED:
        await this.rabbitMQService.publishBidExpired(
          bid._id.toString(),
          bid.requestId,
          bid.buyerId,
          bid.merchantId,
        );
        break;
      case BidStatus.WITHDRAWN:
        await this.rabbitMQService.publishBidWithdrawn(
          bid._id.toString(),
          bid.requestId,
          bid.buyerId,
          bid.merchantId,
        );
        break;
      case BidStatus.AUTO_REJECTED:
        await this.rabbitMQService.publishBidAutoRejected(
          bid._id.toString(),
          bid.requestId,
          bid.buyerId,
          bid.merchantId,
          reason || 'Auto rejected',
        );
        break;
    }
  }

  private async getBuyerIdFromRequest(requestId: string): Promise<string> {
    // This would typically call the Request Service or use cached data
    // For now, we'll use a placeholder implementation
    return 'buyer-placeholder';
  }

  private async validateRequestAccess(requestId: string, userId: string, userRole: string): Promise<void> {
    // This would validate that the user has access to the request
    // Buyers can only see bids for their own requests
    // Merchants can only see their own bids
    // Implementation would depend on the specific business rules
  }

  private async updateBidAnalytics(requestId: string): Promise<void> {
    const bids = await this.bidModel.find({ requestId });
    
    if (bids.length === 0) {
      return;
    }

    const prices = bids.map(bid => parseFloat(bid.price.toString()));
    const totalBids = bids.length;
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / totalBids;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const priceRange = highestPrice - lowestPrice;

    const bidDistribution = {
      pending: bids.filter(b => b.status === BidStatus.PENDING).length,
      accepted: bids.filter(b => b.status === BidStatus.ACCEPTED).length,
      rejected: bids.filter(b => b.status === BidStatus.REJECTED).length,
      expired: bids.filter(b => b.status === BidStatus.EXPIRED).length,
      withdrawn: bids.filter(b => b.status === BidStatus.WITHDRAWN).length,
      autoRejected: bids.filter(b => b.status === BidStatus.AUTO_REJECTED).length,
    };

    const topBids = bids
      .filter(b => b.status === BidStatus.PENDING)
      .sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()))
      .slice(0, 5)
      .map((bid, index) => ({
        bidId: bid._id.toString(),
        merchantId: bid.merchantId,
        price: parseFloat(bid.price.toString()),
        merchantTrustScore: bid.merchantTrustScore || 0,
        rank: index + 1,
      }));

    await this.bidAnalyticsModel.findOneAndUpdate(
      { requestId },
      {
        requestId,
        totalBids,
        avgPrice,
        lowestPrice,
        highestPrice,
        priceRange,
        currency: bids[0].currency,
        lastUpdated: new Date(),
        bidDistribution,
        topBids,
      },
      { upsert: true, new: true },
    );

    // Invalidate cache
    await this.redisService.cacheBidAnalytics(requestId, {
      requestId,
      totalBids,
      avgPrice,
      lowestPrice,
      highestPrice,
      priceRange,
      currency: bids[0].currency,
      lastUpdated: new Date(),
      bidDistribution,
      topBids,
    });
  }
}
