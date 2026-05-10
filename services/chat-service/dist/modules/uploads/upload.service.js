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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("../../infrastructure/storage/storage.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
let UploadService = class UploadService {
    constructor(storageService, redisService) {
        this.storageService = storageService;
        this.redisService = redisService;
    }
    async generateUploadUrl(data, userId) {
        const rateLimitValid = await this.redisService.checkUploadRateLimit(userId);
        if (!rateLimitValid) {
            throw new Error('Upload rate limit exceeded');
        }
        const validation = this.storageService.validateFile(data.contentType);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }
        const uploadUrlResponse = await this.storageService.generateUploadUrl(data.fileName, data.contentType, userId);
        const cacheKey = `upload:${uploadUrlResponse.fileId}`;
        await this.redisService['client'].setEx(cacheKey, 3600, JSON.stringify({
            userId,
            fileName: data.fileName,
            contentType: data.contentType,
            fileId: uploadUrlResponse.fileId,
            createdAt: new Date().toISOString(),
        }));
        return uploadUrlResponse;
    }
    async validateUpload(fileId, userId) {
        const cacheKey = `upload:${fileId}`;
        const cached = await this.redisService['client'].get(cacheKey);
        if (!cached) {
            return false;
        }
        const uploadData = JSON.parse(cached);
        return uploadData.userId === userId;
    }
    async confirmUpload(fileId, userId) {
        const isValid = await this.validateUpload(fileId, userId);
        if (!isValid) {
            throw new Error('Invalid upload');
        }
        const cacheKey = `upload:${fileId}`;
        const cached = await this.redisService['client'].get(cacheKey);
        const uploadData = JSON.parse(cached);
        const fileUrl = await this.storageService.generateAccessUrl(`chat/${fileId}`, 86400 * 30);
        await this.redisService['client'].del(cacheKey);
        return fileUrl;
    }
    async processMediaFile(fileUrl, contentType) {
        const fileType = this.storageService.getFileType(contentType);
        let thumbnailUrl;
        let metadata;
        switch (fileType) {
            case 'image':
                thumbnailUrl = await this.storageService.generateThumbnail(fileUrl.split('/').pop() || '', 'webp');
                metadata = {
                    type: 'image',
                    hasThumbnail: !!thumbnailUrl,
                };
                break;
            case 'video':
                thumbnailUrl = await this.storageService.generateVideoPreview(fileUrl.split('/').pop() || '');
                metadata = {
                    type: 'video',
                    hasPreview: !!thumbnailUrl,
                };
                break;
            case 'audio':
                const waveformUrl = await this.storageService.generateAudioWaveform(fileUrl.split('/').pop() || '');
                metadata = {
                    type: 'audio',
                    waveformUrl,
                };
                break;
            default:
                metadata = {
                    type: 'document',
                };
        }
        return {
            url: fileUrl,
            thumbnailUrl,
            metadata,
        };
    }
    async deleteFile(fileId, userId) {
        const isValid = await this.validateUpload(fileId, userId);
        if (!isValid) {
            return false;
        }
        try {
            await this.storageService.deleteFile(`chat/${fileId}`);
            return true;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
    async getFileMetadata(fileKey) {
        try {
            return await this.storageService.getFileMetadata(fileKey);
        }
        catch (error) {
            throw new Error('File not found');
        }
    }
    async scanForMalware(fileKey) {
        return await this.storageService.scanForMalware(fileKey);
    }
    async enforceContentPolicy(fileKey, contentType) {
        return await this.storageService.enforceContentPolicy(fileKey, contentType);
    }
    getSupportedFileTypes() {
        return this.storageService['configService'].get('storage.allowedFileTypes', []);
    }
    getMaxFileSize() {
        return this.storageService['configService'].get('storage.maxFileSize', 10485760);
    }
    async cleanupExpiredUploads() {
        console.log('Cleaning up expired uploads...');
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        redis_service_1.RedisService])
], UploadService);
//# sourceMappingURL=upload.service.js.map