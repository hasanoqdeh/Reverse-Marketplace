import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export class SeedRunner {
  private dataSource: DataSource;

  constructor(configService: ConfigService) {
    this.dataSource = new DataSource({
      type: 'postgres',
      url: configService.get('database.url'),
      entities: [__dirname + '/../common/entities/*.entity.ts'],
      synchronize: false,
      logging: configService.get('nodeEnv') === 'development',
    });
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Initializing database connection for seeding...');
      await this.dataSource.initialize();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async runSeeds(): Promise<void> {
    try {
      await this.initialize();
      console.log('🌱 Running seed data...');
      
      // Check if seed data already exists
      const userCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM users'
      );
      
      if (parseInt(userCount[0].count) > 0) {
        console.log('🔄 Seed data already exists - skipping');
        return;
      }
      
      // Run idempotent seed operations
      await this.seedUsers();
      await this.seedNotificationPreferences();
      
      console.log('✅ Seed data completed successfully');
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await this.dataSource.destroy();
    }
  }

  private async seedUsers(): Promise<void> {
    console.log('👥 Seeding users...');
    
    // Use INSERT ... ON CONFLICT DO NOTHING for idempotency
    await this.dataSource.query(`
      INSERT INTO users (id, phone_number, full_name, role, is_verified, is_banned, trust_score, created_at, updated_at) VALUES 
        ('admin-001', '+966500000001', 'System Administrator', 'ADMIN', true, false, 100.0, NOW(), NOW()),
        ('admin-002', '+966500000002', 'Super Admin', 'ADMIN', true, false, 100.0, NOW(), NOW()),
        ('buyer-001', '+966511111111', 'Ahmed Mohammed', 'BUYER', true, false, 85.5, NOW(), NOW()),
        ('buyer-002', '+966522222222', 'Sarah Abdullah', 'BUYER', true, false, 92.0, NOW(), NOW()),
        ('buyer-003', '+966533333333', 'Mohammed Ali', 'BUYER', true, false, 78.5, NOW(), NOW()),
        ('buyer-004', '+966544444444', 'Fatima Hassan', 'BUYER', true, false, 88.0, NOW(), NOW()),
        ('buyer-005', '+966555555555', 'Khalid Omar', 'BUYER', true, false, 95.0, NOW(), NOW()),
        ('merchant-001', '+966511111111', 'Ali Electronics', 'MERCHANT', true, false, 92.5, NOW(), NOW()),
        ('merchant-002', '+966522222222', 'Tech Solutions', 'MERCHANT', true, false, 88.0, NOW(), NOW()),
        ('merchant-003', '+966533333333', 'Smart Phones Store', 'MERCHANT', true, false, 95.0, NOW(), NOW()),
        ('merchant-004', '+966544444444', 'Computer Parts Hub', 'MERCHANT', true, false, 87.5, NOW(), NOW()),
        ('merchant-005', '+966555555555', 'Mobile Accessories', 'MERCHANT', true, false, 82.0, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Users seeded successfully');
  }

  private async seedNotificationPreferences(): Promise<void> {
    console.log('🔔 Seeding notification preferences...');
    
    await this.dataSource.query(`
      INSERT INTO notification_preferences (id, user_id, push_enabled, sms_enabled, marketing_enabled, created_at, updated_at) VALUES
        ('np-001', 'admin-001', true, true, false, NOW(), NOW()),
        ('np-002', 'admin-002', true, true, false, NOW(), NOW()),
        ('np-003', 'buyer-001', true, true, false, NOW(), NOW()),
        ('np-004', 'buyer-002', true, true, false, NOW(), NOW()),
        ('np-005', 'buyer-003', true, true, false, NOW(), NOW()),
        ('np-006', 'buyer-004', true, true, false, NOW(), NOW()),
        ('np-007', 'buyer-005', true, true, false, NOW(), NOW()),
        ('np-008', 'merchant-001', true, true, false, NOW(), NOW()),
        ('np-009', 'merchant-002', true, true, false, NOW(), NOW()),
        ('np-010', 'merchant-003', true, true, false, NOW(), NOW()),
        ('np-011', 'merchant-004', true, true, false, NOW(), NOW()),
        ('np-012', 'merchant-005', true, true, false, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('✅ Notification preferences seeded successfully');
  }
}
