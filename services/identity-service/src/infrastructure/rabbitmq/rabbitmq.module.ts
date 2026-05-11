import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';

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
              heartbeat: 60,
              reconnect: true,
              reconnectBackoffStrategy: 'linear',
              timeout: 20000,
            });

            connection.on('error', (err) => {
              console.error('RabbitMQ Connection Error', err);
            });

            connection.on('close', () => {
              console.log('RabbitMQ Connection Closed');
            });

            connection.on('connected', () => {
              console.log('RabbitMQ Connected');
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
