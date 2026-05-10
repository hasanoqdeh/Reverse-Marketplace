"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationController = exports.NotificationController = exports.BulkNotificationDto = exports.CreateNotificationEndpointDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
class CreateNotificationEndpointDto {
}
exports.CreateNotificationEndpointDto = CreateNotificationEndpointDto;
class BulkNotificationDto {
}
exports.BulkNotificationDto = BulkNotificationDto;
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async createNotification(createNotificationDto, req) {
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
    async getUserNotifications(req, page = 1, limit = 20, unreadOnly = false) {
        const userId = req.user?.sub || 'user-placeholder';
        const result = await this.notificationService.getUserNotifications(userId, page, limit, unreadOnly);
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
    async getUnreadCount(req) {
        const userId = req.user?.sub || 'user-placeholder';
        const count = await this.notificationService.getUnreadCount(userId);
        return {
            data: { unreadCount: count },
        };
    }
    async getNotificationStats(req) {
        const userId = req.user?.sub || 'user-placeholder';
        const stats = await this.notificationService.getNotificationStats(userId);
        return {
            data: stats,
        };
    }
    async markNotificationAsRead(id, req) {
        const userId = req.user?.sub || 'user-placeholder';
        await this.notificationService.markNotificationAsRead(id, userId);
        return {
            message: 'Notification marked as read',
        };
    }
    async markAllNotificationsAsRead(req) {
        const userId = req.user?.sub || 'user-placeholder';
        await this.notificationService.markAllNotificationsAsRead(userId);
        return {
            message: 'All notifications marked as read',
        };
    }
    async deleteNotification(id, req) {
        const userId = req.user?.sub || 'user-placeholder';
        await this.notificationService.deleteNotification(id, userId);
        return {
            message: 'Notification deleted successfully',
        };
    }
    async sendBulkNotifications(bulkNotificationDto) {
        const results = await this.notificationService.sendBulkNotifications(bulkNotificationDto.userIds, bulkNotificationDto.notification);
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
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create and send a notification' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Notification created and sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Rate limit exceeded' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateNotificationEndpointDto, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user notifications' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notifications retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('unreadOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Boolean]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread notifications count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notification statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistics retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotificationStats", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markNotificationAsRead", null);
__decorate([
    (0, common_1.Patch)('read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Mark all notifications as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All notifications marked as read' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllNotificationsAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notification deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Notification not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Send bulk notifications to multiple users' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk notifications sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BulkNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendBulkNotifications", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
let AdminNotificationController = class AdminNotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async broadcastNotification(createNotificationDto) {
        const notification = await this.notificationService.createNotification({
            ...createNotificationDto,
            user_id: 'broadcast',
        });
        return {
            data: notification,
            message: 'Broadcast notification created',
        };
    }
    async getSystemNotificationStats() {
        const stats = await this.notificationService.getNotificationStats();
        return {
            data: stats,
        };
    }
};
exports.AdminNotificationController = AdminNotificationController;
__decorate([
    (0, common_1.Post)('broadcast'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Broadcast notification to all users' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Broadcast sent successfully' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateNotificationEndpointDto]),
    __metadata("design:returntype", Promise)
], AdminNotificationController.prototype, "broadcastNotification", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system-wide notification statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'System statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminNotificationController.prototype, "getSystemNotificationStats", null);
exports.AdminNotificationController = AdminNotificationController = __decorate([
    (0, swagger_1.ApiTags)('admin-notifications'),
    (0, common_1.Controller)('admin/notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], AdminNotificationController);
//# sourceMappingURL=notification.controller.js.map