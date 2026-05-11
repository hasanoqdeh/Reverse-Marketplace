import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AnalyticsController } from './analytics.controller';
import { AdminService } from './admin.service';
import { User } from '../../common/entities/user.entity';
import { RefreshToken } from '../../common/entities/refresh-token.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), AuthModule],
  controllers: [AdminController, AnalyticsController],
  providers: [AdminService],
})
export class AdminModule {}
