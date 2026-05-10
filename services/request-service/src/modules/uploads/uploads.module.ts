import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { RequestsModule } from '../requests/requests.module';
import { RequestImage } from '../../common/entities/request-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestImage]),
    RequestsModule,
  ],
  controllers: [UploadsController],
  providers: [],
})
export class UploadsModule {}
