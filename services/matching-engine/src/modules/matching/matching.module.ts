import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { EventConsumerService } from './event-consumer.service';
import { MatchLog } from '../../common/entities/match-log.entity';
import { MerchantRegistryModule } from '../merchants/merchant-registry.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchLog]),
    MerchantRegistryModule,
  ],
  providers: [MatchingService, EventConsumerService],
  exports: [MatchingService],
})
export class MatchingModule {}
