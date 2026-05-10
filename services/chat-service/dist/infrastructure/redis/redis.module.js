"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_service_1 = require("../redis/redis.service");
let RedisModule = RedisModule_1 = class RedisModule {
    static forRoot() {
        return {
            module: RedisModule_1,
            providers: [
                {
                    provide: 'REDIS_CLIENT',
                    useFactory: async (configService) => {
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
                        client.on('error', (err) => {
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
                    inject: [config_1.ConfigService],
                },
                redis_service_1.RedisService,
            ],
            exports: ['REDIS_CLIENT', redis_service_1.RedisService],
        };
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [redis_service_1.RedisService],
        exports: [redis_service_1.RedisService],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map