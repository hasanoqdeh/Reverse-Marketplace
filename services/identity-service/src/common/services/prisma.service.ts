import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  // This service is now handled by TypeORM repositories
  // Prisma service is deprecated in favor of TypeORM
  constructor() {
    // No initialization needed - TypeORM handles connections
  }
}
