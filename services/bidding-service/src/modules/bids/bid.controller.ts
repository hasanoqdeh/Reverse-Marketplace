import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BidService, CreateBidDto, UpdateBidStatusDto } from './bid.service';
import { BidStatus } from '../../infrastructure/mongodb/schemas/bid.schema';

@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBid(@Body() createBidDto: CreateBidDto, @Request() req: any) {
    // This would typically validate JWT token and extract merchant info
    const merchantId = req.user?.sub || 'merchant-placeholder';
    const merchantTrustScore = req.user?.trustScore || 4.0;

    const bid = await this.bidService.createBid(createBidDto, merchantId, merchantTrustScore);
    return {
      data: bid,
      message: 'Bid submitted successfully',
    };
  }

  @Get(':id')
  async getBid(@Param('id') id: string, @Request() req: any) {
    const bid = await this.bidService.getBidById(id);
    if (!bid) {
      throw new Error('Bid not found');
    }

    // Validate access permissions
    // This would check if the user is the buyer or merchant of the bid
    return {
      data: bid,
    };
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateBidStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateBidStatusDto,
    @Request() req: any,
  ) {
    const changedBy = req.user?.sub || 'user-placeholder';
    
    const bid = await this.bidService.updateBidStatus(id, updateDto, changedBy);
    return {
      data: bid,
      message: 'Bid status updated successfully',
    };
  }

  @Get('request/:requestId')
  async getRequestBids(
    @Param('requestId') requestId: string,
    @Request() req: any,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    const userRole = req.user?.role || 'USER';
    const sortValue = sort || 'latest';
    const pageValue = page || 1;
    const limitValue = limit || 20;

    const bids = await this.bidService.getRequestBids(requestId, userId, userRole);
    
    // Apply sorting
    const sortedBids = this.sortBids(bids, sortValue);
    
    // Apply pagination
    const startIndex = (pageValue - 1) * limitValue;
    const paginatedBids = sortedBids.slice(startIndex, startIndex + limitValue);

    return {
      data: {
        bids: paginatedBids,
        pagination: {
          page: pageValue,
          limit: limitValue,
          total: bids.length,
          totalPages: Math.ceil(bids.length / limitValue),
        },
      },
    };
  }

  @Get('request/:requestId/analytics')
  async getRequestBidAnalytics(@Param('requestId') requestId: string, @Request() req: any) {
    const analytics = await this.bidService.getBidAnalytics(requestId);
    
    if (!analytics) {
      return {
        data: {
          totalBids: 0,
          avgPrice: 0,
          lowestPrice: 0,
          highestPrice: 0,
          priceRange: 0,
          bidDistribution: {
            pending: 0,
            accepted: 0,
            rejected: 0,
            expired: 0,
            withdrawn: 0,
            autoRejected: 0,
          },
          topBids: [],
        },
      };
    }

    return {
      data: analytics,
    };
  }

  @Get('my-bids')
  async getMyBids(
    @Request() req: any,
    @Query('status') status?: BidStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const merchantId = req.user?.sub || 'merchant-placeholder';
    const pageValue = page || 1;
    const limitValue = limit || 20;
    
    const result = await this.bidService.getMerchantBids(merchantId, status, pageValue, limitValue);
    return {
      data: result,
    };
  }

  @Patch(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdrawBid(@Param('id') id: string, @Request() req: any) {
    const merchantId = req.user?.sub || 'user-placeholder';
    
    // Verify bid belongs to merchant
    const bid = await this.bidService.getBidById(id);
    if (!bid || bid.merchantId !== merchantId) {
      throw new Error('Bid not found or access denied');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new Error('Only pending bids can be withdrawn');
    }

    const updatedBid = await this.bidService.updateBidStatus(
      id,
      { status: BidStatus.WITHDRAWN, reason: 'Withdrawn by merchant' },
      merchantId,
    );

    return {
      data: updatedBid,
      message: 'Bid withdrawn successfully',
    };
  }

  private sortBids(bids: any[], sort: string): any[] {
    switch (sort) {
      case 'price_lowest':
        return bids.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price_highest':
        return bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'trust_score':
        return bids.sort((a, b) => (b.merchantTrustScore || 0) - (a.merchantTrustScore || 0));
      case 'delivery_time':
        return bids.sort((a, b) => {
          if (!a.deliveryTime) return 1;
          if (!b.deliveryTime) return -1;
          return a.deliveryTime.localeCompare(b.deliveryTime);
        });
      case 'latest':
      default:
        return bids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
}
