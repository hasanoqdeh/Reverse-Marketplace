import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService, CreateNotificationDto } from './notification.service';
import { NotificationType, DeliveryStatus } from '../../common/entities/notification.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export class CreateNotificationEndpointDto {
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, any>;
  priority?: 'HIGH' | 'NORMAL' | 'LOW';
}

export class BulkNotificationDto {
  userIds: string[];
  notification: CreateNotificationEndpointDto;
}

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create and send a notification' })
  @ApiResponse({ status: 201, description: 'Notification created and sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async createNotification(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationEndpointDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const notification = await this.notificationService.createNotification({
      ...createNotificationDto,
      user_id: userId,
    });

    return {
      data: notification,
      message: 'Notification created and sent successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly: boolean = false,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const result = await this.notificationService.getUserNotifications(
      userId,
      page,
      limit,
      unreadOnly
    );

    return {
      data: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const count = await this.notificationService.getUnreadCount(userId);

    return {
      data: { unreadCount: count },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getNotificationStats(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const stats = await this.notificationService.getNotificationStats(userId);

    return {
      data: stats,
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markNotificationAsRead(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    await this.notificationService.markNotificationAsRead(id, userId);

    return {
      message: 'Notification marked as read',
    };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllNotificationsAsRead(@Request() req: any) {
    const userId = req.user?.sub || 'user-placeholder';
    
    await this.notificationService.markAllNotificationsAsRead(userId);

    return {
      message: 'All notifications marked as read',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    await this.notificationService.deleteNotification(id, userId);

    return {
      message: 'Notification deleted successfully',
    };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send bulk notifications to multiple users' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async sendBulkNotifications(
    @Body(ValidationPipe) bulkNotificationDto: BulkNotificationDto,
  ) {
    const results = await this.notificationService.sendBulkNotifications(
      bulkNotificationDto.userIds,
      bulkNotificationDto.notification
    );

    return {
      data: results,
      message: 'Bulk notifications sent',
      summary: {
        total: results.length,
        delivered: results.filter(r => r.delivered).length,
        failed: results.filter(r => !r.delivered).length,
      },
    };
  }
}

// Admin endpoints for system-wide notifications
@ApiTags('admin-notifications')
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Broadcast notification to all users' })
  @ApiResponse({ status: 201, description: 'Broadcast sent successfully' })
  async broadcastNotification(
    @Body(ValidationPipe) createNotificationDto: CreateNotificationEndpointDto,
  ) {
    // TODO: Implement admin role check
    // For now, we'll allow any authenticated user
    
    const notification = await this.notificationService.createNotification({
      ...createNotificationDto,
      user_id: 'broadcast', // Special user ID for broadcasts
    });

    return {
      data: notification,
      message: 'Broadcast notification created',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system-wide notification statistics' })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  async getSystemNotificationStats() {
    const stats = await this.notificationService.getNotificationStats();

    return {
      data: stats,
    };
  }
}
