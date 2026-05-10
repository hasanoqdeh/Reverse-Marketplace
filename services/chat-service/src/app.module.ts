import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CassandraModule } from './infrastructure/cassandra/cassandra.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { ConversationModule } from './modules/conversations/conversation.module';
import { MessageModule } from './modules/messages/message.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { UploadModule } from './modules/uploads/upload.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    CassandraModule,
    RedisModule.forRoot(),
    RabbitMQModule.forRoot(),
    StorageModule.forRoot(),
    ConversationModule,
    MessageModule,
    WebSocketModule,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
