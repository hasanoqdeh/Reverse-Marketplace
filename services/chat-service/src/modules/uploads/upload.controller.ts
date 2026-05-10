import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UploadService } from './upload.service';

export class GenerateUploadUrlDto {
  fileName: string;
  contentType: string;
}

@Controller('chat/uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('url')
  @HttpCode(HttpStatus.CREATED)
  async generateUploadUrl(
    @Body() generateUploadUrlDto: GenerateUploadUrlDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const uploadUrlResponse = await this.uploadService.generateUploadUrl(
      generateUploadUrlDto,
      userId,
    );
    
    return {
      data: uploadUrlResponse,
      message: 'Upload URL generated successfully',
    };
  }

  @Post(':fileId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmUpload(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const fileUrl = await this.uploadService.confirmUpload(fileId, userId);
    
    return {
      data: { fileUrl },
      message: 'Upload confirmed successfully',
    };
  }

  @Get(':fileId/metadata')
  async getFileMetadata(@Param('fileId') fileId: string) {
    const fileKey = `chat/${fileId}`;
    const metadata = await this.uploadService.getFileMetadata(fileKey);
    
    return {
      data: metadata,
    };
  }

  @Post(':fileId/scan')
  @HttpCode(HttpStatus.OK)
  async scanFile(@Param('fileId') fileId: string) {
    const fileKey = `chat/${fileId}`;
    const scanResult = await this.uploadService.scanForMalware(fileKey);
    
    return {
      data: scanResult,
    };
  }

  @Post(':fileId/validate')
  @HttpCode(HttpStatus.OK)
  async validateContent(
    @Param('fileId') fileId: string,
    @Body() body: { contentType: string },
  ) {
    const fileKey = `chat/${fileId}`;
    const validation = await this.uploadService.enforceContentPolicy(
      fileKey,
      body.contentType,
    );
    
    return {
      data: validation,
    };
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Param('fileId') fileId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const success = await this.uploadService.deleteFile(fileId, userId);
    
    if (!success) {
      throw new Error('Failed to delete file');
    }
    
    return {
      message: 'File deleted successfully',
    };
  }

  @Get('config/supported-types')
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
}
