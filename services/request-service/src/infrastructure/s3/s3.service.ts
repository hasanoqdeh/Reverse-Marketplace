import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: any,
    private readonly configService: ConfigService,
  ) {}

  async uploadImage(
    file: Buffer,
    fileName: string,
    mimeType: string,
    requestId: string,
  ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    const bucket = this.configService.get('aws.s3.bucket');
    const imageQuality = this.configService.get('request.imageQuality', 80);

    // Generate unique file names
    const imageKey = `requests/${requestId}/images/${Date.now()}-${fileName}`;
    const thumbnailKey = `requests/${requestId}/thumbnails/${Date.now()}-${fileName}`;

    try {
      // Process main image
      const processedImage = await this.processImage(file, imageQuality, 1920, 1080);
      
      // Process thumbnail
      const thumbnail = await this.processImage(file, 80, 300, 300);

      // Upload main image
      const imageUploadResult = await this.s3Client.upload({
        Bucket: bucket,
        Key: imageKey,
        Body: processedImage,
        ContentType: mimeType,
        ACL: 'public-read',
      }).promise();

      // Upload thumbnail
      const thumbnailUploadResult = await this.s3Client.upload({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: mimeType,
        ACL: 'public-read',
      }).promise();

      const bucketUrl = this.configService.get('aws.s3.bucketUrl');
      
      return {
        imageUrl: `${bucketUrl}/${imageKey}`,
        thumbnailUrl: `${bucketUrl}/${thumbnailKey}`,
      };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const bucket = this.configService.get('aws.s3.bucket');
    const key = this.extractKeyFromUrl(imageUrl);

    try {
      await this.s3Client.deleteObject({
        Bucket: bucket,
        Key: key,
      }).promise();
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async generateSignedUploadUrl(
    fileName: string,
    mimeType: string,
    requestId: string,
  ): Promise<{ uploadUrl: string; imageUrl: string }> {
    const bucket = this.configService.get('aws.s3.bucket');
    const key = `requests/${requestId}/images/${Date.now()}-${fileName}`;

    try {
      const uploadUrl = await this.s3Client.getSignedUrlPromise('putObject', {
        Bucket: bucket,
        Key: key,
        ContentType: mimeType,
        ACL: 'public-read',
        Expires: 3600, // 1 hour
      });

      const bucketUrl = this.configService.get('aws.s3.bucketUrl');
      const imageUrl = `${bucketUrl}/${key}`;

      return { uploadUrl, imageUrl };
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  private async processImage(
    buffer: Buffer,
    quality: number,
    maxWidth: number,
    maxHeight: number,
  ): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  private extractKeyFromUrl(url: string): string {
    const bucketUrl = this.configService.get('aws.s3.bucketUrl');
    return url.replace(`${bucketUrl}/`, '');
  }

  validateImageFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeMB = this.configService.get('request.maxImageSizeMB', 10);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      };
    }

    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    return { isValid: true };
  }

  async getImageMetadata(buffer: Buffer): Promise<{ width: number; height: number; size: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        size: buffer.length,
      };
    } catch (error) {
      throw new Error(`Failed to extract image metadata: ${error.message}`);
    }
  }
}
