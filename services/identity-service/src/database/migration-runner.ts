import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export class MigrationRunner {
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
      console.log('🔄 Initializing database connection...');
      await this.dataSource.initialize();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      await this.initialize();
      console.log('🔄 Running database migrations...');
      
      // Check if schema_version table exists
      const schemaVersionExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'schema_version'
        );
      `);

      if (!schemaVersionExists[0].exists) {
        console.log('📋 First run detected - creating schema version table...');
        await this.dataSource.query(`
          CREATE TABLE schema_version (
            version VARCHAR(50) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT
          );
        `);
        
        // Mark initial schema
        await this.dataSource.query(`
          INSERT INTO schema_version (version, description) VALUES ('1.0.0', 'Initial schema via migration runner')
        `);
        
        console.log('✅ Initial schema version tracking created');
      } else {
        console.log('🔄 Schema version table exists - migrations already applied');
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      await this.dataSource.destroy();
    }
  }

  async checkMigrationStatus(): Promise<boolean> {
    try {
      await this.initialize();
      const result = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM schema_version
      `);
      await this.dataSource.destroy();
      return parseInt(result[0].count) > 0;
    } catch (error) {
      console.log('📋 No schema version table found - first run expected');
      try {
        await this.dataSource.destroy();
      } catch {}
      return false;
    }
  }
}
