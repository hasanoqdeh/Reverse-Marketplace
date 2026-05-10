import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService, DomainEvent } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { ConversationService } from '../conversations/conversation.service';
import { MessageService } from '../messages/message.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { MessageType } from '../../infrastructure/cassandra/models/message.model';
import { ConversationStatus } from '../../infrastructure/cassandra/models/conversation.model';

@Injectable()
export class EventConsumerService implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.setupEventConsumers();
  }

  private async setupEventConsumers(): Promise<void> {
    // Consume bid.accepted events to create conversations
    await this.rabbitMQService.consumeEvents(
      'chat-service.bid-events',
      ['bid.accepted'],
      this.handleBidAccepted.bind(this),
    );

    // Consume request lifecycle events
    await this.rabbitMQService.consumeEvents(
      'chat-service.request-events',
      ['request.completed', 'request.cancelled', 'request.closed'],
      this.handleRequestLifecycleEvent.bind(this),
    );

    // Consume user management events
    await this.rabbitMQService.consumeEvents(
      'chat-service.user-events',
      ['user.banned', 'user.deleted'],
      this.handleUserManagementEvent.bind(this),
    );

    console.log('Chat Service event consumers initialized');
  }

  private async handleBidAccepted(event: DomainEvent): Promise<void> {
    try {
      const { requestId, buyerId, merchantId } = event.data;

      console.log(`Creating conversation for accepted bid: ${event.aggregateId}`);

      // Create conversation when bid is accepted
      const conversation = await this.conversationService.createConversation({
        request_id: requestId,
        buyer_id: buyerId,
        merchant_id: merchantId,
      });

      // Send system message to conversation
      await this.messageService.sendMessage({
        conversation_id: conversation.conversation_id,
        message_type: MessageType.SYSTEM,
        text: 'Conversation started. You can now chat with the merchant.',
      }, 'system');

      console.log(`Conversation created: ${conversation.conversation_id}`);
    } catch (error) {
      console.error('Error handling bid.accepted event:', error);
    }
  }

  private async handleRequestLifecycleEvent(event: DomainEvent): Promise<void> {
    try {
      const { requestId } = event.data;

      // Find conversation associated with this request
      const conversation = await this.conversationService.findByRequestId(requestId);
      
      if (!conversation) {
        console.log(`No conversation found for request: ${requestId}`);
        return;
      }

      let statusMessage = '';
      let shouldClose = false;

      switch (event.eventType) {
        case 'request.completed':
          statusMessage = 'Request has been completed. Thank you for using our service!';
          shouldClose = true;
          break;
        case 'request.cancelled':
          statusMessage = 'Request has been cancelled by the buyer.';
          shouldClose = true;
          break;
        case 'request.closed':
          statusMessage = 'Request has been closed by the system.';
          shouldClose = true;
          break;
      }

      // Send system message
      await this.messageService.sendMessage({
        conversation_id: conversation.conversation_id,
        message_type: MessageType.SYSTEM,
        text: statusMessage,
      }, 'system');

      // Close conversation if needed
      if (shouldClose) {
        await this.conversationService.closeConversation(conversation.conversation_id);
      }

      console.log(`Processed request lifecycle event: ${event.eventType} for conversation: ${conversation.conversation_id}`);
    } catch (error) {
      console.error(`Error handling ${event.eventType} event:`, error);
    }
  }

  private async handleUserManagementEvent(event: DomainEvent): Promise<void> {
    try {
      const { userId } = event.data;

      if (event.eventType === 'user.banned') {
        // Disconnect all active sockets for banned user
        const socketIds = await this.redisService.getUserSocketIds(userId);
        
        // This would need to be implemented to disconnect sockets across all nodes
        for (const socketId of socketIds) {
          console.log(`Should disconnect socket ${socketId} for banned user ${userId}`);
          // Implementation would depend on the socket.io server instance
        }

        // Block user from messaging
        await this.blockUserFromMessaging(userId);

        console.log(`User ${userId} banned and blocked from messaging`);
      } else if (event.eventType === 'user.deleted') {
        // Clean up user data
        await this.cleanupUserData(userId);
        console.log(`Cleaned up data for deleted user ${userId}`);
      }
    } catch (error) {
      console.error(`Error handling ${event.eventType} event:`, error);
    }
  }

  private async blockUserFromMessaging(userId: string): Promise<void> {
    // This would implement user blocking logic
    // Could involve setting a flag in Redis or database
    await this.redisService.setUserOffline(userId);
    
    // Store blocked status
    const blockedKey = `blocked:${userId}`;
    await this.redisService['client'].setEx(blockedKey, 86400 * 365, 'true'); // 1 year
  }

  private async cleanupUserData(userId: string): Promise<void> {
    // Get all user conversations
    const userConversations = await this.conversationService.getUserConversations(userId, 1, 1000);
    
    // Archive all conversations
    for (const conversation of userConversations.conversations) {
      await this.conversationService.updateConversationStatus(
        conversation.conversation_id,
        ConversationStatus.ARCHIVED,
      );
    }

    // Clean up Redis data
    await this.redisService.removeSocketConnection(userId, 'all');
    await this.redisService.setUserOffline(userId);
    
    // Remove from all conversation rooms
    for (const conversation of userConversations.conversations) {
      await this.redisService.removeFromConversationRoom(
        conversation.conversation_id,
        userId,
      );
    }
  }

  // Handle chat-specific events from other services
  async handleChatMessageSent(event: DomainEvent): Promise<void> {
    try {
      const { conversationId, senderId, messageType } = event.data;
      
      // Update conversation activity
      const participants = await this.conversationService.getConversationParticipants(
        conversationId,
      );
      
      // Increment unread count for non-senders
      for (const participantId of participants) {
        if (participantId !== senderId) {
          await this.redisService.incrementUnreadCount(participantId, conversationId);
        }
      }

      // Notify online participants via Redis pub/sub
      const roomKey = `conversation:${conversationId}`;
      await this.redisService.publishToChannel(roomKey, {
        type: 'message_sent',
        data: event.data,
      });
    } catch (error) {
      console.error('Error handling chat.message.sent event:', error);
    }
  }

  async handleChatMessageRead(event: DomainEvent): Promise<void> {
    try {
      const { messageId, conversationId, userId } = event.data;
      
      // Update read status
      await this.redisService.resetUnreadCount(userId, conversationId);
      
      // Notify other participants
      const roomKey = `conversation:${conversationId}`;
      await this.redisService.publishToChannel(roomKey, {
        type: 'message_read',
        data: event.data,
      });
    } catch (error) {
      console.error('Error handling chat.message.read event:', error);
    }
  }

  async handleChatUserTyping(event: DomainEvent): Promise<void> {
    try {
      const { conversationId, userId, isTyping } = event.data;
      
      // Update typing indicator
      await this.redisService.setUserTyping(conversationId, userId, isTyping);
      
      // Notify other participants
      const roomKey = `conversation:${conversationId}`;
      await this.redisService.publishToChannel(roomKey, {
        type: 'user_typing',
        data: event.data,
      });
    } catch (error) {
      console.error('Error handling chat.user.typing event:', error);
    }
  }

  async handleChatUserOnline(event: DomainEvent): Promise<void> {
    try {
      const { userId, isOnline } = event.data;
      
      // Update presence
      if (isOnline) {
        await this.redisService.setUserOnline(userId, 'system');
      } else {
        await this.redisService.setUserOffline(userId);
      }
      
      // Notify relevant users
      const userConversations = await this.conversationService.getUserConversations(userId, 1, 50);
      
      for (const conversation of userConversations.conversations) {
        const participants = await this.conversationService.getConversationParticipants(
          conversation.conversation_id,
        );
        
        for (const participantId of participants) {
          if (participantId !== userId) {
            const userRoomKey = `user:${participantId}`;
            await this.redisService.publishToChannel(userRoomKey, {
              type: 'user_presence_updated',
              data: { userId, isOnline },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling chat.user.online event:', error);
    }
  }
}
