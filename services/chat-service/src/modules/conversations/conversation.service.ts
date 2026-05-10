import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { 
  Conversation, 
  ConversationStatus, 
  CreateConversationDto, 
  UpdateConversationDto,
  ConversationModel 
} from '../../infrastructure/cassandra/models/conversation.model';

@Injectable()
export class ConversationService {
  constructor(
    @Inject('CASSANDRA_CLIENT') private readonly cassandraClient: any,
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly configService: ConfigService,
  ) {}

  async createConversation(data: CreateConversationDto): Promise<Conversation> {
    // Check if conversation already exists for this request and merchant
    const existingConversation = await this.findByRequestIdAndMerchant(
      data.request_id,
      data.merchant_id,
    );

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = ConversationModel.create(data);

    try {
      await this.cassandraClient.execute(
        ConversationModel.queries.insert,
        [
          conversation.conversation_id,
          conversation.request_id,
          conversation.buyer_id,
          conversation.merchant_id,
          conversation.status,
          conversation.created_at,
          conversation.updated_at,
        ],
        { prepare: true },
      );

      // Cache the conversation
      await this.redisService.cacheConversation(
        conversation.conversation_id,
        conversation,
      );

      // Add both users to conversation room
      await this.redisService.addToConversationRoom(
        conversation.conversation_id,
        conversation.buyer_id,
      );
      await this.redisService.addToConversationRoom(
        conversation.conversation_id,
        conversation.merchant_id,
      );

      // Initialize user conversation tracking
      await this.initializeUserConversations(conversation);

      // Publish event
      await this.rabbitMQService.publishConversationCreated(
        conversation.conversation_id,
        conversation.request_id,
        conversation.buyer_id,
        conversation.merchant_id,
      );

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async getConversationById(conversationId: string): Promise<Conversation | null> {
    // Try cache first
    const cached = await this.redisService.getCachedConversation(conversationId);
    if (cached) {
      return cached;
    }

    try {
      const result = await this.cassandraClient.execute(
        ConversationModel.queries.selectById,
        [conversationId],
        { prepare: true },
      );

      if (result.rows.length === 0) {
        return null;
      }

      const conversation = result.rows[0];
      
      // Cache the result
      await this.redisService.cacheConversation(conversationId, conversation);

      return conversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  async findByRequestId(requestId: string): Promise<Conversation | null> {
    try {
      const result = await this.cassandraClient.execute(
        ConversationModel.queries.selectByRequestId,
        [requestId],
        { prepare: true },
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error finding conversation by request ID:', error);
      return null;
    }
  }

  async findByRequestIdAndMerchant(requestId: string, merchantId: string): Promise<Conversation | null> {
    try {
      const result = await this.cassandraClient.execute(
        ConversationModel.queries.selectByParticipants,
        [merchantId, requestId], // Note: Order might need adjustment based on actual data
        { prepare: true },
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error finding conversation by request and merchant:', error);
      return null;
    }
  }

  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    conversations: Conversation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Try cache first
    const cacheKey = `user_conversations:${userId}:${page}:${limit}`;
    const cached = await this.redisService.getCachedUserConversations(userId);
    if (cached) {
      const startIndex = (page - 1) * limit;
      const paginatedConversations = cached.slice(startIndex, startIndex + limit);
      
      return {
        conversations: paginatedConversations,
        total: cached.length,
        page,
        totalPages: Math.ceil(cached.length / limit),
      };
    }

    try {
      // Get conversations where user is buyer
      const buyerResult = await this.cassandraClient.execute(
        ConversationModel.queries.selectByBuyerId,
        [userId],
        { prepare: true },
      );

      // Get conversations where user is merchant
      const merchantResult = await this.cassandraClient.execute(
        ConversationModel.queries.selectByMerchantId,
        [userId],
        { prepare: true },
      );

      // Combine and deduplicate
      const allConversations = [...buyerResult.rows, ...merchantResult.rows];
      const uniqueConversations = allConversations.filter((conv, index, self) =>
        index === self.findIndex((c) => c.conversation_id === conv.conversation_id)
      );

      // Sort by updated_at descending
      uniqueConversations.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      // Cache the result
      await this.redisService.cacheUserConversations(userId, uniqueConversations);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedConversations = uniqueConversations.slice(startIndex, startIndex + limit);

      return {
        conversations: paginatedConversations,
        total: uniqueConversations.length,
        page,
        totalPages: Math.ceil(uniqueConversations.length / limit),
      };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return {
        conversations: [],
        total: 0,
        page,
        totalPages: 0,
      };
    }
  }

  async updateConversationStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<Conversation | null> {
    try {
      const updated_at = new Date();

      await this.cassandraClient.execute(
        ConversationModel.queries.updateStatus,
        [status, updated_at, conversationId],
        { prepare: true },
      );

      // Invalidate cache
      await this.redisService.invalidateConversationCache(conversationId);

      // Get updated conversation
      const updatedConversation = await this.getConversationById(conversationId);
      
      if (updatedConversation) {
        // Update user conversation caches
        await this.redisService.invalidateUserConversationsCache(updatedConversation.buyer_id);
        await this.redisService.invalidateUserConversationsCache(updatedConversation.merchant_id);
      }

      return updatedConversation;
    } catch (error) {
      console.error('Error updating conversation status:', error);
      return null;
    }
  }

  async archiveConversation(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      return false;
    }

    // Verify user is participant
    if (conversation.buyer_id !== userId && conversation.merchant_id !== userId) {
      return false;
    }

    const updated = await this.updateConversationStatus(
      conversationId,
      ConversationStatus.ARCHIVED,
    );

    return updated !== null;
  }

  async blockConversation(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      return false;
    }

    // Only buyer can block conversation
    if (conversation.buyer_id !== userId) {
      return false;
    }

    const updated = await this.updateConversationStatus(
      conversationId,
      ConversationStatus.BLOCKED,
    );

    return updated !== null;
  }

  async closeConversation(conversationId: string): Promise<boolean> {
    const updated = await this.updateConversationStatus(
      conversationId,
      ConversationStatus.CLOSED,
    );

    return updated !== null;
  }

  async canUserAccessConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      return false;
    }

    return conversation.buyer_id === userId || conversation.merchant_id === userId;
  }

  async getConversationParticipants(conversationId: string): Promise<string[]> {
    const conversation = await this.getConversationById(conversationId);
    if (!conversation) {
      return [];
    }

    return [conversation.buyer_id, conversation.merchant_id];
  }

  private async initializeUserConversations(conversation: Conversation): Promise<void> {
    // This would initialize the user_conversations table with proper counters
    // Implementation depends on specific requirements
    console.log(`Initializing user conversations for ${conversation.conversation_id}`);
  }

  async cleanupExpiredConversations(): Promise<void> {
    // This would be called by a scheduled job
    const archiveDays = this.configService.get('chat.conversationArchiveDays', 30);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - archiveDays);

    console.log(`Cleaning up conversations older than ${cutoffDate}`);
    // Implementation would depend on specific cleanup needs
  }
}
