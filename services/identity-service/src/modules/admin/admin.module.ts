import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AnalyticsController } from './analytics.controller';
import { AdminService } from './admin.service';
import { User } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { MerchantProfile } from '../../common/entities/merchant-profile.entity';
import { MerchantDocument } from '../../common/entities/merchant-document.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, MerchantProfile, MerchantDocument]), AuthModule],
  controllers: [AdminController, AnalyticsController],
  providers: [AdminService],
})
export class AdminModule {}
