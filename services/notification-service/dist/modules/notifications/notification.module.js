"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_service_1 = require("./notification.service");
const event_consumer_service_1 = require("./event-consumer.service");
const notification_controller_1 = require("./notification.controller");
const notification_entity_1 = require("../../common/entities/notification.entity");
const notification_delivery_log_entity_1 = require("../../common/entities/notification-delivery-log.entity");
const postgres_module_1 = require("../../infrastructure/postgres/postgres.module");
const redis_module_1 = require("../../infrastructure/redis/redis.module");
const rabbitmq_module_1 = require("../../infrastructure/rabbitmq/rabbitmq.module");
const websocket_module_1 = require("../websocket/websocket.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            postgres_module_1.PostgresModule,
            redis_module_1.RedisModule,
            rabbitmq_module_1.RabbitMQModule,
            websocket_module_1.WebSocketModule,
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification, notification_delivery_log_entity_1.NotificationDeliveryLog]),
        ],
        controllers: [notification_controller_1.NotificationController, notification_controller_1.AdminNotificationController],
        providers: [notification_service_1.NotificationService, event_consumer_service_1.EventConsumerService],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map