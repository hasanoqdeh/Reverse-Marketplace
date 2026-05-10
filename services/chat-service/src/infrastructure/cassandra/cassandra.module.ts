import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'CASSANDRA_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const { Client } = require('cassandra-driver');
        
        const client = new Client({
          contactPoints: configService.get('cassandra.contactPoints'),
          localDataCenter: configService.get('cassandra.localDataCenter'),
          keyspace: configService.get('cassandra.keyspace'),
          credentials: configService.get('cassandra.username') ? {
            username: configService.get('cassandra.username'),
            password: configService.get('cassandra.password'),
          } : undefined,
          queryOptions: {
            consistency: configService.get('cassandra.consistencyLevel'),
            fetchSize: 5000,
            prepare: true,
          },
          socketOptions: {
            connectTimeout: configService.get('cassandra.requestTimeout'),
            readTimeout: configService.get('cassandra.requestTimeout'),
          },
          pooling: {
            heartBeatInterval: 30000,
            poolTimeout: 5000,
          },
        });

        try {
          await client.connect();
          console.log('Cassandra connected successfully');
          
          // Ensure keyspace exists
          await ensureKeyspace(client, configService);
          
          // Create tables if they don't exist
          await createTables(client);
          
        } catch (error) {
          console.error('Cassandra connection error:', error);
          throw error;
        }

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['CASSANDRA_CLIENT'],
})
export class CassandraModule {}

async function ensureKeyspace(client: any, configService: ConfigService): Promise<void> {
  const keyspace = configService.get('cassandra.keyspace');
  const replicationFactor = configService.get('cassandra.replicationFactor');
  
  const query = `
    CREATE KEYSPACE IF NOT EXISTS ${keyspace}
    WITH REPLICATION = {
      'class': 'SimpleStrategy',
      'replication_factor': ${replicationFactor}
    }
  `;
  
  await client.execute(query);
}

async function createTables(client: any): Promise<void> {
  const queries = [
    // Conversations table
    `
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id UUID PRIMARY KEY,
        request_id UUID,
        buyer_id UUID,
        merchant_id UUID,
        status TEXT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      );
    `,
    
    // Messages table with time-based clustering
    `
      CREATE TABLE IF NOT EXISTS messages (
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
    
    // Message delivery status table
    `
      CREATE TABLE IF NOT EXISTS message_delivery_status (
        conversation_id UUID,
        message_id TIMEUUID,
        delivered_to UUID,
        status TEXT,
        updated_at TIMESTAMP,
        PRIMARY KEY (conversation_id, message_id, delivered_to)
      );
    `,
    
    // User conversations index for fast lookup
    `
      CREATE TABLE IF NOT EXISTS user_conversations (
        user_id UUID,
        conversation_id UUID,
        last_message_time TIMESTAMP,
        unread_count COUNTER,
        PRIMARY KEY (user_id, conversation_id)
      ) WITH CLUSTERING ORDER BY (last_message_time DESC);
    `,
    
    // Typing indicators table
    `
      CREATE TABLE IF NOT EXISTS typing_indicators (
        conversation_id UUID,
        user_id UUID,
        is_typing BOOLEAN,
        last_seen TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `,
    
    // Presence table
    `
      CREATE TABLE IF NOT EXISTS user_presence (
        user_id UUID PRIMARY KEY,
        is_online BOOLEAN,
        last_seen TIMESTAMP,
        socket_id TEXT
      );
    `,
  ];

  for (const query of queries) {
    try {
      await client.execute(query);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_conversations_request_id ON conversations (request_id);',
    'CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations (buyer_id);',
    'CREATE INDEX IF NOT EXISTS idx_conversations_merchant_id ON conversations (merchant_id);',
    'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);',
    'CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages (message_type);',
  ];

  for (const indexQuery of indexes) {
    try {
      await client.execute(indexQuery);
    } catch (error) {
      console.error('Error creating index:', error);
      // Continue even if index creation fails
    }
  }

  console.log('Cassandra tables and indexes created successfully');
}
