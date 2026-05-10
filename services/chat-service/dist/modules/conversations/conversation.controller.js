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
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const conversation_service_1 = require("./conversation.service");
let ConversationController = class ConversationController {
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async getUserConversations(page = 1, limit = 20, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const result = await this.conversationService.getUserConversations(userId, page, limit);
        return {
            data: result,
        };
    }
    async getConversation(conversationId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const conversation = await this.conversationService.getConversationById(conversationId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        const hasAccess = await this.conversationService.canUserAccessConversation(conversationId, userId);
        if (!hasAccess) {
            throw new Error('Access denied');
        }
        return {
            data: conversation,
        };
    }
    async archiveConversation(conversationId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const success = await this.conversationService.archiveConversation(conversationId, userId);
        if (!success) {
            throw new Error('Failed to archive conversation');
        }
        return {
            message: 'Conversation archived successfully',
        };
    }
    async blockConversation(conversationId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const success = await this.conversationService.blockConversation(conversationId, userId);
        if (!success) {
            throw new Error('Failed to block conversation');
        }
        return {
            message: 'Conversation blocked successfully',
        };
    }
    async closeConversation(conversationId, req) {
        const success = await this.conversationService.closeConversation(conversationId);
        if (!success) {
            throw new Error('Failed to close conversation');
        }
        return {
            message: 'Conversation closed successfully',
        };
    }
    async getConversationParticipants(conversationId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const hasAccess = await this.conversationService.canUserAccessConversation(conversationId, userId);
        if (!hasAccess) {
            throw new Error('Access denied');
        }
        const participants = await this.conversationService.getConversationParticipants(conversationId);
        return {
            data: { participants },
        };
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "archiveConversation", null);
__decorate([
    (0, common_1.Patch)(':id/block'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "blockConversation", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "closeConversation", null);
__decorate([
    (0, common_1.Get)(':id/participants'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getConversationParticipants", null);
exports.ConversationController = ConversationController = __decorate([
    (0, common_1.Controller)('chat/conversations'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map