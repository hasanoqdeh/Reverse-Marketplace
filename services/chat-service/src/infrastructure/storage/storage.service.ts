import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fileId: string;
  expiresAt: Date;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: any,
    private readonly configService: ConfigService,
  ) {}

  async generateUploadUrl(
    fileName: string,
    contentType: string,
    userId: string,
  ): Promise<UploadUrlResponse> {
    const bucket = this.configService.get('storage.s3.bucket');
    const fileId = this.generateFileId(userId, fileName);
    const key = `chat/${fileId}`;

    // Validate file type and size limits
    const validation = this.validateFile(contentType);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Generate signed upload URL
    const uploadParams = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Expires: 3600, // 1 hour
      ACL: 'private',
    };

    const uploadUrl = await this.s3Client.getSignedUrlPromise('putObject', uploadParams);
    
    // Generate the final file URL
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

  async generateAccessUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    const bucket = this.configService.get('storage.s3.bucket');
    
    const params = {
      Bucket: bucket,
      Key: fileKey,
      Expires: expiresIn,
    };

    return await this.s3Client.getSignedUrlPromise('getObject', params);
  }

  async deleteFile(fileKey: string): Promise<void> {
    const bucket = this.configService.get('storage.s3.bucket');
    
    const params = {
      Bucket: bucket,
      Key: fileKey,
    };

    await this.s3Client.deleteObject(params).promise();
  }

  async getFileMetadata(fileKey: string): Promise<any> {
    const bucket = this.configService.get('storage.s3.bucket');
    
    const params = {
      Bucket: bucket,
      Key: fileKey,
    };

    try {
      return await this.s3Client.headObject(params).promise();
    } catch (error) {
      throw new Error(`File not found: ${fileKey}`);
    }
  }

  validateFile(contentType: string): FileValidation {
    const allowedTypes = this.configService.get('storage.allowedFileTypes', []);
    
    if (!allowedTypes.includes(contentType)) {
      return {
        isValid: false,
        error: `File type ${contentType} is not allowed`,
      };
    }

    return { isValid: true };
  }

  async validateFileSize(fileKey: string): Promise<FileValidation> {
    try {
      const metadata = await this.getFileMetadata(fileKey);
      const maxSize = this.configService.get('storage.maxFileSize', 10485760); // 10MB
      
      if (metadata.ContentLength > maxSize) {
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${maxSize} bytes`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to validate file size',
      };
    }
  }

  private async getFileUrl(fileKey: string): Promise<string> {
    const bucket = this.configService.get('storage.s3.bucket');
    const region = this.configService.get('storage.s3.region');
    const endpoint = this.configService.get('storage.s3.endpoint');
    
    if (endpoint) {
      // Custom S3-compatible endpoint
      return `${endpoint}/${bucket}/${fileKey}`;
    } else {
      // AWS S3
      return `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
    }
  }

  private generateFileId(userId: string, originalFileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = originalFileName.split('.').pop();
    return `${userId}_${timestamp}_${random}.${extension}`;
  }

  // Media processing utilities
  getFileType(contentType: string): 'image' | 'video' | 'audio' | 'document' {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  async generateThumbnail(fileKey: string, outputFormat: 'jpeg' | 'webp' = 'jpeg'): Promise<string> {
    // This would integrate with an image processing service
    // For now, return the original file URL
    return await this.getFileUrl(fileKey);
  }

  async generateVideoPreview(fileKey: string): Promise<string> {
    // This would integrate with a video processing service
    // For now, return the original file URL
    return await this.getFileUrl(fileKey);
  }

  async generateAudioWaveform(fileKey: string): Promise<string> {
    // This would integrate with an audio processing service
    // For now, return a placeholder
    return '/assets/audio-waveform-placeholder.png';
  }

  // Batch operations
  async deleteMultipleFiles(fileKeys: string[]): Promise<void> {
    const bucket = this.configService.get('storage.s3.bucket');
    
    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: fileKeys.map(key => ({ Key: key })),
      },
    };

    await this.s3Client.deleteObjects(deleteParams).promise();
  }

  async listFiles(prefix: string, maxKeys: number = 1000): Promise<any[]> {
    const bucket = this.configService.get('storage.s3.bucket');
    
    const params = {
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    const result = await this.s3Client.listObjectsV2(params).promise();
    return result.Contents || [];
  }

  // Security and validation
  async scanForMalware(fileKey: string): Promise<{ isClean: boolean; threat?: string }> {
    // This would integrate with a virus scanning service
    // For now, assume all files are clean
    return { isClean: true };
  }

  async enforceContentPolicy(fileKey: string, contentType: string): Promise<{ isAllowed: boolean; reason?: string }> {
    // This would implement content policy checks
    // For now, allow all validated content types
    const validation = this.validateFile(contentType);
    return {
      isAllowed: validation.isValid,
      reason: validation.error,
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: string; bucket: string }> {
    try {
      const bucket = this.configService.get('storage.s3.bucket');
      await this.s3Client.headBucket({ Bucket: bucket }).promise();
      
      return {
        status: 'healthy',
        bucket,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        bucket: this.configService.get('storage.s3.bucket'),
      };
    }
  }
}
