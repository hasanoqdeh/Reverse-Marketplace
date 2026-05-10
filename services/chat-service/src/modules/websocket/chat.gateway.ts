import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { MessageService } from '../messages/message.service';
import { ConversationService } from '../conversations/conversation.service';
import { MessageType } from '../../infrastructure/cassandra/models/message.model';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Setup Redis adapter for scaling
    this.setupRedisAdapter();
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    
    try {
      // Extract JWT token from query or headers
      const token = client.handshake.query.token || client.handshake.headers.authorization;
      
      if (!token) {
        throw new WsException('Unauthorized: No token provided');
      }

      // Validate JWT token (simplified for now)
      const userId = this.extractUserIdFromToken(token as string);
      if (!userId) {
        throw new WsException('Unauthorized: Invalid token');
      }

      client.userId = userId;

      // Set user online
      await this.redisService.setUserOnline(userId, client.id);
      
      // Add socket connection tracking
      await this.redisService.addSocketConnection(userId, client.id);

      // Join user to their personal room
      await client.join(`user:${userId}`);

      // Publish user online event
      await this.redisService.publishUserOnline(userId, true);

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    if (client.userId) {
      // Remove socket connection
      await this.redisService.removeSocketConnection(client.userId, client.id);
      
      // Check if user has any remaining connections
      const connectionCount = await this.redisService.getUserConnectionCount(client.userId);
      
      if (connectionCount === 0) {
        // Set user offline
        await this.redisService.setUserOffline(client.userId);
        
        // Publish user offline event
        await this.redisService.publishUserOnline(client.userId, false);
        
        this.logger.log(`User ${client.userId} went offline`);
      }
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversation_id: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const { conversation_id } = data;

    // Verify user has access to conversation
    const hasAccess = await this.conversationService.canUserAccessConversation(
      conversation_id,
      client.userId,
    );

    if (!hasAccess) {
      throw new WsException('Access denied to conversation');
    }

    // Join conversation room
    await client.join(`conversation:${conversation_id}`);
    
    // Add to Redis room tracking
    await this.redisService.addToConversationRoom(conversation_id, client.userId);

    // Notify other participants
    client.to(`conversation:${conversation_id}`).emit('user_joined', {
      userId: client.userId,
      conversationId: conversation_id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${client.userId} joined conversation ${conversation_id}`);
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversation_id: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const { conversation_id } = data;

    // Leave conversation room
    await client.leave(`conversation:${conversation_id}`);
    
    // Remove from Redis room tracking
    await this.redisService.removeFromConversationRoom(conversation_id, client.userId);

    // Notify other participants
    client.to(`conversation:${conversation_id}`).emit('user_left', {
      userId: client.userId,
      conversationId: conversation_id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${client.userId} left conversation ${conversation_id}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: {
      conversation_id: string;
      message_type: MessageType;
      text?: string;
      media_url?: string;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const message = await this.messageService.sendMessage(data, client.userId);
      
      // Emit message to all participants in the conversation
      this.server.to(`conversation:${data.conversation_id}`).emit('new_message', {
        ...message,
        timestamp: message.created_at,
      });

      return { success: true, message };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { message_id: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    try {
      const success = await this.messageService.markMessageAsRead(
        data.message_id,
        client.userId,
      );

      if (success) {
        // Emit read receipt to conversation
        const message = await this.messageService.getMessageById(
          data.message_id,
          client.userId,
        );
        
        if (message) {
          this.server.to(`conversation:${message.conversation_id}`).emit('message_read', {
            messageId: data.message_id,
            userId: client.userId,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return { success };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversation_id: string; is_typing: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    const { conversation_id, is_typing } = data;

    // Update typing indicator in Redis
    await this.redisService.setUserTyping(conversation_id, client.userId, is_typing);

    // Emit typing indicator to other participants
    client.to(`conversation:${conversation_id}`).emit('user_typing', {
      conversationId: conversation_id,
      userId: client.userId,
      isTyping: is_typing,
      timestamp: new Date().toISOString(),
    });

    // Publish typing event
    await this.redisService.publishUserTyping(conversation_id, client.userId, is_typing);
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      throw new WsException('Unauthorized');
    }

    // Get online users in same conversations
    const userConversations = await this.conversationService.getUserConversations(
      client.userId,
      1,
      50,
    );

    const onlineUsers = [];
    
    for (const conversation of userConversations.conversations) {
      const participants = await this.conversationService.getConversationParticipants(
        conversation.conversation_id,
      );
      
      for (const participantId of participants) {
        if (participantId !== client.userId) {
          const isOnline = await this.redisService.isUserOnline(participantId);
          if (isOnline) {
            onlineUsers.push(participantId);
          }
        }
      }
    }

    // Remove duplicates
    const uniqueOnlineUsers = [...new Set(onlineUsers)];

    client.emit('online_users', {
      users: uniqueOnlineUsers,
      timestamp: new Date().toISOString(),
    });
  }

  private async setupRedisAdapter(): Promise<void> {
    // This would setup the Redis adapter for Socket.io scaling
    // Implementation depends on the specific Redis adapter library
    this.logger.log('Redis adapter setup completed');
  }

  private extractUserIdFromToken(token: string): string | null {
    // This is a simplified token extraction
    // In production, you'd properly validate JWT tokens
    try {
      // Remove "Bearer " prefix if present
      const cleanToken = token.replace('Bearer ', '');
      
      // For now, return a placeholder
      // In production, decode JWT and extract user ID
      return 'user-placeholder';
    } catch (error) {
      return null;
    }
  }

  // Handle Redis pub/sub events for cross-node communication
  async handleRedisEvent(channel: string, data: any): Promise<void> {
    if (channel.startsWith('conversation:')) {
      // Forward message to connected clients in this node
      this.server.to(channel).emit(data.type, data.data);
    }
  }
}
