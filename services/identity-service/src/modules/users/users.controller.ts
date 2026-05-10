import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.sub,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
    // TODO: Implement profile update logic
    return { message: 'Profile updated successfully', data: updateData };
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'All users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers() {
    // TODO: Implement get all users logic
    return { message: 'All users retrieved (Admin only)' };
  }

  @Get('merchant/dashboard')
  @Roles(UserRole.MERCHANT)
  @ApiOperation({ summary: 'Get merchant dashboard (Merchant only)' })
  @ApiResponse({ status: 200, description: 'Merchant dashboard retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Merchant access required' })
  async getMerchantDashboard(@CurrentUser() user: any) {
    // TODO: Implement merchant dashboard logic
    return { message: 'Merchant dashboard data', userId: user.sub };
  }

  @Get('buyer/dashboard')
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Get buyer dashboard (Buyer only)' })
  @ApiResponse({ status: 200, description: 'Buyer dashboard retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Buyer access required' })
  async getBuyerDashboard(@CurrentUser() user: any) {
    // TODO: Implement buyer dashboard logic
    return { message: 'Buyer dashboard data', userId: user.sub };
  }
}
