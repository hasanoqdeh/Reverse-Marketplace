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
const cassandra_module_1 = require("./infrastructure/cassandra/cassandra.module");
const redis_module_1 = require("./infrastructure/redis/redis.module");
const rabbitmq_module_1 = require("./infrastructure/rabbitmq/rabbitmq.module");
const storage_module_1 = require("./infrastructure/storage/storage.module");
const conversation_module_1 = require("./modules/conversations/conversation.module");
const message_module_1 = require("./modules/messages/message.module");
const websocket_module_1 = require("./modules/websocket/websocket.module");
const upload_module_1 = require("./modules/uploads/upload.module");
const configuration_1 = require("./config/configuration");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: ['.env.local', '.env'],
            }),
            cassandra_module_1.CassandraModule,
            redis_module_1.RedisModule.forRoot(),
            rabbitmq_module_1.RabbitMQModule.forRoot(),
            storage_module_1.StorageModule.forRoot(),
            conversation_module_1.ConversationModule,
            message_module_1.MessageModule,
            websocket_module_1.WebSocketModule,
            upload_module_1.UploadModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map