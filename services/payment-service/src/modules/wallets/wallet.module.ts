import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletEventConsumerService } from './event-consumer.service';
import { WalletController, AdminWalletController } from './wallet.controller';
import { Wallet } from '../../common/entities/wallet.entity';
import { WalletTransaction } from '../../common/entities/wallet-transaction.entity';
import { PostgresModule } from '../../infrastructure/postgres/postgres.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    PostgresModule,
    RedisModule,
    RabbitMQModule,
    TypeOrmModule.forFeature([Wallet, WalletTransaction]),
  ],
  controllers: [WalletController, AdminWalletController],
  providers: [WalletService, WalletEventConsumerService],
  exports: [WalletService],
})
export class WalletModule {}
