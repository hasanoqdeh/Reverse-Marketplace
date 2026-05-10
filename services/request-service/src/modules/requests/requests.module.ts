import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { Request } from '../../common/entities/request.entity';
import { RequestImage } from '../../common/entities/request-image.entity';
import { RequestStatusHistory } from '../../common/entities/request-status-history.entity';
import { RequestCategory } from '../../common/entities/request-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, RequestImage, RequestStatusHistory, RequestCategory]),
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
