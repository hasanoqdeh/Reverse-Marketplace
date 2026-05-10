import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe (disabled for now)
  // app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Landing Page Service running on port ${port}`);
}
bootstrap();
