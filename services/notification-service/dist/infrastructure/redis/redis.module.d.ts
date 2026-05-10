import { RedisService } from './redis.service';
export declare class RedisModule {
    static forRoot(): {
        module: typeof RedisModule;
        providers: (typeof RedisService)[];
        exports: (typeof RedisService)[];
    };
}
