import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3003;
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Health check endpoint - properly implemented
  app.use('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      service: 'bidding-service',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      performance: {
        bidExpiryHours: configService.get('bidding.bidExpiryHours'),
        maxBidImages: configService.get('bidding.maxBidImages'),
      }
    });
  });
  
  await app.listen(port);
  console.log(`Bidding Service is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
}

bootstrap();
