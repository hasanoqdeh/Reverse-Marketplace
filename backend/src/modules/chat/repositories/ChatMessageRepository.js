'use strict';

const ChatMessage = require('../../../models/ChatMessage');

const ChatMessageRepository = {
  async create({ roomId, senderId, type = 'TEXT', content, replyToId, threadId, mediaUrls = [], metadata = {} }) {
    const msg = await ChatMessage.create({
      roomId,
      senderId,
      type,
      content,
      replyToId: replyToId || null,
      threadId: threadId || null,
      mediaUrls,
      metadata,
    });
    return this._format(msg);
  },

  async findById(id) {
    const msg = await ChatMessage.findById(id).lean();
    return msg ? this._format(msg) : null;
  },

  async findByRoom(roomId, { page = 1, limit = 50, before } = {}) {
    const query = {
      roomId,
      isDeleted: false,
      ...(before ? { createdAt: { $lt: new Date(before) } } : {}),
    };

    const [messages, total] = await Promise.all([
      ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ChatMessage.countDocuments(query),
    ]);

    return { messages: messages.reverse().map(m => this._format(m)), total };
  },

  async update(id, { content }) {
    const msg = await ChatMessage.findByIdAndUpdate(
      id,
      { $set: { content, isEdited: true, editedAt: new Date() } },
      { new: true }
    ).lean();
    return msg ? this._format(msg) : null;
  },

  async softDelete(id) {
    await ChatMessage.findByIdAndUpdate(id, {
      $set: { isDeleted: true, deletedAt: new Date(), content: '[Message deleted]' },
    });
  },

  async markRead(messageId, userId) {
    await ChatMessage.updateOne(
      { _id: messageId, 'readBy.userId': { $ne: userId } },
      { $push: { readBy: { userId, readAt: new Date() } } },
    );
  },

  async markRoomRead(roomId, userId) {
    const result = await ChatMessage.updateMany(
      {
        roomId,
        isDeleted: false,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
      },
      { $push: { readBy: { userId, readAt: new Date() } } },
    );
    return result.modifiedCount;
  },

  async addReaction(messageId, userId, reactionType) {
    // Remove existing same reaction from this user first, then add
    await ChatMessage.updateOne(
      { _id: messageId },
      { $pull: { reactions: { userId, reactionType } } },
    );
    await ChatMessage.updateOne(
      { _id: messageId },
      { $push: { reactions: { userId, reactionType, createdAt: new Date() } } },
    );
  },

  async removeReaction(messageId, userId, reactionType) {
    await ChatMessage.updateOne(
      { _id: messageId },
      { $pull: { reactions: { userId, reactionType } } },
    );
  },

  async countByRoom(roomId) {
    return ChatMessage.countDocuments({ roomId, isDeleted: false });
  },

  async countUnread(roomId, userId, lastReadAt) {
    return ChatMessage.countDocuments({
      roomId,
      isDeleted: false,
      senderId: { $ne: userId },
      ...(lastReadAt ? { createdAt: { $gt: new Date(lastReadAt) } } : {}),
      'readBy.userId': { $ne: userId },
    });
  },

  // Normalize _id → id and strip Mongoose internals
  _format(doc) {
    const obj = doc._id ? doc : doc;
    return {
      id: (obj._id || obj.id)?.toString(),
      roomId:    obj.roomId,
      senderId:  obj.senderId,
      type:      obj.type,
      content:   obj.content,
      replyToId: obj.replyToId?.toString() ?? null,
      threadId:  obj.threadId?.toString() ?? null,
      mediaUrls: obj.mediaUrls ?? [],
      metadata:  obj.metadata ?? {},
      isEdited:  obj.isEdited,
      editedAt:  obj.editedAt ?? null,
      isDeleted: obj.isDeleted,
      deletedAt: obj.deletedAt ?? null,
      readBy:    (obj.readBy ?? []).map(r => ({ userId: r.userId, readAt: r.readAt })),
      reactions: (obj.reactions ?? []).map(r => ({ userId: r.userId, reactionType: r.reactionType })),
      createdAt: obj.createdAt,
    };
  },
};

module.exports = ChatMessageRepository;
