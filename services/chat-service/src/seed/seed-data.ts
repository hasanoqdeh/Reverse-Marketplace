import { MessageModel, MessageType } from '../infrastructure/cassandra/models/message.model';
import { ConversationModel } from '../infrastructure/cassandra/models/conversation.model';

export const seedChatData = async () => {
  console.log('🌱 Starting Chat Service seed data...');

  // Note: This seed data uses direct Cassandra queries since the service uses Cassandra
// In a real implementation, you would use the MessageModel queries

  const conversations = [
    {
      id: 'conv-001',
      request_id: 'req-005', // MacBook Pro request where bid was accepted
      buyer_id: 'buyer-005',
      merchant_id: 'merchant-004', // Tech Solutions (accepted bid)
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      updated_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ];

  const messages = [
    {
      conversation_id: 'conv-001',
      message_id: 'msg-001', // Would be TimeUuid in real implementation
      sender_id: 'buyer-005',
      message_type: MessageType.TEXT,
      text: 'Hello! I accepted your bid for MacBook Pro. Can you confirm specifications?',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-002',
      sender_id: 'merchant-004',
      message_type: MessageType.TEXT,
      text: 'Thank you for choosing Tech Solutions! Yes, I can confirm: MacBook Pro 16" M2 Pro, 32GB RAM, 1TB SSD, Space Gray. Brand new sealed box.',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-003',
      sender_id: 'buyer-005',
      message_type: MessageType.TEXT,
      text: 'Perfect! When can you deliver it? I\'m in Dammam.',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-004',
      sender_id: 'merchant-004',
      message_type: MessageType.TEXT,
      text: 'I can deliver it tomorrow afternoon. Would 3 PM work for you? I\'ll bring original invoice and warranty papers.',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-005',
      sender_id: 'buyer-005',
      message_type: MessageType.TEXT,
      text: '3 PM sounds great! My address is [Address details]. Can you send me your location for tracking?',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-006',
      sender_id: 'merchant-004',
      message_type: MessageType.LOCATION,
      text: 'Here\'s my current location. I\'ll start heading your way at 2 PM.',
      media_url: 'https://maps.googleapis.com/maps/api/staticmap?center=24.7136,46.6753&zoom=15&size=600x400',
      is_read: true,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-007',
      sender_id: 'buyer-005',
      message_type: MessageType.IMAGE,
      text: 'This is where I need it delivered. The building has parking available.',
      media_url: 'https://s3.amazonaws.com/reverse-marketplace/chat/delivery-location.jpg',
      is_read: true,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-008',
      sender_id: 'merchant-004',
      message_type: MessageType.TEXT,
      text: 'Perfect! I\'ve noted location. I\'ll call you when I\'m 15 minutes away. Payment can be made upon delivery via cash or card.',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-009',
      sender_id: 'buyer-005',
      message_type: MessageType.TEXT,
      text: 'Excellent! I\'ll prefer card payment. See you tomorrow at 3 PM. Thanks!',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      conversation_id: 'conv-001',
      message_id: 'msg-010',
      sender_id: 'merchant-004',
      message_type: MessageType.SYSTEM,
      text: 'Deal completed successfully! Both parties have confirmed delivery and payment.',
      media_url: null,
      is_read: true,
      created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ];

  console.log(`✅ Chat Service seed data structure created!`);
  console.log(`   - ${conversations.length} conversations`);
  console.log(`   - ${messages.length} messages`);
  console.log('   Note: Actual Cassandra insertion would require MessageModel queries');
};
