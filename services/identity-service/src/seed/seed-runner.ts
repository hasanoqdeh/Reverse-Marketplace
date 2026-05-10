import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../common/services/prisma.service';

async function runSeed() {
  console.log('🌱 Starting Identity Service seed...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const prismaService = app.get(PrismaService);
  
  try {
    // Import and run the seed data
    const { main } = await import('../../prisma/seed');
    await main();
    console.log('✅ Identity Service seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
