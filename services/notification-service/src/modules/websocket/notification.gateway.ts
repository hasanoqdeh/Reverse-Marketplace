import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RabbitMQService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedSocket extends Socket {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    
    // Setup Redis adapter for horizontal scaling
    this.setupRedisAdapter();
    
    // Subscribe to cross-instance events
    this.subscribeToRedisEvents();
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      // Extract JWT token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without authentication token`);
        client.disconnect();
        return;
      }

      // TODO: Validate JWT token and extract user info
      // For now, we'll use a placeholder
      const userId = 'user-placeholder'; // Extract from JWT
      
      // Store user info in socket
      client.user = {
        sub: userId,
        email: 'placeholder@example.com',
        role: 'USER',
      };

      // Join user-specific room
      await client.join(`user:${userId}`);
      
      // Update presence
      await this.redisService.setUserOnline(userId, client.id);
      await this.redisService.addSocketSession(userId, client.id);
      
      // Store socket session in database
      // TODO: Implement database session storage
      
      // Publish user online event
      const onlineEvent = this.rabbitMQService.createDomainEvent(
        'user.online',
        userId,
        { socketId: client.id, timestamp: new Date().toISOString() }
      );
      await this.rabbitMQService.publishEvent('user.online', onlineEvent);

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      // Send welcome notification
      client.emit('connected', {
        message: 'Connected to notification service',
        userId,
        socketId: client.id,
      });

    } catch (error) {
      this.logger.error(`Error handling connection for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    try {
      const userId = client.user?.sub;
      
      if (userId) {
        // Remove socket session
        await this.redisService.removeSocketSession(userId, client.id);
        
        // Check if user has any other active sockets
        const activeSockets = await this.redisService.getUserSockets(userId);
        
        if (activeSockets.length === 0) {
          // User is completely offline
          await this.redisService.setUserOffline(userId);
          
          // Publish user offline event
          const offlineEvent = this.rabbitMQService.createDomainEvent(
            'user.offline',
            userId,
            { socketId: client.id, timestamp: new Date().toISOString() }
          );
          await this.rabbitMQService.publishEvent('user.offline', offlineEvent);
        }
      }

      this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Error handling disconnect for client ${client.id}:`, error);
    }
  }

  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const userId = client.user?.sub;
      
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // TODO: Update notification read status in database
      // For now, just acknowledge
      client.emit('notification_read_ack', {
        notificationId: data.notificationId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${userId} marked notification ${data.notificationId} as read`);
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const userId = client.user?.sub;
      
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // TODO: Get unread count from database
      const unreadCount = 0; // Placeholder

      client.emit('unread_count', { count: unreadCount });
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      client.emit('error', { message: 'Failed to get unread count' });
    }
  }

  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    try {
      // Check if user is online
      const isOnline = await this.redisService.isUserOnline(userId);
      
      if (isOnline) {
        // Send via WebSocket
        this.server.to(`user:${userId}`).emit('notification', notification);
        this.logger.log(`Sent notification to user ${userId} via WebSocket`);
        
        return { delivered: true, channel: 'websocket' };
      } else {
        // User is offline, will be handled by push notification service
        this.logger.log(`User ${userId} is offline, notification will be sent via push`);
        return { delivered: false, channel: 'push_required' };
      }
    } catch (error) {
      this.logger.error(`Error sending notification to user ${userId}:`, error);
      return { delivered: false, error: error.message };
    }
  }

  // Method to broadcast to all connected users
  async broadcastNotification(notification: any, targetRole?: string) {
    try {
      if (targetRole) {
        // Send to users with specific role
        // TODO: Implement role-based targeting
        this.server.emit('notification', notification);
      } else {
        // Send to all connected users
        this.server.emit('notification', notification);
      }
      
      this.logger.log('Broadcasted notification to all users');
    } catch (error) {
      this.logger.error('Error broadcasting notification:', error);
    }
  }

  private setupRedisAdapter() {
    // TODO: Setup Redis adapter for horizontal scaling
    // This would require socket.io-redis package
    this.logger.log('Redis adapter setup placeholder');
  }

  private subscribeToRedisEvents() {
    // Subscribe to cross-instance events
    this.redisService.subscribeToChannel('notifications', (data) => {
      const { type, userId, notification } = data;
      
      switch (type) {
        case 'send_to_user':
          this.sendNotificationToUser(userId, notification);
          break;
        case 'broadcast':
          this.broadcastNotification(notification, data.targetRole);
          break;
        default:
          this.logger.warn(`Unknown Redis event type: ${type}`);
      }
    });
  }

  // Health check method
  async getGatewayStats() {
    const sockets = this.server.sockets.sockets;
    const connectedClients = Array.from(sockets.values()).length;
    
    return {
      connectedClients,
      serverId: process.env.NODE_ID || 'unknown',
      uptime: process.uptime(),
    };
  }
}
