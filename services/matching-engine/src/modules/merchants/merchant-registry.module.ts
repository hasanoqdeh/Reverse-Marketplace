import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantRegistryService } from './merchant-registry.service';
import { MerchantInterest } from '../../common/entities/merchant-interest.entity';
import { MerchantCoverageArea } from '../../common/entities/merchant-coverage-area.entity';
import { MerchantStatusCache } from '../../common/entities/merchant-status-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantInterest, MerchantCoverageArea, MerchantStatusCache]),
  ],
  providers: [MerchantRegistryService],
  exports: [MerchantRegistryService],
})
export class MerchantRegistryModule {}
