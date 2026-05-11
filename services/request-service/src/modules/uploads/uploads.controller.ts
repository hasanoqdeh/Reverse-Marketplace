import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { RequestsService } from '../requests/requests.service';
import { RequestImage } from '../../common/entities/request-image.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Uploads')
@Controller()
export class UploadsController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly requestsService: RequestsService,
    @InjectRepository(RequestImage)
    private readonly requestImageRepository: Repository<RequestImage>,
  ) {}

  @Post('requests/:id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Upload images for a request' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Images uploaded successfully' })
  async uploadImages(
    @Param('id') requestId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
  ) {
    // Validate request ownership
    const request = await this.requestsService.getRequestById(requestId, req.user.sub);
    if (request.buyerId !== req.user.sub) {
      throw new BadRequestException('You can only upload images to your own requests');
    }

    // Validate request is still a draft
    if (request.status !== 'DRAFT') {
      throw new BadRequestException('Images can only be uploaded to draft requests');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Check current image count
    const currentImageCount = await this.requestImageRepository.count({
      where: { requestId },
    });

    const maxImages = 10; // This should come from config
    if (currentImageCount + files.length > maxImages) {
      throw new BadRequestException(`Maximum ${maxImages} images allowed per request`);
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validation = this.s3Service.validateImageFile(file);
      if (!validation.isValid) {
        throw new BadRequestException(`Invalid file: ${validation.error}`);
      }

      try {
        // Upload to S3
        const uploadResult = await this.s3Service.uploadImage(
          file.buffer,
          file.originalname,
          file.mimetype,
          requestId,
        );

        // Get image metadata
        const metadata = await this.s3Service.getImageMetadata(file.buffer);

        // Save to database
        const requestImage = this.requestImageRepository.create({
          requestId,
          imageUrl: uploadResult.imageUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          sortOrder: currentImageCount + i,
          originalFileName: file.originalname,
          fileSize: metadata.size,
          mimeType: file.mimetype,
        });

        const savedImage = await this.requestImageRepository.save(requestImage);
        uploadedImages.push(savedImage);
      } catch (error) {
        throw new BadRequestException(`Failed to upload image ${file.originalname}: ${error.message}`);
      }
    }

    return { data: uploadedImages };
  }

  @Delete('requests/:id/images/:imageId')
  @ApiOperation({ summary: 'Delete an image from a request' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(
    @Param('id') requestId: string,
    @Param('imageId') imageId: string,
    @Request() req: any,
  ) {
    // Validate request ownership
    const request = await this.requestsService.getRequestById(requestId, req.user.sub);
    if (request.buyerId !== req.user.sub) {
      throw new BadRequestException('You can only delete images from your own requests');
    }

    // Find the image
    const image = await this.requestImageRepository.findOne({
      where: { id: imageId, requestId },
    });

    if (!image) {
      throw new BadRequestException('Image not found');
    }

    try {
      // Delete from S3
      await this.s3Service.deleteImage(image.imageUrl);

      // Delete thumbnail
      if (image.thumbnailUrl) {
        await this.s3Service.deleteImage(image.thumbnailUrl);
      }

      // Delete from database
      await this.requestImageRepository.delete(imageId);

      return { message: 'Image deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  @Post('requests/:id/images/reorder')
  @ApiOperation({ summary: 'Reorder images in a request' })
  @ApiResponse({ status: 200, description: 'Images reordered successfully' })
  async reorderImages(
    @Param('id') requestId: string,
    @Body() body: { imageIds: string[] },
    @Request() req: any,
  ) {
    // Validate request ownership
    const request = await this.requestsService.getRequestById(requestId, req.user.sub);
    if (request.buyerId !== req.user.sub) {
      throw new BadRequestException('You can only reorder images in your own requests');
    }

    const { imageIds } = body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      throw new BadRequestException('Invalid image IDs provided');
    }

    // Update sort order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await this.requestImageRepository.update(
        { id: imageIds[i], requestId },
        { sortOrder: i },
      );
    }

    return { message: 'Images reordered successfully' };
  }
}
