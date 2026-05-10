import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationToken } from '../../common/entities/notification-token.entity';
import { Notification } from '../../common/entities/notification.entity';
import { NotificationDeliveryLog } from '../../common/entities/notification-delivery-log.entity';
import { SocketSession } from '../../common/entities/socket-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [NotificationToken, Notification, NotificationDeliveryLog, SocketSession],
        synchronize: configService.get('database.synchronize', false),
        logging: configService.get('database.logging', false),
        ssl: configService.get('database.ssl', false),
        extra: {
          max: configService.get('database.maxConnections', 20),
          connectionTimeoutMillis: configService.get('database.connectionTimeout', 10000),
          idleTimeoutMillis: configService.get('database.idleTimeout', 30000),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      NotificationToken,
      Notification,
      NotificationDeliveryLog,
      SocketSession,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class PostgresModule {}
