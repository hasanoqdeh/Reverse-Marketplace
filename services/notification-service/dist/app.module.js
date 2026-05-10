"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const notification_module_1 = require("./modules/notifications/notification.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const postgres_module_1 = require("./infrastructure/postgres/postgres.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const rabbitmq_module_1 = require("./infrastructure/rabbitmq/rabbitmq.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            postgres_module_1.PostgresModule,
            redis_module_1.RedisModule,
            rabbitmq_module_1.RabbitMQModule,
            notification_module_1.NotificationModule,
            websocket_module_1.WebSocketModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map