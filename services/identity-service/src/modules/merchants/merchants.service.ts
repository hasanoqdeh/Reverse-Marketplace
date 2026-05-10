import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantProfile, VerificationStatus } from './merchant-profile.entity';
import { MerchantDocument } from '../../common/entities/merchant-document.entity';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';

export interface ApproveMerchantDto {
  rejectionReason?: string;
}

export interface RejectMerchantDto {
  rejectionReason: string;
}

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(MerchantProfile)
    private readonly merchantProfileRepository: Repository<MerchantProfile>,
    @InjectRepository(MerchantDocument)
    private readonly merchantDocumentRepository: Repository<MerchantDocument>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async getPendingMerchants(): Promise<MerchantProfile[]> {
    return this.merchantProfileRepository.find({
      where: { verificationStatus: VerificationStatus.PENDING },
      relations: ['documents'],
      order: { createdAt: 'ASC' },
    });
  }

  async getMerchantById(id: string): Promise<MerchantProfile> {
    const merchant = await this.merchantProfileRepository.findOne({
      where: { id },
      relations: ['documents', 'user'],
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    return merchant;
  }

  async approveMerchant(id: string, approveDto: ApproveMerchantDto): Promise<{ message: string }> {
    const merchant = await this.getMerchantById(id);

    if (merchant.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException('Merchant is not in pending status');
    }

    // Update merchant status
    await this.merchantProfileRepository.update(id, {
      verificationStatus: VerificationStatus.APPROVED,
    });

    // Publish merchant verified event
    await this.rabbitMQService.publishMerchantVerified(merchant.userId, merchant.businessName);

    return { message: 'Merchant approved successfully' };
  }

  async rejectMerchant(id: string, rejectDto: RejectMerchantDto): Promise<{ message: string }> {
    if (!rejectDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const merchant = await this.getMerchantById(id);

    if (merchant.verificationStatus !== VerificationStatus.PENDING) {
      throw new BadRequestException('Merchant is not in pending status');
    }

    // Update merchant status
    await this.merchantProfileRepository.update(id, {
      verificationStatus: VerificationStatus.REJECTED,
    });

    // TODO: Send notification to merchant about rejection

    return { message: 'Merchant rejected successfully' };
  }

  async getMerchantStats(): Promise<any> {
    const [pending, approved, rejected] = await Promise.all([
      this.merchantProfileRepository.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.merchantProfileRepository.count({ where: { verificationStatus: VerificationStatus.APPROVED } }),
      this.merchantProfileRepository.count({ where: { verificationStatus: VerificationStatus.REJECTED } }),
    ]);

    return {
      total: pending + approved + rejected,
      pending,
      approved,
      rejected,
      approvalRate: approved > 0 ? ((approved / (approved + rejected)) * 100).toFixed(2) : '0.00',
    };
  }
}
