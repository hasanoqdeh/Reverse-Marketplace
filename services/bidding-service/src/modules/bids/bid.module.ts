import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { EventConsumerService } from './event-consumer.service';

@Module({
  controllers: [BidController],
  providers: [BidService, EventConsumerService],
  exports: [BidService],
})
export class BidModule {}
