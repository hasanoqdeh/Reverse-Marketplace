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
exports.UploadController = exports.GenerateUploadUrlDto = void 0;
const common_1 = require("@nestjs/common");
const upload_service_1 = require("./upload.service");
class GenerateUploadUrlDto {
}
exports.GenerateUploadUrlDto = GenerateUploadUrlDto;
let UploadController = class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async generateUploadUrl(generateUploadUrlDto, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const uploadUrlResponse = await this.uploadService.generateUploadUrl(generateUploadUrlDto, userId);
        return {
            data: uploadUrlResponse,
            message: 'Upload URL generated successfully',
        };
    }
    async confirmUpload(fileId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const fileUrl = await this.uploadService.confirmUpload(fileId, userId);
        return {
            data: { fileUrl },
            message: 'Upload confirmed successfully',
        };
    }
    async getFileMetadata(fileId) {
        const fileKey = `chat/${fileId}`;
        const metadata = await this.uploadService.getFileMetadata(fileKey);
        return {
            data: metadata,
        };
    }
    async scanFile(fileId) {
        const fileKey = `chat/${fileId}`;
        const scanResult = await this.uploadService.scanForMalware(fileKey);
        return {
            data: scanResult,
        };
    }
    async validateContent(fileId, body) {
        const fileKey = `chat/${fileId}`;
        const validation = await this.uploadService.enforceContentPolicy(fileKey, body.contentType);
        return {
            data: validation,
        };
    }
    async deleteFile(fileId, req) {
        const userId = req.user?.sub || 'user-placeholder';
        const success = await this.uploadService.deleteFile(fileId, userId);
        if (!success) {
            throw new Error('Failed to delete file');
        }
        return {
            message: 'File deleted successfully',
        };
    }
    getSupportedFileTypes() {
        const supportedTypes = this.uploadService.getSupportedFileTypes();
        const maxSize = this.uploadService.getMaxFileSize();
        return {
            data: {
                supportedTypes,
                maxSize,
                maxSizeMB: Math.round(maxSize / (1024 * 1024)),
            },
        };
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('url'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateUploadUrlDto, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "generateUploadUrl", null);
__decorate([
    (0, common_1.Post)(':fileId/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "confirmUpload", null);
__decorate([
    (0, common_1.Get)(':fileId/metadata'),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFileMetadata", null);
__decorate([
    (0, common_1.Post)(':fileId/scan'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "scanFile", null);
__decorate([
    (0, common_1.Post)(':fileId/validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "validateContent", null);
__decorate([
    (0, common_1.Delete)(':fileId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('fileId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)('config/supported-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UploadController.prototype, "getSupportedFileTypes", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('chat/uploads'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map