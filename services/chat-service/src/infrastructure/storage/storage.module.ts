import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {
  static forRoot() {
    return {
      module: StorageModule,
      providers: [
        {
          provide: 'S3_CLIENT',
          useFactory: (configService: ConfigService) => {
            const AWS = require('aws-sdk');
            
            const s3Config: any = {
              accessKeyId: configService.get('storage.s3.accessKeyId'),
              secretAccessKey: configService.get('storage.s3.secretAccessKey'),
              region: configService.get('storage.s3.region'),
            };

            // Add custom endpoint if provided (for S3-compatible services)
            if (configService.get('storage.s3.endpoint')) {
              s3Config.endpoint = configService.get('storage.s3.endpoint');
              s3Config.s3ForcePathStyle = true;
            }

            return new AWS.S3(s3Config);
          },
          inject: [ConfigService],
        },
        StorageService,
      ],
      exports: ['S3_CLIENT', StorageService],
    };
  }
}
