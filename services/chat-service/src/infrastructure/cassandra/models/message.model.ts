import { types } from 'cassandra-driver';

const TimeUuid = types.TimeUuid;
type TimeUuidType = InstanceType<typeof types.TimeUuid>;

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface Message {
  conversation_id: string;
  message_id: TimeUuidType;
  sender_id: string;
  message_type: MessageType;
  text?: string;
  media_url?: string;
  is_read: boolean;
  created_at: Date;
}

export interface MessageDeliveryStatus {
  conversation_id: string;
  message_id: TimeUuidType;
  delivered_to: string;
  status: DeliveryStatus;
  updated_at: Date;
}

export interface CreateMessageDto {
  conversation_id: string;
  sender_id?: string;
  message_type: MessageType;
  text?: string;
  media_url?: string;
}

export interface UpdateMessageReadStatusDto {
  message_id: TimeUuidType;
  is_read: boolean;
}

export class MessageModel {
  static tableName = 'messages';
  static deliveryTableName = 'message_delivery_status';

  static createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        conversation_id UUID,
        message_id TIMEUUID,
        sender_id UUID,
        message_type TEXT,
        text TEXT,
        media_url TEXT,
        is_read BOOLEAN,
        created_at TIMESTAMP,
        PRIMARY KEY (conversation_id, created_at, message_id)
      ) WITH CLUSTERING ORDER BY (created_at DESC, message_id DESC);
    `,
    
    createDeliveryTable: `
      CREATE TABLE IF NOT EXISTS ${this.deliveryTableName} (
        conversation_id UUID,
        message_id TIMEUUID,
        delivered_to UUID,
        status TEXT,
        updated_at TIMESTAMP,
        PRIMARY KEY (conversation_id, message_id, delivered_to)
      );
    `,
    
    createIndexes: [
      'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages (message_type);',
      'CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages (is_read);',
    ],
  };

  static queries = {
    insert: `
      INSERT INTO ${this.tableName} 
      (conversation_id, message_id, sender_id, message_type, text, media_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    
    selectByConversationId: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC, message_id DESC
      LIMIT ?
    `,
    
    selectByConversationIdWithPagination: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? 
      AND created_at < ? 
      ORDER BY created_at DESC, message_id DESC
      LIMIT ?
    `,
    
    selectById: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
    
    selectUnreadByUser: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ? AND is_read = false AND sender_id != ?
      ORDER BY created_at DESC
    `,
    
    updateReadStatus: `
      UPDATE ${this.tableName} 
      SET is_read = ? 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
    
    markConversationRead: `
      UPDATE ${this.tableName} 
      SET is_read = true 
      WHERE conversation_id = ? AND is_read = false AND sender_id != ?
    `,
    
    insertDeliveryStatus: `
      INSERT INTO ${this.deliveryTableName} 
      (conversation_id, message_id, delivered_to, status, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    
    updateDeliveryStatus: `
      UPDATE ${this.deliveryTableName} 
      SET status = ?, updated_at = ? 
      WHERE conversation_id = ? AND message_id = ? AND delivered_to = ?
    `,
    
    selectDeliveryStatus: `
      SELECT * FROM ${this.deliveryTableName} 
      WHERE conversation_id = ? AND message_id = ?
    `,
    
    deleteById: `
      DELETE FROM ${this.tableName} 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
  };

  static create(data: CreateMessageDto): Message {
    return {
      conversation_id: data.conversation_id,
      message_id: TimeUuid.now(),
      sender_id: data.sender_id,
      message_type: data.message_type,
      text: data.text,
      media_url: data.media_url,
      is_read: false,
      created_at: new Date(),
    };
  }

  static validate(data: any): Message | null {
    if (!data.conversation_id || !data.sender_id || !data.message_type) {
      return null;
    }

    if (!Object.values(MessageType).includes(data.message_type)) {
      return null;
    }

    return {
      conversation_id: data.conversation_id,
      message_id: data.message_id || TimeUuid.now(),
      sender_id: data.sender_id,
      message_type: data.message_type,
      text: data.text,
      media_url: data.media_url,
      is_read: data.is_read || false,
      created_at: data.created_at || new Date(),
    };
  }

  static createDeliveryStatus(
    conversation_id: string,
    message_id: TimeUuidType,
    delivered_to: string,
    status: DeliveryStatus,
  ): MessageDeliveryStatus {
    return {
      conversation_id,
      message_id,
      delivered_to,
      status,
      updated_at: new Date(),
    };
  }

  static sanitizeText(text: string): string {
    if (!text) return '';
    
    // Remove potentially harmful content
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 1000); // Max length limit
  }

  static validateMessageContent(message: CreateMessageDto): { isValid: boolean; error?: string } {
    if (message.message_type === MessageType.TEXT && !message.text?.trim()) {
      return { isValid: false, error: 'Text message cannot be empty' };
    }

    if (message.message_type !== MessageType.TEXT && !message.media_url) {
      return { isValid: false, error: 'Media message must have a media URL' };
    }

    if (message.text && message.text.length > 1000) {
      return { isValid: false, error: 'Message text exceeds maximum length' };
    }

    return { isValid: true };
  }
}
