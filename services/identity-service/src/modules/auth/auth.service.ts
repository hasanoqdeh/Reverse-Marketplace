import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { User, UserRole } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { NotificationPreferences } from '../../common/entities/notification-preferences.entity';
import { RequestOtpDto, VerifyOtpDto } from './dto/request-otp.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(NotificationPreferences)
    private readonly notificationPreferencesRepository: Repository<NotificationPreferences>,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  async requestOtp(requestOtpDto: RequestOtpDto): Promise<{ message: string }> {
    const { phoneNumber } = requestOtpDto;

    // Rate limiting check - max 5 OTPs per hour per phone
    const rateLimitKey = `otp_rate_limit:${phoneNumber}`;
    const currentAttempts = await this.redisService.incrementRateLimit(rateLimitKey, 3600);
    
    if (currentAttempts > 5) {
      throw new BadRequestException('Too many OTP requests. Please try again later.');
    }

    // Generate OTP
    const otp = this.generateOTP();
    const ttl = this.configService.get('otp.ttl');

    // Store OTP in Redis
    await this.redisService.setOTP(phoneNumber, otp);

    // Send SMS via RabbitMQ
    const message = `Your Reverse Marketplace OTP code is ${otp}. Valid for ${ttl / 60} minutes.`;
    await this.rabbitMQService.publishSMS(phoneNumber, message);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const { phoneNumber, otp } = verifyOtpDto;

    // Check if OTP exists and is valid
    const storedOtp = await this.redisService.getOTP(phoneNumber);
    if (!storedOtp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Delete OTP after verification
    await this.redisService.deleteOTP(phoneNumber);

    // Find or create user
    let user = await this.userRepository.findOne({ where: { phoneNumber } });
    let isNewUser = false;

    if (!user) {
      // Auto-register new user as BUYER
      user = await this.userRepository.save({
        phoneNumber,
        role: UserRole.BUYER,
        isVerified: true,
      });

      // Create default notification preferences
      await this.notificationPreferencesRepository.save({
        userId: user.id,
        pushEnabled: true,
        smsEnabled: true,
        marketingEnabled: false,
      });

      isNewUser = true;

      // Publish user registered event
      await this.rabbitMQService.publishUserRegistered(user.id, user.role);
    } else {
      // Mark existing user as verified
      if (!user.isVerified) {
        await this.userRepository.update(user.id, { isVerified: true });
        await this.rabbitMQService.publishUserVerified(user.id);
      }
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified,
        isNewUser,
      },
    };
  }

  async refreshToken(refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Find refresh token in database
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { tokenHash: await bcrypt.hash(refreshTokenString, 10) },
      relations: ['user'],
    });

    if (!refreshTokenEntity || refreshTokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.refreshTokenRepository.delete(refreshTokenEntity.id);

    // Generate new tokens
    const accessToken = this.generateAccessToken(refreshTokenEntity.user);
    const newRefreshToken = await this.generateRefreshToken(refreshTokenEntity.user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshTokenString: string): Promise<{ message: string }> {
    const tokenHash = await bcrypt.hash(refreshTokenString, 10);
    await this.refreshTokenRepository.delete({ tokenHash });
    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenRepository.delete({ userId });
    return { message: 'Logged out from all devices successfully' };
  }

  private generateOTP(): string {
    const length = this.configService.get('otp.length');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp.padEnd(length, '0').slice(0, length);
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isVerified: user.isVerified,
    };

    return jwt.sign(payload, this.configService.get('jwt.secret'), {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      this.configService.get('jwt.refreshSecret'),
      { expiresIn: this.configService.get('jwt.refreshExpiresIn') },
    );

    // Hash and store in database
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return refreshToken;
  }

  async validateToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.configService.get('jwt.secret'));
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
