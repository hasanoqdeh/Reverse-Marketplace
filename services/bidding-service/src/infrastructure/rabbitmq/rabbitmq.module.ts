import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {
  static forRoot() {
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: 'RABBITMQ_CONNECTION',
          useFactory: async (configService: ConfigService) => {
            const amqp = require('amqplib');
            
            const connection = await amqp.connect({
              hostname: configService.get('rabbitmq.host'),
              port: configService.get('rabbitmq.port'),
              username: configService.get('rabbitmq.username'),
              password: configService.get('rabbitmq.password'),
            });

            connection.on('error', (err) => {
              console.error('RabbitMQ Connection Error', err);
            });

            connection.on('close', () => {
              console.log('RabbitMQ Connection Closed');
            });

            return connection;
          },
          inject: [ConfigService],
        },
        RabbitMQService,
      ],
      exports: ['RABBITMQ_CONNECTION', RabbitMQService],
    };
  }
}
