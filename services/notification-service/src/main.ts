import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3004;
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('Real-time notifications and push notification delivery service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Health check endpoint - properly implemented
  app.use('/health', (req, res) => {
    res.status(200).json({ 
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
    });
  });
  
  await app.listen(port);
  console.log(`Notification Service is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API Documentation: http://localhost:${port}/api`);
}

bootstrap();
