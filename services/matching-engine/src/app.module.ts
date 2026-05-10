import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { MerchantRegistryModule } from './modules/merchants/merchant-registry.module';
import { MatchingModule } from './modules/matching/matching.module';
import { MerchantInterest } from './common/entities/merchant-interest.entity';
import { MerchantCoverageArea } from './common/entities/merchant-coverage-area.entity';
import { MerchantStatusCache } from './common/entities/merchant-status-cache.entity';
import { MatchLog } from './common/entities/match-log.entity';
import { HealthController } from './common/controllers/health.controller';
import configuration from './config/configuration';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        entities: [MerchantInterest, MerchantCoverageArea, MerchantStatusCache, MatchLog],
        synchronize: configService.get('nodeEnv') === 'development',
        logging: configService.get('nodeEnv') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRoot(),
    RabbitMQModule.forRoot(),
    MerchantRegistryModule,
    MatchingModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
