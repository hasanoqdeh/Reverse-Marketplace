"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = exports.DeliveryStatus = exports.MessageType = void 0;
const cassandra_driver_1 = require("cassandra-driver");
const TimeUuid = cassandra_driver_1.types.TimeUuid;
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["VOICE"] = "VOICE";
    MessageType["VIDEO"] = "VIDEO";
    MessageType["LOCATION"] = "LOCATION";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
class MessageModel {
    static create(data) {
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
    static validate(data) {
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
    static createDeliveryStatus(conversation_id, message_id, delivered_to, status) {
        return {
            conversation_id,
            message_id,
            delivered_to,
            status,
            updated_at: new Date(),
        };
    }
    static sanitizeText(text) {
        if (!text)
            return '';
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim()
            .substring(0, 1000);
    }
    static validateMessageContent(message) {
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
exports.MessageModel = MessageModel;
_a = MessageModel;
MessageModel.tableName = 'messages';
MessageModel.deliveryTableName = 'message_delivery_status';
MessageModel.createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${_a.tableName} (
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
      CREATE TABLE IF NOT EXISTS ${_a.deliveryTableName} (
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
MessageModel.queries = {
    insert: `
      INSERT INTO ${_a.tableName} 
      (conversation_id, message_id, sender_id, message_type, text, media_url, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    selectByConversationId: `
      SELECT * FROM ${_a.tableName} 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC, message_id DESC
      LIMIT ?
    `,
    selectByConversationIdWithPagination: `
      SELECT * FROM ${_a.tableName} 
      WHERE conversation_id = ? 
      AND created_at < ? 
      ORDER BY created_at DESC, message_id DESC
      LIMIT ?
    `,
    selectById: `
      SELECT * FROM ${_a.tableName} 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
    selectUnreadByUser: `
      SELECT * FROM ${_a.tableName} 
      WHERE conversation_id = ? AND is_read = false AND sender_id != ?
      ORDER BY created_at DESC
    `,
    updateReadStatus: `
      UPDATE ${_a.tableName} 
      SET is_read = ? 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
    markConversationRead: `
      UPDATE ${_a.tableName} 
      SET is_read = true 
      WHERE conversation_id = ? AND is_read = false AND sender_id != ?
    `,
    insertDeliveryStatus: `
      INSERT INTO ${_a.deliveryTableName} 
      (conversation_id, message_id, delivered_to, status, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    updateDeliveryStatus: `
      UPDATE ${_a.deliveryTableName} 
      SET status = ?, updated_at = ? 
      WHERE conversation_id = ? AND message_id = ? AND delivered_to = ?
    `,
    selectDeliveryStatus: `
      SELECT * FROM ${_a.deliveryTableName} 
      WHERE conversation_id = ? AND message_id = ?
    `,
    deleteById: `
      DELETE FROM ${_a.tableName} 
      WHERE conversation_id = ? AND created_at = ? AND message_id = ?
    `,
};
//# sourceMappingURL=message.model.js.map