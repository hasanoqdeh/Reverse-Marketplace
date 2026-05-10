import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { APP_FILTER } from '@nestjs/core';
import { NotificationModule } from './modules/notifications/notification.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { PostgresModule } from './infrastructure/postgres/postgres.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PostgresModule,
    RedisModule,
    RabbitMQModule,
    NotificationModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
