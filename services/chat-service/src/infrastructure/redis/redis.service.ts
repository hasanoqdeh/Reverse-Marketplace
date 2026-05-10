import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: any,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    console.log('Redis service initialized for Chat Service');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  // Socket.io Redis Adapter support
  async publishToChannel(channel: string, message: any): Promise<void> {
    await this.client.publish(channel, JSON.stringify(message));
  }

  async subscribeToChannel(channel: string, callback: (message: any) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch (error) {
        console.error('Error parsing Redis message:', error);
      }
    });
  }

  // Presence management
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    const key = `presence:${userId}`;
    const presence = {
      isOnline: true,
      lastSeen: new Date().toISOString(),
      socketId,
    };
    await this.client.setEx(key, 3600, JSON.stringify(presence)); // 1 hour TTL
  }

  async setUserOffline(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    const presence = {
      isOnline: false,
      lastSeen: new Date().toISOString(),
      socketId: null,
    };
    await this.client.setEx(key, 86400, JSON.stringify(presence)); // 24 hours TTL
  }

  async getUserPresence(userId: string): Promise<any> {
    const key = `presence:${userId}`;
    const presence = await this.client.get(key);
    return presence ? JSON.parse(presence) : null;
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const presence = await this.getUserPresence(userId);
    return presence ? presence.isOnline : false;
  }

  // Typing indicators
  async setUserTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const key = `typing:${conversationId}:${userId}`;
    if (isTyping) {
      await this.client.setEx(key, 10, '1'); // 10 second TTL
    } else {
      await this.client.del(key);
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    const pattern = `typing:${conversationId}:*`;
    const keys = await this.client.keys(pattern);
    
    const userIds = keys.map(key => key.split(':').pop());
    return userIds;
  }

  // Conversation caching
  async cacheConversation(conversationId: string, conversation: any, ttl: number = 3600): Promise<void> {
    const key = `conversation:${conversationId}`;
    await this.client.setEx(key, ttl, JSON.stringify(conversation));
  }

  async getCachedConversation(conversationId: string): Promise<any> {
    const key = `conversation:${conversationId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateConversationCache(conversationId: string): Promise<void> {
    const key = `conversation:${conversationId}`;
    await this.client.del(key);
  }

  // User conversations list caching
  async cacheUserConversations(userId: string, conversations: any[], ttl: number = 1800): Promise<void> {
    const key = `user_conversations:${userId}`;
    await this.client.setEx(key, ttl, JSON.stringify(conversations));
  }

  async getCachedUserConversations(userId: string): Promise<any[]> {
    const key = `user_conversations:${userId}`;
    const cached = await this.client.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async invalidateUserConversationsCache(userId: string): Promise<void> {
    const key = `user_conversations:${userId}`;
    await this.client.del(key);
  }

  // Unread count tracking
  async incrementUnreadCount(userId: string, conversationId: string): Promise<number> {
    const key = `unread:${userId}:${conversationId}`;
    return await this.client.incr(key);
  }

  async getUnreadCount(userId: string, conversationId: string): Promise<number> {
    const key = `unread:${userId}:${conversationId}`;
    const count = await this.client.get(key);
    return count ? parseInt(count) : 0;
  }

  async resetUnreadCount(userId: string, conversationId: string): Promise<void> {
    const key = `unread:${userId}:${conversationId}`;
    await this.client.del(key);
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const pattern = `unread:${userId}:*`;
    const keys = await this.client.keys(pattern);
    
    if (keys.length === 0) return 0;
    
    const counts = await Promise.all(keys.map(key => this.client.get(key)));
    return counts.reduce((sum, count) => sum + (count ? parseInt(count) : 0), 0);
  }

  // Message rate limiting
  async checkMessageRateLimit(userId: string, windowSeconds: number = 60, maxMessages: number = 30): Promise<boolean> {
    const key = `rate_limit:message:${userId}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }
    
    return current <= maxMessages;
  }

  // Upload rate limiting
  async checkUploadRateLimit(userId: string, windowSeconds: number = 60, maxUploads: number = 5): Promise<boolean> {
    const key = `rate_limit:upload:${userId}`;
    const current = await this.client.incr(key);
    
    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }
    
    return current <= maxUploads;
  }

  // Socket connection tracking
  async addSocketConnection(userId: string, socketId: string): Promise<void> {
    const key = `sockets:${userId}`;
    await this.client.sAdd(key, socketId);
    await this.client.expire(key, 3600); // 1 hour TTL
  }

  async removeSocketConnection(userId: string, socketId: string): Promise<void> {
    const key = `sockets:${userId}`;
    await this.client.sRem(key, socketId);
  }

  async getUserSocketIds(userId: string): Promise<string[]> {
    const key = `sockets:${userId}`;
    return await this.client.sMembers(key);
  }

  async getUserConnectionCount(userId: string): Promise<number> {
    const key = `sockets:${userId}`;
    return await this.client.sCard(key);
  }

  // Message deduplication
  async hasMessageBeenProcessed(messageId: string): Promise<boolean> {
    const key = `processed_messages:${messageId}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async markMessageAsProcessed(messageId: string, ttl: number = 3600): Promise<void> {
    const key = `processed_messages:${messageId}`;
    await this.client.setEx(key, ttl, '1');
  }

  // Conversation room management
  async addToConversationRoom(conversationId: string, userId: string): Promise<void> {
    const key = `room:${conversationId}`;
    await this.client.sAdd(key, userId);
    await this.client.expire(key, 86400); // 24 hours TTL
  }

  async removeFromConversationRoom(conversationId: string, userId: string): Promise<void> {
    const key = `room:${conversationId}`;
    await this.client.sRem(key, userId);
  }

  async getConversationRoomMembers(conversationId: string): Promise<string[]> {
    const key = `room:${conversationId}`;
    return await this.client.sMembers(key);
  }

  async isUserInConversationRoom(conversationId: string, userId: string): Promise<boolean> {
    const key = `room:${conversationId}`;
    return await this.client.sIsMember(key, userId);
  }

  // Performance monitoring
  async recordMetric(metric: string, value: number): Promise<void> {
    const key = `metrics:${metric}`;
    await this.client.lPush(key, value.toString());
    await this.client.lTrim(key, 0, 999); // Keep last 1000 measurements
    await this.client.expire(key, 3600); // 1 hour TTL
  }

  async getAverageMetric(metric: string): Promise<number> {
    const key = `metrics:${metric}`;
    const values = await this.client.lRange(key, 0, -1);
    
    if (values.length === 0) return 0;
    
    const sum = values.reduce((acc: number, val: string) => acc + parseFloat(val), 0);
    return sum / values.length;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    await this.client.ping();
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      latency,
    };
  }

  // Cleanup expired data
  async cleanupExpiredData(): Promise<void> {
    // This would be called by a scheduled job
    console.log('Cleaning up expired Redis data...');
    // Implementation would depend on specific cleanup needs
  }

  // Additional methods for Chat Service
  async publishUserOnline(userId: string, isOnline: boolean): Promise<void> {
    const channel = `user:${userId}`;
    await this.publishToChannel(channel, {
      type: 'presence_update',
      data: { userId, isOnline, timestamp: new Date().toISOString() },
    });
  }

  async publishUserTyping(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const channel = `conversation:${conversationId}`;
    await this.publishToChannel(channel, {
      type: 'typing_update',
      data: { conversationId, userId, isTyping, timestamp: new Date().toISOString() },
    });
  }
}
