import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { EventConsumerService } from './event-consumer.service';
import { NotificationController, AdminNotificationController } from './notification.controller';
import { Notification } from '../../common/entities/notification.entity';
import { NotificationDeliveryLog } from '../../common/entities/notification-delivery-log.entity';
import { PostgresModule } from '../../infrastructure/postgres/postgres.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { RabbitMQModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    PostgresModule,
    RedisModule,
    RabbitMQModule,
    WebSocketModule,
    TypeOrmModule.forFeature([Notification, NotificationDeliveryLog]),
  ],
  controllers: [NotificationController, AdminNotificationController],
  providers: [NotificationService, EventConsumerService],
  exports: [NotificationService],
})
export class NotificationModule {}
