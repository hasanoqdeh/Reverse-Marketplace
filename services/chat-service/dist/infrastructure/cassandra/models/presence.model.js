"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserConversationsModel = exports.TypingIndicatorModel = exports.PresenceModel = void 0;
class PresenceModel {
    static create(data) {
        return {
            user_id: data.user_id,
            is_online: data.is_online || false,
            last_seen: data.last_seen || new Date(),
            socket_id: data.socket_id,
        };
    }
}
exports.PresenceModel = PresenceModel;
_a = PresenceModel;
PresenceModel.tableName = 'user_presence';
PresenceModel.createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${_a.tableName} (
        user_id UUID PRIMARY KEY,
        is_online BOOLEAN,
        last_seen TIMESTAMP,
        socket_id TEXT
      );
    `,
};
PresenceModel.queries = {
    upsert: `
      INSERT INTO ${_a.tableName} 
      (user_id, is_online, last_seen, socket_id)
      VALUES (?, ?, ?, ?)
    `,
    selectById: `
      SELECT * FROM ${_a.tableName} 
      WHERE user_id = ?
    `,
    selectOnlineUsers: `
      SELECT * FROM ${_a.tableName} 
      WHERE is_online = true 
      ALLOW FILTERING
    `,
    deleteById: `
      DELETE FROM ${_a.tableName} 
      WHERE user_id = ?
    `,
};
class TypingIndicatorModel {
    static create(data) {
        return {
            conversation_id: data.conversation_id,
            user_id: data.user_id,
            is_typing: data.is_typing || false,
            last_seen: data.last_seen || new Date(),
        };
    }
}
exports.TypingIndicatorModel = TypingIndicatorModel;
_b = TypingIndicatorModel;
TypingIndicatorModel.tableName = 'typing_indicators';
TypingIndicatorModel.createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${_b.tableName} (
        conversation_id UUID,
        user_id UUID,
        is_typing BOOLEAN,
        last_seen TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `,
};
TypingIndicatorModel.queries = {
    upsert: `
      INSERT INTO ${_b.tableName} 
      (conversation_id, user_id, is_typing, last_seen)
      VALUES (?, ?, ?, ?)
    `,
    selectByConversation: `
      SELECT * FROM ${_b.tableName} 
      WHERE conversation_id = ? AND is_typing = true
    `,
    selectByUser: `
      SELECT * FROM ${_b.tableName} 
      WHERE conversation_id = ? AND user_id = ?
    `,
    deleteByUser: `
      DELETE FROM ${_b.tableName} 
      WHERE conversation_id = ? AND user_id = ?
    `,
    cleanupExpired: `
      DELETE FROM ${_b.tableName} 
      WHERE last_seen < ? 
      ALLOW FILTERING
    `,
};
class UserConversationsModel {
    static create(data) {
        return {
            user_id: data.user_id,
            conversation_id: data.conversation_id,
            last_message_time: data.last_message_time || new Date(),
            unread_count: data.unread_count || 0,
        };
    }
}
exports.UserConversationsModel = UserConversationsModel;
_c = UserConversationsModel;
UserConversationsModel.tableName = 'user_conversations';
UserConversationsModel.createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${_c.tableName} (
        user_id UUID,
        conversation_id UUID,
        last_message_time TIMESTAMP,
        unread_count COUNTER,
        PRIMARY KEY (user_id, conversation_id)
      ) WITH CLUSTERING ORDER BY (last_message_time DESC);
    `,
};
UserConversationsModel.queries = {
    incrementUnread: `
      UPDATE ${_c.tableName} 
      SET unread_count = unread_count + 1 
      WHERE user_id = ? AND conversation_id = ?
    `,
    resetUnread: `
      UPDATE ${_c.tableName} 
      SET unread_count = 0 
      WHERE user_id = ? AND conversation_id = ?
    `,
    updateLastMessageTime: `
      UPDATE ${_c.tableName} 
      SET last_message_time = ? 
      WHERE user_id = ? AND conversation_id = ?
    `,
    selectByUser: `
      SELECT * FROM ${_c.tableName} 
      WHERE user_id = ? 
      ORDER BY last_message_time DESC
      LIMIT ?
    `,
    selectByUserWithPagination: `
      SELECT * FROM ${_c.tableName} 
      WHERE user_id = ? 
      AND last_message_time < ? 
      ORDER BY last_message_time DESC
      LIMIT ?
    `,
    selectUnreadCount: `
      SELECT unread_count FROM ${_c.tableName} 
      WHERE user_id = ? AND conversation_id = ?
    `,
    getTotalUnreadCount: `
      SELECT SUM(unread_count) as total_unread FROM ${_c.tableName} 
      WHERE user_id = ?
    `,
    deleteById: `
      DELETE FROM ${_c.tableName} 
      WHERE user_id = ? AND conversation_id = ?
    `,
};
//# sourceMappingURL=presence.model.js.map