import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { Request, RequestStatus } from '../../common/entities/request.entity';
import { RequestImage } from '../../common/entities/request-image.entity';
import { RequestStatusHistory } from '../../common/entities/request-status-history.entity';
import { RequestCategory } from '../../common/entities/request-category.entity';
import { CreateRequestDto, UpdateRequestDto, PublishRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(RequestImage)
    private readonly requestImageRepository: Repository<RequestImage>,
    @InjectRepository(RequestStatusHistory)
    private readonly requestStatusHistoryRepository: Repository<RequestStatusHistory>,
    @InjectRepository(RequestCategory)
    private readonly requestCategoryRepository: Repository<RequestCategory>,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  async createDraft(createRequestDto: CreateRequestDto, buyerId: string): Promise<Request> {
    // Validate category exists and is active
    const category = await this.requestCategoryRepository.findOne({
      where: { id: createRequestDto.categoryId, isActive: true },
    });

    if (!category) {
      throw new BadRequestException('Invalid or inactive category');
    }

    const request = this.requestRepository.create({
      ...createRequestDto,
      buyerId,
      status: RequestStatus.DRAFT,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Log status change
    await this.logStatusChange(savedRequest.id, null, RequestStatus.DRAFT, buyerId);

    return savedRequest;
  }

  async updateDraft(requestId: string, updateRequestDto: UpdateRequestDto, buyerId: string): Promise<Request> {
    const request = await this.findRequestById(requestId);

    // Validate ownership
    if (request.buyerId !== buyerId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    // Validate request is still a draft
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be updated');
    }

    // Validate category if provided
    if (updateRequestDto.categoryId) {
      const category = await this.requestCategoryRepository.findOne({
        where: { id: updateRequestDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new BadRequestException('Invalid or inactive category');
      }
    }

    await this.requestRepository.update(requestId, updateRequestDto);

    return this.findRequestById(requestId);
  }

  async publishRequest(requestId: string, publishDto: PublishRequestDto, buyerId: string): Promise<Request> {
    const request = await this.findRequestById(requestId);

    // Validate ownership
    if (request.buyerId !== buyerId) {
      throw new ForbiddenException('You can only publish your own requests');
    }

    // Validate request is a draft
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be published');
    }

    // Validate request completeness
    await this.validateRequestCompleteness(request);

    // Set expiry time
    const expiryHours = publishDto.expiryHours || this.configService.get('request.expiryHours', 72);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    // Update request status
    const publishedAt = new Date();
    await this.requestRepository.update(requestId, {
      status: RequestStatus.ACTIVE,
      publishedAt,
      expiresAt,
    });

    // Log status change
    await this.logStatusChange(requestId, RequestStatus.DRAFT, RequestStatus.ACTIVE, buyerId);

    // Publish event
    await this.rabbitMQService.publishRequestCreated(
      requestId,
      buyerId,
      request.categoryId,
      request.locationId,
      publishedAt.toISOString(),
    );

    return this.findRequestById(requestId);
  }

  async updateRequestStatus(
    requestId: string,
    updateStatusDto: UpdateRequestStatusDto,
    userId: string,
  ): Promise<Request> {
    const request = await this.findRequestById(requestId);
    const newStatus = updateStatusDto.status as RequestStatus;

    // Validate status transition
    this.validateStatusTransition(request.status, newStatus);

    // Update request status
    await this.requestRepository.update(requestId, { status: newStatus });

    // Log status change
    await this.logStatusChange(requestId, request.status, newStatus, userId, updateStatusDto.reason);

    // Publish relevant events
    await this.publishStatusEvent(requestId, request.buyerId, newStatus, updateStatusDto.reason);

    return this.findRequestById(requestId);
  }

  async getMyRequests(
    buyerId: string,
    status?: RequestStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ requests: Request[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.category', 'category')
      .leftJoinAndSelect('request.images', 'images')
      .where('request.buyerId = :buyerId', { buyerId });

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    queryBuilder
      .orderBy('request.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [requests, total] = await queryBuilder.getManyAndCount();

    return {
      requests,
      total,
      page,
      limit,
    };
  }

  async getRequestById(requestId: string, userId?: string): Promise<Request> {
    const request = await this.findRequestById(requestId);

    // If userId is provided, check ownership for draft requests
    if (userId && request.status === RequestStatus.DRAFT && request.buyerId !== userId) {
      throw new ForbiddenException('Draft requests are only visible to the owner');
    }

    return request;
  }

  async deleteRequest(requestId: string, buyerId: string): Promise<void> {
    const request = await this.findRequestById(requestId);

    // Validate ownership
    if (request.buyerId !== buyerId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    // Only allow deletion of draft requests
    if (request.status !== RequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be deleted');
    }

    await this.requestRepository.delete(requestId);
  }

  private async findRequestById(requestId: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['category', 'images', 'statusHistory'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  private async validateRequestCompleteness(request: Request): Promise<void> {
    if (!request.title || request.title.trim().length === 0) {
      throw new BadRequestException('Title is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new BadRequestException('Description is required');
    }

    if (!request.categoryId) {
      throw new BadRequestException('Category is required');
    }

    // Location validation (optional but recommended)
    if (!request.latitude || !request.longitude) {
      throw new BadRequestException('Location is required');
    }
  }

  private validateStatusTransition(currentStatus: RequestStatus, newStatus: RequestStatus): void {
    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.DRAFT]: [RequestStatus.ACTIVE, RequestStatus.CANCELLED],
      [RequestStatus.ACTIVE]: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED, RequestStatus.EXPIRED, RequestStatus.BLOCKED],
      [RequestStatus.IN_PROGRESS]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
      [RequestStatus.COMPLETED]: [],
      [RequestStatus.CANCELLED]: [],
      [RequestStatus.EXPIRED]: [],
      [RequestStatus.BLOCKED]: [RequestStatus.ACTIVE], // Admin can unblock
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async logStatusChange(
    requestId: string,
    oldStatus: RequestStatus | null,
    newStatus: RequestStatus,
    changedBy: string,
    reason?: string,
  ): Promise<void> {
    const statusHistory = this.requestStatusHistoryRepository.create({
      requestId,
      oldStatus,
      newStatus,
      changedBy,
      changeReason: reason,
    });

    await this.requestStatusHistoryRepository.save(statusHistory);
  }

  private async publishStatusEvent(
    requestId: string,
    buyerId: string,
    status: RequestStatus,
    reason?: string,
  ): Promise<void> {
    switch (status) {
      case RequestStatus.COMPLETED:
        // This would need merchantId from the accepted bid
        await this.rabbitMQService.publishRequestCompleted(requestId, buyerId, '');
        break;
      case RequestStatus.CANCELLED:
        await this.rabbitMQService.publishRequestCancelled(requestId, buyerId, reason || 'Cancelled by buyer');
        break;
      case RequestStatus.EXPIRED:
        await this.rabbitMQService.publishRequestExpired(requestId, buyerId);
        break;
      case RequestStatus.BLOCKED:
        await this.rabbitMQService.publishRequestClosed(requestId, reason || 'Blocked by admin');
        break;
    }
  }
}
