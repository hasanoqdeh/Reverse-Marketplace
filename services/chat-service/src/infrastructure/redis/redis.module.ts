import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

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
              db: configService.get('redis.db'),
              retryDelayOnFailover: 100,
              maxRetriesPerRequest: 3,
              lazyConnect: true,
            });

            client.on('error', (err: any) => {
              console.error('Redis Client Error', err);
            });

            client.on('connect', () => {
              console.log('Redis Client Connected');
            });

            client.on('ready', () => {
              console.log('Redis Client Ready');
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
