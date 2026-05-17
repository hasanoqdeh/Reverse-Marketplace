'use strict';

const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    userId:       { type: String, required: true },
    reactionType: { type: String, required: true, maxlength: 50 },
    createdAt:    { type: Date, default: Date.now },
  },
  { _id: false },
);

const readBySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const chatMessageSchema = new mongoose.Schema(
  {
    roomId:     { type: String, required: true, index: true },
    senderId:   { type: String, required: true, index: true },
    type:       {
      type: String,
      enum: ['TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO', 'LOCATION', 'SYSTEM'],
      default: 'TEXT',
    },
    content:    { type: String, required: true },
    replyToId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage', default: null },
    threadId:   { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage', default: null },
    mediaUrls:  { type: [String], default: [] },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
    isEdited:   { type: Boolean, default: false },
    editedAt:   { type: Date, default: null },
    isDeleted:  { type: Boolean, default: false, index: true },
    deletedAt:  { type: Date, default: null },
    readBy:     { type: [readBySchema], default: [] },
    reactions:  { type: [reactionSchema], default: [] },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    collection: 'chat_messages',
  },
);

// Compound index for paginating messages in a room by time
chatMessageSchema.index({ roomId: 1, createdAt: -1 });
chatMessageSchema.index({ roomId: 1, isDeleted: 1, createdAt: -1 });

// Text index for search
chatMessageSchema.index({ content: 'text' });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
