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
exports.MessageController = exports.MarkMessageReadDto = exports.SendMessageDto = void 0;
const common_1 = require("@nestjs/common");
const message_service_1 = require("./message.service");
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
class MarkMessageReadDto {
}
exports.MarkMessageReadDto = MarkMessageReadDto;
let MessageController = class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
    }
    async sendMessage(sendMessageDto, req) {
        const senderId = req.user?.sub || 'user-placeholder';
        const createMessageDto = {
            ...sendMessageDto,
            sender_id: senderId,
        };
        const message = await this.messageService.sendMessage(createMessageDto);
        return {
            data: message,
            message: 'Message sent successfully',
        };
    }
    async getConversationMessages(conversationId, req, limit = 50, before) {
        const userId = req.user?.sub || 'user-placeholder';
        const beforeTime = before ? new Date(before) : undefined;
        const messages = await this.messageService.getConversationMessages(conversationId, userId, limit, beforeTime);
        return {
            data: { messages },
        };
    }
    async markMessageAsRead(markReadDto, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const success = await this.messageService.markMessageAsRead(markReadDto.message_id, userId);
        if (!success) {
            throw new Error('Failed to mark message as read');
        }
        return {
            message: 'Message marked as read',
        };
    }
    async markAllMessagesAsRead(conversationId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const unreadCount = await this.messageService.markAllMessagesAsRead(conversationId, userId);
        return {
            message: 'All messages marked as read',
            data: { unreadCount },
        };
    }
    async getUnreadCount(req, conversationId) {
        const userId = req.user?.sub || 'user-placeholder';
        const unreadCount = await this.messageService.getUnreadCount(userId, conversationId);
        return {
            data: { unreadCount },
        };
    }
    async getMessage(messageId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const message = await this.messageService.getMessageById(messageId, userId);
        if (!message) {
            throw new Error('Message not found');
        }
        return {
            data: message,
        };
    }
    async deleteMessage(messageId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const success = await this.messageService.deleteMessage(messageId, userId);
        if (!success) {
            throw new Error('Failed to delete message');
        }
        return {
            message: 'Message deleted successfully',
        };
    }
};
exports.MessageController = MessageController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversation/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('before')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Patch)('read'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MarkMessageReadDto, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "markMessageAsRead", null);
__decorate([
    (0, common_1.Patch)('conversation/:conversationId/read-all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('conversationId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "markAllMessagesAsRead", null);
__decorate([
    (0, common_1.Get)('unread'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':messageId'),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "getMessage", null);
__decorate([
    (0, common_1.Patch)(':messageId/delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('messageId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessageController.prototype, "deleteMessage", null);
exports.MessageController = MessageController = __decorate([
    (0, common_1.Controller)('chat/messages'),
    __metadata("design:paramtypes", [message_service_1.MessageService])
], MessageController);
//# sourceMappingURL=message.controller.js.map