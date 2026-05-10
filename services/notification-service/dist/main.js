"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') || 3004;
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Notification Service API')
        .setDescription('Real-time notifications and push notification delivery service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.getHttpServer().on('request', (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'notification-service',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                port: port,
                features: {
                    websockets: true,
                    pushNotifications: true,
                    eventConsumption: true,
                }
            }));
        }
    });
    await app.listen(port);
    console.log(`Notification Service is running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
    console.log(`API Documentation: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map