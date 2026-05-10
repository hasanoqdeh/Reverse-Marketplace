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
}
