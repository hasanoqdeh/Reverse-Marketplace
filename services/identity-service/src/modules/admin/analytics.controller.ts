import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/entities/user.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin Analytics')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview' })
  @ApiResponse({ status: 200, description: 'Analytics overview retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('category-trends')
  @ApiOperation({ summary: 'Get category trends' })
  @ApiResponse({ status: 200, description: 'Category trends retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getCategoryTrends() {
    return this.adminService.getCategoryTrends();
  }

  @Get('geographic')
  @ApiOperation({ summary: 'Get geographic data' })
  @ApiResponse({ status: 200, description: 'Geographic data retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getGeographic() {
    return this.adminService.getGeographic();
  }

  @Get('ratios')
  @ApiOperation({ summary: 'Get analytics ratios' })
  @ApiResponse({ status: 200, description: 'Analytics ratios retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getRatios() {
    return this.adminService.getRatios();
  }

  @Get('revenue-per-category')
  @ApiOperation({ summary: 'Get revenue per category' })
  @ApiResponse({ status: 200, description: 'Revenue per category retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getRevenuePerCategory() {
    return this.adminService.getRevenuePerCategory();
  }
}
