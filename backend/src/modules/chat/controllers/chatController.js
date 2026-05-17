'use strict';

const chatService = require('../services/chatService');

const chatController = {
  // POST /chat/rooms
  async createRoom(req, res) {
    const result = await chatService.createRoom(req.user.id, req.body);
    if (result.error) {
      const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message });
    }
    return res.status(201).json({ success: true, room: result.room });
  },

  // GET /chat/rooms
  async getMyRooms(req, res) {
    const { page, limit, type } = req.query;
    const result = await chatService.getMyRooms(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
    });
    return res.json({ success: true, ...result });
  },

  // GET /chat/rooms/:id
  async getRoom(req, res) {
    const result = await chatService.getRoom(req.params.id, req.user.id);
    if (result.error) {
      const status = result.error === 'FORBIDDEN' ? 403 : 404;
      return res.status(status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, room: result.room });
  },

  // POST /chat/rooms/:id/messages
  async sendMessage(req, res) {
    const result = await chatService.sendMessage(req.params.id, req.user.id, req.body);
    if (result.error) {
      const status = result.error === 'FORBIDDEN' ? 403 : result.error === 'NOT_FOUND' ? 404 : 400;
      return res.status(status).json({ success: false, message: result.message });
    }

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`room:${req.params.id}`).emit('new_message', result.message);
    }

    return res.status(201).json({ success: true, message: result.message });
  },

  // GET /chat/rooms/:id/messages
  async getMessages(req, res) {
    const { page, limit, before } = req.query;
    const result = await chatService.getMessages(req.params.id, req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      before,
    });
    if (result.error) {
      const status = result.error === 'FORBIDDEN' ? 403 : 404;
      return res.status(status).json({ success: false, message: result.message });
    }
    return res.json({ success: true, ...result });
  },

  // DELETE /chat/rooms/:roomId/messages/:messageId
  async deleteMessage(req, res) {
    const result = await chatService.deleteMessage(req.params.messageId, req.user.id);
    if (result.error) {
      const status = result.error === 'FORBIDDEN' ? 403 : 404;
      return res.status(status).json({ success: false, message: result.message });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`room:${req.params.id}`).emit('message_deleted', { messageId: req.params.messageId });
    }

    return res.json({ success: true });
  },

  // POST /chat/rooms/:id/read
  async markRead(req, res) {
    const result = await chatService.markRead(req.params.id, req.user.id);
    if (result.error) {
      return res.status(403).json({ success: false, message: result.message });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`room:${req.params.id}`).emit('messages_read', { roomId: req.params.id, userId: req.user.id });
    }

    return res.json({ success: true, markedRead: result.markedRead });
  },

  // POST /chat/rooms/:id/react
  async addReaction(req, res) {
    const { messageId, reactionType } = req.body;
    const result = await chatService.addReaction(messageId, req.user.id, reactionType);
    if (result.error) {
      return res.status(result.error === 'FORBIDDEN' ? 403 : 404).json({ success: false, message: result.message });
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`room:${req.params.id}`).emit('reaction_added', { messageId, userId: req.user.id, reactionType });
    }

    return res.json({ success: true });
  },

  // POST /chat/rooms/:id/participants
  async addParticipant(req, res) {
    const { userId } = req.body;
    const result = await chatService.addParticipant(req.params.id, req.user.id, userId);
    if (result.error) {
      return res.status(result.error === 'FORBIDDEN' ? 403 : 404).json({ success: false, message: result.message });
    }
    return res.json({ success: true });
  },

  // DELETE /chat/rooms/:id/participants/me
  async leaveRoom(req, res) {
    const result = await chatService.leaveRoom(req.params.id, req.user.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.json({ success: true });
  },
};

module.exports = chatController;
