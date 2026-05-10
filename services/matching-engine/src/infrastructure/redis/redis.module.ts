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
            const { createClient } = require('redis');
            
            const host = configService.get('redis.host') || 'localhost';
            const port = configService.get('redis.port') || 6379;
            const password = configService.get('redis.password');
            const url = password 
              ? `redis://:${password}@${host}:${port}`
              : `redis://${host}:${port}`;

            const client = createClient({ url });

            client.on('error', (err) => {
              console.error('Redis Client Error', err);
            });

            client.on('connect', () => {
              console.log('Redis Client Connected to ' + url);
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
