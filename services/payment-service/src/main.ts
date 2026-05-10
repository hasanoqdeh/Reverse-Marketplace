import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3006;
  
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
    .setTitle('Payment Service API')
    .setDescription('Wallet system, subscriptions, and payment processing service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Health check endpoint
  app.getHttpServer().on('request', (req: any, res: any) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        service: 'payment-service',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        port: port,
        features: {
          wallets: true,
          transactions: true,
          subscriptions: true,
          paymentGateways: true,
          doubleEntryAccounting: true,
        }
      }));
    }
  });
  
  await app.listen(port);
  console.log(`Payment Service is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`API Documentation: http://localhost:${port}/api`);
}

bootstrap();
