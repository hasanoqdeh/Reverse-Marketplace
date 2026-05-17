'use strict';

const chatService = require('../services/chatService');

const chatAdminController = {
  // GET /chat/admin/rooms
  async listRooms(req, res) {
    const { page, limit, type, isActive, search } = req.query;
    const result = await chatService.adminGetRooms({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });
    return res.json({ success: true, ...result });
  },

  // GET /chat/admin/rooms/:id
  async getRoom(req, res) {
    const result = await chatService.adminGetRoom(req.params.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.json({ success: true, room: result.room });
  },

  // GET /chat/admin/rooms/:id/messages
  async getMessages(req, res) {
    const { page, limit } = req.query;
    const result = await chatService.adminGetMessages(req.params.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.json({ success: true, ...result });
  },

  // DELETE /chat/admin/messages/:messageId
  async deleteMessage(req, res) {
    const result = await chatService.adminDeleteMessage(req.params.messageId, req.user.id);
    if (result.error) {
      return res.status(404).json({ success: false, message: result.message });
    }
    return res.json({ success: true });
  },
};

module.exports = chatAdminController;
