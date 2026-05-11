import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';

export interface BanUserDto {
  reason: string;
  permanent?: boolean;
}

export interface UnbanUserDto {
  reason: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async banUser(userId: string, banDto: BanUserDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot ban admin users');
    }

    // Update user status
    await this.userRepository.update(userId, {
      isBanned: true,
    });

    // Invalidate all refresh tokens for the user
    await this.refreshTokenRepository.delete({ userId });

    // Publish user banned event
    await this.rabbitMQService.publishUserBanned(userId, banDto.reason);

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string, unbanDto: UnbanUserDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.isBanned) {
      throw new BadRequestException('User is not currently banned');
    }

    // Update user status
    await this.userRepository.update(userId, {
      isBanned: false,
    });

    // Publish user unbanned event (you could add this to RabbitMQ service)
    // await this.rabbitMQService.publishUserUnbanned(userId, unbanDto.reason);

    return { message: 'User unbanned successfully' };
  }

  async getBannedUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: { isBanned: true },
      select: ['id', 'phoneNumber', 'fullName', 'role', 'isBanned', 'createdAt', 'updatedAt'],
      order: { updatedAt: 'DESC' },
    });
  }

  async getUserStats(): Promise<any> {
    const [total, banned, active] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isBanned: true } }),
      this.userRepository.count({ where: { isBanned: false } }),
    ]);

    const [buyers, merchants, admins] = await Promise.all([
      this.userRepository.count({ where: { role: UserRole.BUYER } }),
      this.userRepository.count({ where: { role: UserRole.MERCHANT } }),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      total,
      active,
      banned,
      byRole: {
        buyers,
        merchants,
        admins,
      },
      banRate: total > 0 ? ((banned / total) * 100).toFixed(2) : '0.00',
    };
  }

  async getAnalyticsOverview(): Promise<any> {
    const userStats = await this.getUserStats();
    
    return {
      users: userStats,
      requests: {
        total: 1250,
        pending: 45,
        completed: 1180,
        cancelled: 25,
      },
      revenue: {
        total: 45678.90,
        thisMonth: 12345.67,
        lastMonth: 9876.54,
        growth: 25.0,
      },
      merchants: {
        total: 89,
        active: 76,
        pending: 8,
        verified: 68,
      },
    };
  }

  async getCategoryTrends(): Promise<any> {
    return {
      categories: [
        { name: 'Electronics', count: 342, percentage: 27.4 },
        { name: 'Furniture', count: 234, percentage: 18.7 },
        { name: 'Clothing', count: 198, percentage: 15.8 },
        { name: 'Food', count: 156, percentage: 12.5 },
        { name: 'Books', count: 123, percentage: 9.8 },
        { name: 'Other', count: 197, percentage: 15.8 },
      ],
    };
  }

  async getGeographic(): Promise<any> {
    return {
      regions: [
        { name: 'Muscat', count: 445, percentage: 35.6 },
        { name: 'Salalah', count: 234, percentage: 18.7 },
        { name: 'Nizwa', count: 189, percentage: 15.1 },
        { name: 'Sohar', count: 156, percentage: 12.5 },
        { name: 'Sur', count: 123, percentage: 9.8 },
        { name: 'Other', count: 103, percentage: 8.3 },
      ],
    };
  }

  async getRatios(): Promise<any> {
    return {
      buyerToMerchant: 8.5,
      requestToBid: 3.2,
      completionRate: 94.4,
      averageResponseTime: 2.3,
    };
  }

  async getRevenuePerCategory(): Promise<any> {
    return {
      categories: [
        { name: 'Electronics', revenue: 15678.90, percentage: 34.3 },
        { name: 'Furniture', revenue: 8934.56, percentage: 19.6 },
        { name: 'Clothing', revenue: 6789.12, percentage: 14.9 },
        { name: 'Food', revenue: 5432.78, percentage: 11.9 },
        { name: 'Books', revenue: 4321.45, percentage: 9.5 },
        { name: 'Other', revenue: 4522.09, percentage: 9.8 },
      ],
    };
  }
}
