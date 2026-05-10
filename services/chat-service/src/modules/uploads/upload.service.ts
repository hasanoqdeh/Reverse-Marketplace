import { Injectable } from '@nestjs/common';
import { StorageService, UploadUrlResponse } from '../../infrastructure/storage/storage.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

export interface GenerateUploadUrlDto {
  fileName: string;
  contentType: string;
}

@Injectable()
export class UploadService {
  constructor(
    private readonly storageService: StorageService,
    private readonly redisService: RedisService,
  ) {}

  async generateUploadUrl(
    data: GenerateUploadUrlDto,
    userId: string,
  ): Promise<UploadUrlResponse> {
    // Check upload rate limiting
    const rateLimitValid = await this.redisService.checkUploadRateLimit(userId);
    if (!rateLimitValid) {
      throw new Error('Upload rate limit exceeded');
    }

    // Validate file type
    const validation = this.storageService.validateFile(data.contentType);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate upload URL
    const uploadUrlResponse = await this.storageService.generateUploadUrl(
      data.fileName,
      data.contentType,
      userId,
    );

    // Cache upload URL for security validation
    const cacheKey = `upload:${uploadUrlResponse.fileId}`;
    await this.redisService['client'].setEx(
      cacheKey,
      3600, // 1 hour
      JSON.stringify({
        userId,
        fileName: data.fileName,
        contentType: data.contentType,
        fileId: uploadUrlResponse.fileId,
        createdAt: new Date().toISOString(),
      }),
    );

    return uploadUrlResponse;
  }

  async validateUpload(fileId: string, userId: string): Promise<boolean> {
    const cacheKey = `upload:${fileId}`;
    const cached = await this.redisService['client'].get(cacheKey);
    
    if (!cached) {
      return false;
    }

    const uploadData = JSON.parse(cached);
    return uploadData.userId === userId;
  }

  async confirmUpload(fileId: string, userId: string): Promise<string> {
    const isValid = await this.validateUpload(fileId, userId);
    if (!isValid) {
      throw new Error('Invalid upload');
    }

    // Get the file URL from storage service
    const cacheKey = `upload:${fileId}`;
    const cached = await this.redisService['client'].get(cacheKey);
    const uploadData = JSON.parse(cached);

    // Generate access URL for the uploaded file
    const fileUrl = await this.storageService.generateAccessUrl(
      `chat/${fileId}`,
      86400 * 30, // 30 days
    );

    // Clean up upload cache
    await this.redisService['client'].del(cacheKey);

    return fileUrl;
  }

  async processMediaFile(fileUrl: string, contentType: string): Promise<{
    url: string;
    thumbnailUrl?: string;
    metadata?: any;
  }> {
    const fileType = this.storageService.getFileType(contentType);
    
    let thumbnailUrl: string | undefined;
    let metadata: any;

    switch (fileType) {
      case 'image':
        thumbnailUrl = await this.storageService.generateThumbnail(
          fileUrl.split('/').pop() || '',
          'webp',
        );
        metadata = {
          type: 'image',
          hasThumbnail: !!thumbnailUrl,
        };
        break;
        
      case 'video':
        thumbnailUrl = await this.storageService.generateVideoPreview(
          fileUrl.split('/').pop() || '',
        );
        metadata = {
          type: 'video',
          hasPreview: !!thumbnailUrl,
        };
        break;
        
      case 'audio':
        const waveformUrl = await this.storageService.generateAudioWaveform(
          fileUrl.split('/').pop() || '',
        );
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

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const isValid = await this.validateUpload(fileId, userId);
    if (!isValid) {
      return false;
    }

    try {
      await this.storageService.deleteFile(`chat/${fileId}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileMetadata(fileKey: string): Promise<any> {
    try {
      return await this.storageService.getFileMetadata(fileKey);
    } catch (error) {
      throw new Error('File not found');
    }
  }

  async scanForMalware(fileKey: string): Promise<{ isClean: boolean; threat?: string }> {
    return await this.storageService.scanForMalware(fileKey);
  }

  async enforceContentPolicy(fileKey: string, contentType: string): Promise<{ isAllowed: boolean; reason?: string }> {
    return await this.storageService.enforceContentPolicy(fileKey, contentType);
  }

  getSupportedFileTypes(): string[] {
    return this.storageService['configService'].get('storage.allowedFileTypes', []);
  }

  getMaxFileSize(): number {
    return this.storageService['configService'].get('storage.maxFileSize', 10485760);
  }

  async cleanupExpiredUploads(): Promise<void> {
    // This would be called by a scheduled job
    console.log('Cleaning up expired uploads...');
    // Implementation would depend on specific cleanup needs
  }
}
