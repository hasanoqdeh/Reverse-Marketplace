import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
export declare class RedisModule {
    static forRoot(): {
        module: typeof RedisModule;
        providers: (typeof RedisService | {
            provide: string;
            useFactory: (configService: ConfigService) => Promise<any>;
            inject: (typeof ConfigService)[];
        })[];
        exports: (string | typeof RedisService)[];
    };
}
