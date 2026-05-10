#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SeedRunner } from './seed-runner';
import { AppModule } from '../app.module';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const seedRunner = new SeedRunner(configService);
  
  try {
    await seedRunner.runSeeds();
    console.log('🎉 Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
