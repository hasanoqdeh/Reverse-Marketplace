import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { EventConsumerService } from './event-consumer.service';
import { MessageModule } from '../messages/message.module';
import { ConversationModule } from '../conversations/conversation.module';

@Module({
  imports: [MessageModule, ConversationModule],
  providers: [ChatGateway, EventConsumerService],
  exports: [ChatGateway],
})
export class WebSocketModule {}
