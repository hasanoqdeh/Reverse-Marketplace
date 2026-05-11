import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApproveMerchantDto, RejectMerchantDto } from './merchants.service';
import { MerchantProfile } from './merchant-profile.entity';

@ApiTags('Merchants')
@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get pending merchants for admin review' })
  @ApiResponse({ status: 200, description: 'Pending merchants retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getPendingMerchants(): Promise<MerchantProfile[]> {
    try {
      console.log('Getting pending merchants...');
      const result = await this.merchantsService.getPendingMerchants();
      console.log('Found pending merchants:', result.length);
      return result;
    } catch (error) {
      console.error('Error in getPendingMerchants:', error);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get merchant verification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getMerchantStats() {
    return this.merchantsService.getMerchantStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get merchant by ID' })
  @ApiResponse({ status: 200, description: 'Merchant retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getMerchant(@Param('id') id: string) {
    return this.merchantsService.getMerchantById(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve merchant verification' })
  @ApiResponse({ status: 200, description: 'Merchant approved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Merchant not in pending status' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async approveMerchant(@Param('id') id: string, @Body() approveDto: ApproveMerchantDto) {
    return this.merchantsService.approveMerchant(id, approveDto);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject merchant verification' })
  @ApiResponse({ status: 200, description: 'Merchant rejected successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Merchant not in pending status or rejection reason missing' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async rejectMerchant(@Param('id') id: string, @Body() rejectDto: RejectMerchantDto) {
    return this.merchantsService.rejectMerchant(id, rejectDto);
  }
}
