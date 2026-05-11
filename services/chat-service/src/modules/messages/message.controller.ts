import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageType } from '../../infrastructure/cassandra/models/message.model';

export class SendMessageDto {
  conversation_id: string;
  message_type: MessageType;
  text?: string;
  media_url?: string;
}

export class MarkMessageReadDto {
  message_id: string;
}

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('chat/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: any,
  ) {
    const senderId = req.user?.sub || 'user-placeholder';
    
    // Create proper CreateMessageDto with sender_id
    const createMessageDto = {
      ...sendMessageDto,
      sender_id: senderId,
    };
    
    const message = await this.messageService.sendMessage(createMessageDto);
    
    return {
      data: message,
      message: 'Message sent successfully',
    };
  }

  @Get('chat/messages/conversation/:conversationId')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
    @Query('limit') limit: number = 50,
    @Query('before') before?: string,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const beforeTime = before ? new Date(before) : undefined;
    
    const messages = await this.messageService.getConversationMessages(
      conversationId,
      userId,
      limit,
      beforeTime,
    );
    
    return {
      data: { messages },
    };
  }

  @Patch('chat/messages/read')
  @HttpCode(HttpStatus.OK)
  async markMessageAsRead(
    @Body() markReadDto: MarkMessageReadDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const success = await this.messageService.markMessageAsRead(
      markReadDto.message_id,
      userId,
    );
    
    if (!success) {
      throw new Error('Failed to mark message as read');
    }
    
    return {
      message: 'Message marked as read',
    };
  }

  @Patch('chat/messages/conversation/:conversationId/read-all')
  @HttpCode(HttpStatus.OK)
  async markAllMessagesAsRead(
    @Param('conversationId') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const unreadCount = await this.messageService.markAllMessagesAsRead(
      conversationId,
      userId,
    );
    
    return {
      message: 'All messages marked as read',
      data: { unreadCount },
    };
  }

  @Get('chat/messages/unread')
  async getUnreadCount(
    @Request() req: any,
    @Query('conversationId') conversationId?: string,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const unreadCount = await this.messageService.getUnreadCount(
      userId,
      conversationId,
    );
    
    return {
      data: { unreadCount },
    };
  }

  @Get('chat/messages/:messageId')
  async getMessage(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const message = await this.messageService.getMessageById(messageId, userId);
    
    if (!message) {
      throw new Error('Message not found');
    }
    
    return {
      data: message,
    };
  }

  @Patch('chat/messages/:messageId/delete')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const success = await this.messageService.deleteMessage(messageId, userId);
    
    if (!success) {
      throw new Error('Failed to delete message');
    }
    
    return {
      message: 'Message deleted successfully',
    };
  }
}
