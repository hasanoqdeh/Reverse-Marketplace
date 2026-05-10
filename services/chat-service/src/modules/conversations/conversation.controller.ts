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
import { ConversationService } from './conversation.service';
import { ConversationStatus } from '../../infrastructure/cassandra/models/conversation.model';

@Controller('chat/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  async getUserConversations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const result = await this.conversationService.getUserConversations(
      userId,
      page,
      limit,
    );
    
    return {
      data: result,
    };
  }

  @Get(':id')
  async getConversation(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const conversation = await this.conversationService.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Check if user has access to this conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      conversationId,
      userId,
    );
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    return {
      data: conversation,
    };
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveConversation(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const success = await this.conversationService.archiveConversation(
      conversationId,
      userId,
    );
    
    if (!success) {
      throw new Error('Failed to archive conversation');
    }

    return {
      message: 'Conversation archived successfully',
    };
  }

  @Patch(':id/block')
  @HttpCode(HttpStatus.OK)
  async blockConversation(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    const success = await this.conversationService.blockConversation(
      conversationId,
      userId,
    );
    
    if (!success) {
      throw new Error('Failed to block conversation');
    }

    return {
      message: 'Conversation blocked successfully',
    };
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.OK)
  async closeConversation(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    const success = await this.conversationService.closeConversation(conversationId);
    
    if (!success) {
      throw new Error('Failed to close conversation');
    }

    return {
      message: 'Conversation closed successfully',
    };
  }

  @Get(':id/participants')
  async getConversationParticipants(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'user-placeholder';
    
    // Check if user has access to this conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      conversationId,
      userId,
    );
    
    if (!hasAccess) {
      throw new Error('Access denied');
    }

    const participants = await this.conversationService.getConversationParticipants(
      conversationId,
    );

    return {
      data: { participants },
    };
  }
}
