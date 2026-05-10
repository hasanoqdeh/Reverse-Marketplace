import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static forRoot() {
    return {
      module: RedisModule,
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async (configService: ConfigService) => {
            const Redis = require('redis');
            
            const client = Redis.createClient({
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              password: configService.get('redis.password') || undefined,
              retryDelayOnFailover: 100,
              enableReadyCheck: false,
              maxRetriesPerRequest: null,
            });

            client.on('error', (err) => {
              console.error('Redis Client Error', err);
            });

            client.on('connect', () => {
              console.log('Redis Client Connected');
            });

            await client.connect();
            return client;
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: ['REDIS_CLIENT', RedisService],
    };
  }
}
