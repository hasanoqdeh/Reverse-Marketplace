import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [RedisModule, RabbitMQModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class WebSocketModule {}
