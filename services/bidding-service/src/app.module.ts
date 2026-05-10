import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongodbModule } from './infrastructure/mongodb/mongodb.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { BidModule } from './modules/bids/bid.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    MongodbModule,
    RedisModule.forRoot(),
    RabbitMQModule.forRoot(),
    BidModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
