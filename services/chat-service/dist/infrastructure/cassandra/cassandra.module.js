"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassandraModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let CassandraModule = class CassandraModule {
};
exports.CassandraModule = CassandraModule;
exports.CassandraModule = CassandraModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: 'CASSANDRA_CLIENT',
                useFactory: async (configService) => {
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
                        await ensureKeyspace(client, configService);
                        await createTables(client);
                    }
                    catch (error) {
                        console.error('Cassandra connection error:', error);
                        throw error;
                    }
                    return client;
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: ['CASSANDRA_CLIENT'],
    })
], CassandraModule);
async function ensureKeyspace(client, configService) {
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
async function createTables(client) {
    const queries = [
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
        `
      CREATE TABLE IF NOT EXISTS user_conversations (
        user_id UUID,
        conversation_id UUID,
        last_message_time TIMESTAMP,
        unread_count COUNTER,
        PRIMARY KEY (user_id, conversation_id)
      ) WITH CLUSTERING ORDER BY (last_message_time DESC);
    `,
        `
      CREATE TABLE IF NOT EXISTS typing_indicators (
        conversation_id UUID,
        user_id UUID,
        is_typing BOOLEAN,
        last_seen TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `,
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
        }
        catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    }
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
        }
        catch (error) {
            console.error('Error creating index:', error);
        }
    }
    console.log('Cassandra tables and indexes created successfully');
}
//# sourceMappingURL=cassandra.module.js.map