export interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: Date;
  socket_id?: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  last_seen: Date;
}

export interface UserConversations {
  user_id: string;
  conversation_id: string;
  last_message_time: Date;
  unread_count: number;
}

export class PresenceModel {
  static tableName = 'user_presence';

  static createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        user_id UUID PRIMARY KEY,
        is_online BOOLEAN,
        last_seen TIMESTAMP,
        socket_id TEXT
      );
    `,
  };

  static queries = {
    upsert: `
      INSERT INTO ${this.tableName} 
      (user_id, is_online, last_seen, socket_id)
      VALUES (?, ?, ?, ?)
    `,
    
    selectById: `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ?
    `,
    
    selectOnlineUsers: `
      SELECT * FROM ${this.tableName} 
      WHERE is_online = true 
      ALLOW FILTERING
    `,
    
    deleteById: `
      DELETE FROM ${this.tableName} 
      WHERE user_id = ?
    `,
  };

  static create(data: Partial<UserPresence>): UserPresence {
    return {
      user_id: data.user_id!,
      is_online: data.is_online || false,
      last_seen: data.last_seen || new Date(),
      socket_id: data.socket_id,
    };
  }
}

export class TypingIndicatorModel {
  static tableName = 'typing_indicators';

  static createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        conversation_id UUID,
        user_id UUID,
        is_typing BOOLEAN,
        last_seen TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `,
  };

  static queries = {
    upsert: `
      INSERT INTO ${this.tableName} 
      (conversation_id, user_id, is_typing, last_seen)
      VALUES (?, ?, ?, ?)
    `,
    
    selectByConversation: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? AND is_typing = true
    `,
    
    selectByUser: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? AND user_id = ?
    `,
    
    deleteByUser: `
      DELETE FROM ${this.tableName} 
      WHERE conversation_id = ? AND user_id = ?
    `,
    
    cleanupExpired: `
      DELETE FROM ${this.tableName} 
      WHERE last_seen < ? 
      ALLOW FILTERING
    `,
  };

  static create(data: Partial<TypingIndicator>): TypingIndicator {
    return {
      conversation_id: data.conversation_id!,
      user_id: data.user_id!,
      is_typing: data.is_typing || false,
      last_seen: data.last_seen || new Date(),
    };
  }
}

export class UserConversationsModel {
  static tableName = 'user_conversations';

  static createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        user_id UUID,
        conversation_id UUID,
        last_message_time TIMESTAMP,
        unread_count COUNTER,
        PRIMARY KEY (user_id, conversation_id)
      ) WITH CLUSTERING ORDER BY (last_message_time DESC);
    `,
  };

  static queries = {
    incrementUnread: `
      UPDATE ${this.tableName} 
      SET unread_count = unread_count + 1 
      WHERE user_id = ? AND conversation_id = ?
    `,
    
    resetUnread: `
      UPDATE ${this.tableName} 
      SET unread_count = 0 
      WHERE user_id = ? AND conversation_id = ?
    `,
    
    updateLastMessageTime: `
      UPDATE ${this.tableName} 
      SET last_message_time = ? 
      WHERE user_id = ? AND conversation_id = ?
    `,
    
    selectByUser: `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ? 
      ORDER BY last_message_time DESC
      LIMIT ?
    `,
    
    selectByUserWithPagination: `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = ? 
      AND last_message_time < ? 
      ORDER BY last_message_time DESC
      LIMIT ?
    `,
    
    selectUnreadCount: `
      SELECT unread_count FROM ${this.tableName} 
      WHERE user_id = ? AND conversation_id = ?
    `,
    
    getTotalUnreadCount: `
      SELECT SUM(unread_count) as total_unread FROM ${this.tableName} 
      WHERE user_id = ?
    `,
    
    deleteById: `
      DELETE FROM ${this.tableName} 
      WHERE user_id = ? AND conversation_id = ?
    `,
  };

  static create(data: Partial<UserConversations>): UserConversations {
    return {
      user_id: data.user_id!,
      conversation_id: data.conversation_id!,
      last_message_time: data.last_message_time || new Date(),
      unread_count: data.unread_count || 0,
    };
  }
}
