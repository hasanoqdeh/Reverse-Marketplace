"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port') || 3005;
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.getHttpServer().on('request', (req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                service: 'chat-service',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                performance: {
                    maxMessageLength: configService.get('chat.maxMessageLength'),
                    typingTimeout: configService.get('chat.typingTimeoutSeconds'),
                }
            }));
        }
    });
    await app.listen(port);
    console.log(`Chat Service is running on port ${port}`);
    console.log(`Health check: http://localhost:${port}/health`);
}
bootstrap();
//# sourceMappingURL=main.js.map