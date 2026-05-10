import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { 
  Message, 
  MessageType, 
  DeliveryStatus,
  CreateMessageDto,
  MessageModel,
  MessageDeliveryStatus 
} from '../../infrastructure/cassandra/models/message.model';
import { ConversationService } from '../conversations/conversation.service';

@Injectable()
export class MessageService {
  constructor(
    @Inject('CASSANDRA_CLIENT') private readonly cassandraClient: any,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly conversationService: ConversationService,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(data: CreateMessageDto, senderId?: string): Promise<Message> {
    // Use sender_id from DTO if provided, otherwise use the parameter
    const actualSenderId = data.sender_id || senderId;
    
    if (!actualSenderId) {
      throw new Error('Sender ID is required');
    }

    // Validate message content
    const validation = MessageModel.validateMessageContent(data);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Check rate limiting
    const rateLimitValid = await this.redisService.checkMessageRateLimit(actualSenderId);
    if (!rateLimitValid) {
      throw new Error('Message rate limit exceeded');
    }

    // Verify user has access to conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      data.conversation_id,
      actualSenderId,
    );
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    // Sanitize text content
    if (data.text) {
      data.text = MessageModel.sanitizeText(data.text);
    }

    const message = MessageModel.create({
      ...data,
      sender_id: actualSenderId,
    });

    try {
      // Insert message into Cassandra
      await this.cassandraClient.execute(
        MessageModel.queries.insert,
        [
          message.conversation_id,
          message.message_id,
          message.sender_id,
          message.message_type,
          message.text,
          message.media_url,
          message.is_read,
          message.created_at,
        ],
        { prepare: true },
      );

      // Update user conversation tracking
      await this.updateUserConversations(message);

      // Mark message as processed (for deduplication)
      await this.redisService.markMessageAsProcessed(message.message_id.toString());

      // Publish message sent event
      await this.rabbitMQService.publishMessageSent(
        message.message_id.toString(),
        message.conversation_id,
        message.sender_id,
        message.message_type,
      );

      // Emit real-time message to conversation room
      await this.emitMessageToConversation(message);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    beforeTime?: Date,
  ): Promise<Message[]> {
    // Verify user has access to conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      conversationId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    try {
      let query, params;

      if (beforeTime) {
        query = MessageModel.queries.selectByConversationIdWithPagination;
        params = [conversationId, beforeTime, limit];
      } else {
        query = MessageModel.queries.selectByConversationId;
        params = [conversationId, limit];
      }

      const result = await this.cassandraClient.execute(query, params, {
        prepare: true,
      });

      return result.rows;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  async markMessageAsRead(
    messageId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      // First, get the message to verify access
      const message = await this.getMessageById(messageId, userId);
      if (!message) {
        return false;
      }

      // Don't mark own messages as read
      if (message.sender_id === userId) {
        return false;
      }

      // Update read status in Cassandra
      await this.cassandraClient.execute(
        MessageModel.queries.updateReadStatus,
        [true, message.conversation_id, message.created_at, message.message_id],
        { prepare: true },
      );

      // Update delivery status
      await this.updateDeliveryStatus(
        message.conversation_id,
        message.message_id,
        userId,
        DeliveryStatus.DELIVERED,
      );

      // Reset unread count for user
      await this.redisService.resetUnreadCount(userId, message.conversation_id);

      // Publish message read event
      await this.rabbitMQService.publishMessageRead(
        messageId,
        message.conversation_id,
        userId,
      );

      // Emit read receipt to conversation
      await this.emitReadReceipt(message.conversation_id, messageId, userId);

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  async markAllMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    // Verify user has access to conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      conversationId,
      userId,
    );
    if (!hasAccess) {
      throw new Error('Access denied to conversation');
    }

    try {
      // Mark all unread messages as read
      await this.cassandraClient.execute(
        MessageModel.queries.markConversationRead,
        [conversationId, userId],
        { prepare: true },
      );

      // Reset unread count
      await this.redisService.resetUnreadCount(userId, conversationId);

      // Get total unread count before reset
      const totalUnread = await this.redisService.getTotalUnreadCount(userId);

      return totalUnread;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      return 0;
    }
  }

  async getUnreadCount(userId: string, conversationId?: string): Promise<number> {
    if (conversationId) {
      return await this.redisService.getUnreadCount(userId, conversationId);
    } else {
      return await this.redisService.getTotalUnreadCount(userId);
    }
  }

  async getMessageById(messageId: string, userId: string): Promise<Message | null> {
    // This is a simplified implementation
    // In practice, you'd need to query by conversation_id and message_id
    // For now, we'll return null as this would need more complex query logic
    return null;
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    // This would implement soft delete functionality
    // Messages are immutable after delivery, so this would be a soft delete
    console.log(`Soft delete requested for message ${messageId} by user ${userId}`);
    return true;
  }

  private async updateUserConversations(message: Message): Promise<void> {
    // Get conversation participants
    const participants = await this.conversationService.getConversationParticipants(
      message.conversation_id,
    );

    // Update last message time for all participants
    for (const participantId of participants) {
      // Increment unread count for non-senders
      if (participantId !== message.sender_id) {
        await this.redisService.incrementUnreadCount(
          participantId,
          message.conversation_id,
        );
      }
    }
  }

  private async updateDeliveryStatus(
    conversationId: string,
    messageId: any,
    deliveredTo: string,
    status: DeliveryStatus,
  ): Promise<void> {
    const deliveryStatus = MessageModel.createDeliveryStatus(
      conversationId,
      messageId,
      deliveredTo,
      status,
    );

    await this.cassandraClient.execute(
      MessageModel.queries.insertDeliveryStatus,
      [
        deliveryStatus.conversation_id,
        deliveryStatus.message_id,
        deliveryStatus.delivered_to,
        deliveryStatus.status,
        deliveryStatus.updated_at,
      ],
      { prepare: true },
    );
  }

  private async emitMessageToConversation(message: Message): Promise<void> {
    // This would emit the message to the Socket.io room
    // Implementation would depend on the WebSocket gateway
    const roomKey = `conversation:${message.conversation_id}`;
    const messageData = {
      type: 'new_message',
      data: message,
    };

    await this.redisService.publishToChannel(roomKey, messageData);
  }

  private async emitReadReceipt(
    conversationId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    // This would emit read receipt to the Socket.io room
    const roomKey = `conversation:${conversationId}`;
    const readReceiptData = {
      type: 'message_read',
      data: {
        messageId,
        userId,
        timestamp: new Date().toISOString(),
      },
    };

    await this.redisService.publishToChannel(roomKey, readReceiptData);
  }

  async cleanupExpiredMessages(): Promise<void> {
    // This would be called by a scheduled job
    const retentionDays = this.configService.get('chat.messageRetentionDays', 365);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    console.log(`Cleaning up messages older than ${cutoffDate}`);
    // Implementation would depend on specific cleanup needs
  }
}
