import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {
  static forRoot() {
    return {
      module: S3Module,
      providers: [
        {
          provide: 'S3_CLIENT',
          useFactory: (configService: ConfigService) => {
            const AWS = require('aws-sdk');
            
            const s3 = new AWS.S3({
              accessKeyId: configService.get('aws.accessKeyId'),
              secretAccessKey: configService.get('aws.secretAccessKey'),
              region: configService.get('aws.region'),
            });

            return s3;
          },
          inject: [ConfigService],
        },
        S3Service,
      ],
      exports: ['S3_CLIENT', S3Service],
    };
  }
}
