import { v4 as uuidv4 } from 'uuid';

export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
}

export interface Conversation {
  conversation_id: string;
  request_id: string;
  buyer_id: string;
  merchant_id: string;
  status: ConversationStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateConversationDto {
  request_id: string;
  buyer_id: string;
  merchant_id: string;
  status?: ConversationStatus;
}

export interface UpdateConversationDto {
  status?: ConversationStatus;
  updated_at?: Date;
}

export class ConversationModel {
  static tableName = 'conversations';

  static createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        conversation_id UUID PRIMARY KEY,
        request_id UUID,
        buyer_id UUID,
        merchant_id UUID,
        status TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      );
    `,
    
    createIndexes: [
      'CREATE INDEX IF NOT EXISTS idx_conversations_request_id ON conversations (request_id);',
      'CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations (buyer_id);',
      'CREATE INDEX IF NOT EXISTS idx_conversations_merchant_id ON conversations (merchant_id);',
      'CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations (status);',
    ],
  };

  static queries = {
    insert: `
      INSERT INTO ${this.tableName} 
      (conversation_id, request_id, buyer_id, merchant_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    
    selectById: `
      SELECT * FROM ${this.tableName} 
      WHERE conversation_id = ?
    `,
    
    selectByRequestId: `
      SELECT * FROM ${this.tableName} 
      WHERE request_id = ?
    `,
    
    selectByBuyerId: `
      SELECT * FROM ${this.tableName} 
      WHERE buyer_id = ? 
      ALLOW FILTERING
    `,
    
    selectByMerchantId: `
      SELECT * FROM ${this.tableName} 
      WHERE merchant_id = ? 
      ALLOW FILTERING
    `,
    
    selectByParticipants: `
      SELECT * FROM ${this.tableName} 
      WHERE buyer_id = ? AND merchant_id = ? 
      ALLOW FILTERING
    `,
    
    updateStatus: `
      UPDATE ${this.tableName} 
      SET status = ?, updated_at = ? 
      WHERE conversation_id = ?
    `,
    
    deleteById: `
      DELETE FROM ${this.tableName} 
      WHERE conversation_id = ?
    `,
  };

  static create(data: CreateConversationDto): Conversation {
    return {
      conversation_id: uuidv4(),
      request_id: data.request_id,
      buyer_id: data.buyer_id,
      merchant_id: data.merchant_id,
      status: data.status || ConversationStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static validate(data: any): Conversation | null {
    if (!data.request_id || !data.buyer_id || !data.merchant_id) {
      return null;
    }

    return {
      conversation_id: data.conversation_id || uuidv4(),
      request_id: data.request_id,
      buyer_id: data.buyer_id,
      merchant_id: data.merchant_id,
      status: data.status || ConversationStatus.ACTIVE,
      created_at: data.created_at || new Date(),
      updated_at: data.updated_at || new Date(),
    };
  }
}
