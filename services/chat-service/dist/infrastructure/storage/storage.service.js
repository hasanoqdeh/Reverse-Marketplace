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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let StorageService = class StorageService {
    constructor(s3Client, configService) {
        this.s3Client = s3Client;
        this.configService = configService;
    }
    async generateUploadUrl(fileName, contentType, userId) {
        const bucket = this.configService.get('storage.s3.bucket');
        const fileId = this.generateFileId(userId, fileName);
        const key = `chat/${fileId}`;
        const validation = this.validateFile(contentType);
        if (!validation.isValid) {
            throw new Error(validation.error);
        }
        const uploadParams = {
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            Expires: 3600,
            ACL: 'private',
        };
        const uploadUrl = await this.s3Client.getSignedUrlPromise('putObject', uploadParams);
        const fileUrl = await this.getFileUrl(key);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        return {
            uploadUrl,
            fileUrl,
            fileId,
            expiresAt,
        };
    }
    async generateAccessUrl(fileKey, expiresIn = 3600) {
        const bucket = this.configService.get('storage.s3.bucket');
        const params = {
            Bucket: bucket,
            Key: fileKey,
            Expires: expiresIn,
        };
        return await this.s3Client.getSignedUrlPromise('getObject', params);
    }
    async deleteFile(fileKey) {
        const bucket = this.configService.get('storage.s3.bucket');
        const params = {
            Bucket: bucket,
            Key: fileKey,
        };
        await this.s3Client.deleteObject(params).promise();
    }
    async getFileMetadata(fileKey) {
        const bucket = this.configService.get('storage.s3.bucket');
        const params = {
            Bucket: bucket,
            Key: fileKey,
        };
        try {
            return await this.s3Client.headObject(params).promise();
        }
        catch (error) {
            throw new Error(`File not found: ${fileKey}`);
        }
    }
    validateFile(contentType) {
        const allowedTypes = this.configService.get('storage.allowedFileTypes', []);
        if (!allowedTypes.includes(contentType)) {
            return {
                isValid: false,
                error: `File type ${contentType} is not allowed`,
            };
        }
        return { isValid: true };
    }
    async validateFileSize(fileKey) {
        try {
            const metadata = await this.getFileMetadata(fileKey);
            const maxSize = this.configService.get('storage.maxFileSize', 10485760);
            if (metadata.ContentLength > maxSize) {
                return {
                    isValid: false,
                    error: `File size exceeds maximum allowed size of ${maxSize} bytes`,
                };
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: 'Unable to validate file size',
            };
        }
    }
    async getFileUrl(fileKey) {
        const bucket = this.configService.get('storage.s3.bucket');
        const region = this.configService.get('storage.s3.region');
        const endpoint = this.configService.get('storage.s3.endpoint');
        if (endpoint) {
            return `${endpoint}/${bucket}/${fileKey}`;
        }
        else {
            return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
        }
    }
    generateFileId(userId, originalFileName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const extension = originalFileName.split('.').pop();
        return `${userId}_${timestamp}_${random}.${extension}`;
    }
    getFileType(contentType) {
        if (contentType.startsWith('image/'))
            return 'image';
        if (contentType.startsWith('video/'))
            return 'video';
        if (contentType.startsWith('audio/'))
            return 'audio';
        return 'document';
    }
    async generateThumbnail(fileKey, outputFormat = 'jpeg') {
        return await this.getFileUrl(fileKey);
    }
    async generateVideoPreview(fileKey) {
        return await this.getFileUrl(fileKey);
    }
    async generateAudioWaveform(fileKey) {
        return '/assets/audio-waveform-placeholder.png';
    }
    async deleteMultipleFiles(fileKeys) {
        const bucket = this.configService.get('storage.s3.bucket');
        const deleteParams = {
            Bucket: bucket,
            Delete: {
                Objects: fileKeys.map(key => ({ Key: key })),
            },
        };
        await this.s3Client.deleteObjects(deleteParams).promise();
    }
    async listFiles(prefix, maxKeys = 1000) {
        const bucket = this.configService.get('storage.s3.bucket');
        const params = {
            Bucket: bucket,
            Prefix: prefix,
            MaxKeys: maxKeys,
        };
        const result = await this.s3Client.listObjectsV2(params).promise();
        return result.Contents || [];
    }
    async scanForMalware(fileKey) {
        return { isClean: true };
    }
    async enforceContentPolicy(fileKey, contentType) {
        const validation = this.validateFile(contentType);
        return {
            isAllowed: validation.isValid,
            reason: validation.error,
        };
    }
    async healthCheck() {
        try {
            const bucket = this.configService.get('storage.s3.bucket');
            await this.s3Client.headBucket({ Bucket: bucket }).promise();
            return {
                status: 'healthy',
                bucket,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                bucket: this.configService.get('storage.s3.bucket'),
            };
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('S3_CLIENT')),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map