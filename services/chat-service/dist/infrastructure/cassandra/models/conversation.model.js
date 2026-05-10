"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationModel = exports.ConversationStatus = void 0;
const uuid_1 = require("uuid");
var ConversationStatus;
(function (ConversationStatus) {
    ConversationStatus["ACTIVE"] = "ACTIVE";
    ConversationStatus["ARCHIVED"] = "ARCHIVED";
    ConversationStatus["BLOCKED"] = "BLOCKED";
    ConversationStatus["CLOSED"] = "CLOSED";
})(ConversationStatus || (exports.ConversationStatus = ConversationStatus = {}));
class ConversationModel {
    static create(data) {
        return {
            conversation_id: (0, uuid_1.v4)(),
            request_id: data.request_id,
            buyer_id: data.buyer_id,
            merchant_id: data.merchant_id,
            status: data.status || ConversationStatus.ACTIVE,
            created_at: new Date(),
            updated_at: new Date(),
        };
    }
    static validate(data) {
        if (!data.request_id || !data.buyer_id || !data.merchant_id) {
            return null;
        }
        return {
            conversation_id: data.conversation_id || (0, uuid_1.v4)(),
            request_id: data.request_id,
            buyer_id: data.buyer_id,
            merchant_id: data.merchant_id,
            status: data.status || ConversationStatus.ACTIVE,
            created_at: data.created_at || new Date(),
            updated_at: data.updated_at || new Date(),
        };
    }
}
exports.ConversationModel = ConversationModel;
_a = ConversationModel;
ConversationModel.tableName = 'conversations';
ConversationModel.createQueries = {
    createTable: `
      CREATE TABLE IF NOT EXISTS ${_a.tableName} (
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
ConversationModel.queries = {
    insert: `
      INSERT INTO ${_a.tableName} 
      (conversation_id, request_id, buyer_id, merchant_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    selectById: `
      SELECT * FROM ${_a.tableName} 
      WHERE conversation_id = ?
    `,
    selectByRequestId: `
      SELECT * FROM ${_a.tableName} 
      WHERE request_id = ?
    `,
    selectByBuyerId: `
      SELECT * FROM ${_a.tableName} 
      WHERE buyer_id = ? 
      ALLOW FILTERING
    `,
    selectByMerchantId: `
      SELECT * FROM ${_a.tableName} 
      WHERE merchant_id = ? 
      ALLOW FILTERING
    `,
    selectByParticipants: `
      SELECT * FROM ${_a.tableName} 
      WHERE buyer_id = ? AND merchant_id = ? 
      ALLOW FILTERING
    `,
    updateStatus: `
      UPDATE ${_a.tableName} 
      SET status = ?, updated_at = ? 
      WHERE conversation_id = ?
    `,
    deleteById: `
      DELETE FROM ${_a.tableName} 
      WHERE conversation_id = ?
    `,
};
//# sourceMappingURL=conversation.model.js.map