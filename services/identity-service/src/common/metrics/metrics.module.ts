import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
