"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const notification_token_entity_1 = require("../../common/entities/notification-token.entity");
const notification_entity_1 = require("../../common/entities/notification.entity");
const notification_delivery_log_entity_1 = require("../../common/entities/notification-delivery-log.entity");
const socket_session_entity_1 = require("../../common/entities/socket-session.entity");
let PostgresModule = class PostgresModule {
};
exports.PostgresModule = PostgresModule;
exports.PostgresModule = PostgresModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    entities: [notification_token_entity_1.NotificationToken, notification_entity_1.Notification, notification_delivery_log_entity_1.NotificationDeliveryLog, socket_session_entity_1.SocketSession],
                    synchronize: configService.get('database.synchronize', false),
                    logging: configService.get('database.logging', false),
                    ssl: configService.get('database.ssl', false),
                    extra: {
                        max: configService.get('database.maxConnections', 20),
                        connectionTimeoutMillis: configService.get('database.connectionTimeout', 10000),
                        idleTimeoutMillis: configService.get('database.idleTimeout', 30000),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([
                notification_token_entity_1.NotificationToken,
                notification_entity_1.Notification,
                notification_delivery_log_entity_1.NotificationDeliveryLog,
                socket_session_entity_1.SocketSession,
            ]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], PostgresModule);
//# sourceMappingURL=postgres.module.js.map