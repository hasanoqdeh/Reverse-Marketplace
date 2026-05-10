#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MigrationRunner } from './migration-runner';
import { AppModule } from '../app.module';

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);
  const migrationRunner = new MigrationRunner(configService);
  
  try {
    await migrationRunner.runMigrations();
    console.log('🎉 Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

const command = process.argv[2];

switch (command) {
  case 'migration:run':
    runMigrations();
    break;
  default:
    console.log('Usage: npm run migration:run');
    process.exit(1);
}
