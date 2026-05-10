import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BanUserDto, UnbanUserDto } from './admin.service';

@ApiTags('Admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('banned')
  @ApiOperation({ summary: 'Get banned users' })
  @ApiResponse({ status: 200, description: 'Banned users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getBannedUsers() {
    return this.adminService.getBannedUsers();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Patch(':id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban user' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - Cannot ban admin users or user not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(@Param('id') userId: string, @Body() banDto: BanUserDto) {
    return this.adminService.banUser(userId, banDto);
  }

  @Patch(':id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unban user' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - User not found or not currently Banned' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async unbanUser(@Param('id') userId: string, @Body() unbanDto: UnbanUserDto) {
    return this.adminService.unbanUser(userId, unbanDto);
  }
}
