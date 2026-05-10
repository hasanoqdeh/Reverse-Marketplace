import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { S3Module } from './infrastructure/s3/s3.module';
import { RequestsModule } from './modules/requests/requests.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { Request } from './common/entities/request.entity';
import { RequestImage } from './common/entities/request-image.entity';
import { RequestCategory } from './common/entities/request-category.entity';
import { RequestStatusHistory } from './common/entities/request-status-history.entity';
import { RequestView } from './common/entities/request-view.entity';
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
        entities: [Request, RequestImage, RequestCategory, RequestStatusHistory, RequestView],
        synchronize: configService.get('nodeEnv') === 'development',
        logging: configService.get('nodeEnv') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule.forRoot(),
    S3Module.forRoot(),
    RequestsModule,
    UploadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
