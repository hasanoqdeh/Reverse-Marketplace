// Entity interfaces for Chat Service seed data
export enum ConversationStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
  VIDEO = 'VIDEO',
  LOCATION = 'LOCATION',
  SYSTEM = 'SYSTEM',
}

export interface Conversation {
  conversationId: string;
  requestId: string;
  buyerId: string;
  merchantId: string;
  status: ConversationStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  conversationId: string;
  messageId: string;
  senderId: string;
  messageType: MessageType;
  text?: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt?: Date;
}

export interface MessageDeliveryStatus {
  conversationId: string;
  messageId: string;
  deliveredTo: string;
  status: 'DELIVERED' | 'READ' | 'FAILED';
  updatedAt?: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
  socketId?: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  lastSeen?: Date;
}

// Seed data for Chat Service
export const chatSeedData = {
  conversations: [
    // Active conversation for req-007 (Samsung TV - bid accepted)
    {
      conversationId: 'conv-001',
      requestId: 'req-007',
      buyerId: 'buyer-002',
      merchantId: 'merchant-001',
      status: ConversationStatus.ACTIVE,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    },

    // Active conversation for req-001 (iPhone - multiple bids)
    {
      conversationId: 'conv-002',
      requestId: 'req-001',
      buyerId: 'buyer-001',
      merchantId: 'merchant-001',
      status: ConversationStatus.ACTIVE,
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      conversationId: 'conv-003',
      requestId: 'req-001',
      buyerId: 'buyer-001',
      merchantId: 'merchant-005',
      status: ConversationStatus.ACTIVE,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    },

    // Active conversation for req-003 (Brake Pads)
    {
      conversationId: 'conv-004',
      requestId: 'req-003',
      buyerId: 'buyer-003',
      merchantId: 'merchant-002',
      status: ConversationStatus.ACTIVE,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
      updatedAt: new Date(Date.now() - 20 * 60 * 1000),
    },

    // Archived conversation for req-008 (completed request)
    {
      conversationId: 'conv-005',
      requestId: 'req-008',
      buyerId: 'buyer-003',
      merchantId: 'merchant-002',
      status: ConversationStatus.ARCHIVED,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Blocked conversation
    {
      conversationId: 'conv-006',
      requestId: 'req-002',
      buyerId: 'buyer-002',
      merchantId: 'merchant-005',
      status: ConversationStatus.BLOCKED,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    },
  ] as Conversation[],

  messages: [
    // Messages for conv-001 (Samsung TV)
    {
      conversationId: 'conv-001',
      messageId: 'msg-001',
      senderId: 'merchant-001',
      messageType: MessageType.TEXT,
      text: 'Hello! Thank you for accepting my bid for the Samsung 65" QLED TV. When would you like the delivery?',
      isRead: true,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-002',
      senderId: 'buyer-002',
      messageType: MessageType.TEXT,
      text: 'Hi! Can you deliver tomorrow afternoon around 2 PM?',
      isRead: true,
      createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-003',
      senderId: 'merchant-001',
      messageType: MessageType.TEXT,
      text: 'Yes, tomorrow at 2 PM works perfectly. I\'ll bring the TV and installation equipment. Do you have the wall mount ready?',
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-004',
      senderId: 'buyer-002',
      messageType: MessageType.TEXT,
      text: 'Perfect! The wall mount is already installed. My address is Al-Hail, Street 15, House #42.',
      isRead: true,
      createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-005',
      senderId: 'merchant-001',
      messageType: MessageType.SYSTEM,
      text: 'Delivery scheduled for tomorrow at 2:00 PM',
      isRead: true,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },

    // Messages for conv-002 (iPhone - merchant-001)
    {
      conversationId: 'conv-002',
      messageId: 'msg-006',
      senderId: 'buyer-001',
      messageType: MessageType.TEXT,
      text: 'Hi, I\'m interested in your bid for the iPhone 14 Pro Max. Is it really brand new?',
      isRead: true,
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-007',
      senderId: 'merchant-001',
      messageType: MessageType.TEXT,
      text: 'Yes, absolutely! It\'s 100% brand new sealed box. I can send you pictures of the actual unit if you\'d like.',
      isRead: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-008',
      senderId: 'merchant-001',
      messageType: MessageType.IMAGE,
      mediaUrl: 'https://example.com/chat-images/iphone-sealed-box.jpg',
      isRead: true,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-009',
      senderId: 'buyer-001',
      messageType: MessageType.TEXT,
      text: 'Great! Can you do 4800 SAR? I see another merchant has it for 4799.',
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-010',
      senderId: 'merchant-001',
      messageType: MessageType.TEXT,
      text: 'I can offer 4820 SAR with free screen protector and case. That\'s my best price with the extra accessories.',
      isRead: true,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },

    // Messages for conv-003 (iPhone - merchant-005)
    {
      conversationId: 'conv-003',
      messageId: 'msg-011',
      senderId: 'buyer-001',
      messageType: MessageType.TEXT,
      text: 'Hello, I see your bid for 4799 SAR. Is this the lowest price you can offer?',
      isRead: true,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      conversationId: 'conv-003',
      messageId: 'msg-012',
      senderId: 'merchant-005',
      messageType: MessageType.TEXT,
      text: 'Hi! Yes, 4799 SAR is my special price. It includes free delivery and a screen protector.',
      isRead: true,
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      conversationId: 'conv-003',
      messageId: 'msg-013',
      senderId: 'buyer-001',
      messageType: MessageType.TEXT,
      text: 'How soon can you deliver?',
      isRead: true,
      createdAt: new Date(Date.now() - 18 * 60 * 1000),
    },
    {
      conversationId: 'conv-003',
      messageId: 'msg-014',
      senderId: 'merchant-005',
      messageType: MessageType.TEXT,
      text: 'I can deliver tomorrow morning or this evening. What works better for you?',
      isRead: true,
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
    },

    // Messages for conv-004 (Brake Pads)
    {
      conversationId: 'conv-004',
      messageId: 'msg-015',
      senderId: 'buyer-003',
      messageType: MessageType.TEXT,
      text: 'Are these genuine Toyota parts?',
      isRead: true,
      createdAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      conversationId: 'conv-004',
      messageId: 'msg-016',
      senderId: 'merchant-002',
      messageType: MessageType.TEXT,
      text: 'Yes, 100% genuine Toyota parts with original packaging. I can provide the part numbers for verification.',
      isRead: true,
      createdAt: new Date(Date.now() - 35 * 60 * 1000),
    },
    {
      conversationId: 'conv-004',
      messageId: 'msg-017',
      senderId: 'buyer-003',
      messageType: MessageType.TEXT,
      text: 'Perfect. Can you deliver to Sohar?',
      isRead: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      conversationId: 'conv-004',
      messageId: 'msg-018',
      senderId: 'merchant-002',
      messageType: MessageType.TEXT,
      text: 'Yes, I can deliver to Sohar tomorrow. No extra charge for delivery.',
      isRead: true,
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },

    // Messages for conv-005 (Archived conversation)
    {
      conversationId: 'conv-005',
      messageId: 'msg-019',
      senderId: 'buyer-003',
      messageType: MessageType.TEXT,
      text: 'Hi, I need Nissan Patrol oil filter',
      isRead: true,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-005',
      messageId: 'msg-020',
      senderId: 'merchant-002',
      messageType: MessageType.TEXT,
      text: 'I have 5 pieces in stock. 45 SAR each',
      isRead: true,
      createdAt: new Date(Date.now() - 71 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-005',
      messageId: 'msg-021',
      senderId: 'buyer-003',
      messageType: MessageType.TEXT,
      text: 'Great, I\'ll take all 5',
      isRead: true,
      createdAt: new Date(Date.now() - 70 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-005',
      messageId: 'msg-022',
      senderId: 'merchant-002',
      messageType: MessageType.SYSTEM,
      text: 'Order completed successfully',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Messages for conv-006 (Blocked conversation)
    {
      conversationId: 'conv-006',
      messageId: 'msg-023',
      senderId: 'buyer-002',
      messageType: MessageType.TEXT,
      text: 'Can you lower the price?',
      isRead: true,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-006',
      messageId: 'msg-024',
      senderId: 'merchant-005',
      messageType: MessageType.TEXT,
      text: 'This is already the best price',
      isRead: true,
      createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-006',
      messageId: 'msg-025',
      senderId: 'buyer-002',
      messageType: MessageType.TEXT,
      text: 'Your competitor has it cheaper',
      isRead: true,
      createdAt: new Date(Date.now() - 46 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-006',
      messageId: 'msg-026',
      senderId: 'merchant-005',
      messageType: MessageType.TEXT,
      text: 'Then buy from them',
      isRead: true,
      createdAt: new Date(Date.now() - 45 * 60 * 60 * 1000),
    },
  ] as Message[],

  messageDeliveryStatus: [
    // Delivery status for conv-001 messages
    {
      conversationId: 'conv-001',
      messageId: 'msg-001',
      deliveredTo: 'buyer-002',
      status: 'READ',
      updatedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-002',
      deliveredTo: 'merchant-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-003',
      deliveredTo: 'buyer-002',
      status: 'READ',
      updatedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-004',
      deliveredTo: 'merchant-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      conversationId: 'conv-001',
      messageId: 'msg-005',
      deliveredTo: 'buyer-002',
      status: 'READ',
      updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
    },

    // Delivery status for conv-002 messages
    {
      conversationId: 'conv-002',
      messageId: 'msg-006',
      deliveredTo: 'merchant-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-007',
      deliveredTo: 'buyer-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 40 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-008',
      deliveredTo: 'buyer-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 35 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-009',
      deliveredTo: 'merchant-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 20 * 60 * 1000),
    },
    {
      conversationId: 'conv-002',
      messageId: 'msg-010',
      deliveredTo: 'buyer-001',
      status: 'READ',
      updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  ] as MessageDeliveryStatus[],

  userPresence: [
    {
      userId: 'buyer-001',
      isOnline: true,
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      socketId: 'socket-buyer-001-abc123',
    },
    {
      userId: 'buyer-002',
      isOnline: true,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      socketId: 'socket-buyer-002-def456',
    },
    {
      userId: 'merchant-001',
      isOnline: true,
      lastSeen: new Date(Date.now() - 1 * 60 * 1000),
      socketId: 'socket-merchant-001-ghi789',
    },
    {
      userId: 'merchant-002',
      isOnline: false,
      lastSeen: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      userId: 'merchant-005',
      isOnline: true,
      lastSeen: new Date(Date.now() - 3 * 60 * 1000),
      socketId: 'socket-merchant-005-jkl012',
    },
  ] as UserPresence[],

  typingIndicators: [
    {
      conversationId: 'conv-002',
      userId: 'buyer-001',
      isTyping: true,
      lastSeen: new Date(Date.now() - 30 * 1000),
    },
    {
      conversationId: 'conv-003',
      userId: 'merchant-005',
      isTyping: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    },
  ] as TypingIndicator[],
};

// Helper functions
export const getActiveConversations = () => chatSeedData.conversations.filter(c => c.status === ConversationStatus.ACTIVE);
export const getConversationsByUser = (userId: string) => 
  chatSeedData.conversations.filter(c => c.buyerId === userId || c.merchantId === userId);
export const getMessagesByConversation = (conversationId: string) => 
  chatSeedData.messages.filter(m => m.conversationId === conversationId);
export const getUnreadMessages = (userId: string) => 
  chatSeedData.messages.filter(m => !m.isRead && m.senderId !== userId);
export const getOnlineUsers = () => chatSeedData.userPresence.filter(up => up.isOnline);
