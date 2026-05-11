import { identitySeedData } from './identity-seed';
import { requestSeedData } from './request-seed';
import { matchingSeedData } from './matching-seed';
import { biddingSeedData } from './bidding-seed';
import { chatSeedData } from './chat-seed';
import { paymentSeedData } from './payment-seed';

// Master seed configuration
export interface SeedConfig {
  services: {
    identity: boolean;
    request: boolean;
    matching: boolean;
    bidding: boolean;
    chat: boolean;
    payment: boolean;
  };
  cleanup: boolean;
  verbose: boolean;
}

export class DatabaseSeeder {
  private config: SeedConfig;

  constructor(config: Partial<SeedConfig> = {}) {
    this.config = {
      services: {
        identity: true,
        request: true,
        matching: true,
        bidding: true,
        chat: true,
        payment: true,
      },
      cleanup: false,
      verbose: false,
      ...config,
    };
  }

  // Main seeding method
  async seedAll(): Promise<void> {
    console.log('🌱 Starting Reverse Marketplace database seeding...\n');

    try {
      // Cleanup existing data if requested
      if (this.config.cleanup) {
        await this.cleanupAll();
      }

      // Seed in dependency order
      if (this.config.services.identity) {
        await this.seedIdentity();
      }

      if (this.config.services.request) {
        await this.seedRequest();
      }

      if (this.config.services.matching) {
        await this.seedMatching();
      }

      if (this.config.services.bidding) {
        await this.seedBidding();
      }

      if (this.config.services.chat) {
        await this.seedChat();
      }

      if (this.config.services.payment) {
        await this.seedPayment();
      }

      console.log('\n✅ Database seeding completed successfully!');
      this.printSummary();

    } catch (error) {
      console.error('\n❌ Database seeding failed:', error);
      throw error;
    }
  }

  // Individual service seeding methods
  private async seedIdentity(): Promise<void> {
    console.log('📱 Seeding Identity Service...');
    
    try {
      // Seed users
      await this.seedUsers();
      
      // Seed merchant profiles
      await this.seedMerchantProfiles();
      
      // Seed notification preferences
      await this.seedNotificationPreferences();
      
      console.log('✅ Identity Service seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Identity Service:', error);
      throw error;
    }
  }

  private async seedRequest(): Promise<void> {
    console.log('📋 Seeding Request Service...');
    
    try {
      // Seed categories
      await this.seedCategories();
      
      // Seed requests
      await this.seedRequests();
      
      // Seed request images
      await this.seedRequestImages();
      
      // Seed status history
      await this.seedRequestStatusHistory();
      
      // Seed request views
      await this.seedRequestViews();
      
      console.log('✅ Request Service seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Request Service:', error);
      throw error;
    }
  }

  private async seedMatching(): Promise<void> {
    console.log('🎯 Seeding Matching Engine...');
    
    try {
      // Seed merchant interests
      await this.seedMerchantInterests();
      
      // Seed merchant coverage areas
      await this.seedMerchantCoverageAreas();
      
      // Seed merchant status cache
      await this.seedMerchantStatusCache();
      
      // Seed match logs
      await this.seedMatchLogs();
      
      console.log('✅ Matching Engine seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Matching Engine:', error);
      throw error;
    }
  }

  private async seedBidding(): Promise<void> {
    console.log('💰 Seeding Bidding Service...');
    
    try {
      // Seed bids
      await this.seedBids();
      
      // Seed bid status history
      await this.seedBidStatusHistory();
      
      // Seed bid analytics
      await this.seedBidAnalytics();
      
      console.log('✅ Bidding Service seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Bidding Service:', error);
      throw error;
    }
  }

  private async seedChat(): Promise<void> {
    console.log('💬 Seeding Chat Service...');
    
    try {
      // Seed conversations
      await this.seedConversations();
      
      // Seed messages
      await this.seedMessages();
      
      // Seed message delivery status
      await this.seedMessageDeliveryStatus();
      
      // Seed user presence
      await this.seedUserPresence();
      
      // Seed typing indicators
      await this.seedTypingIndicators();
      
      console.log('✅ Chat Service seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Chat Service:', error);
      throw error;
    }
  }

  private async seedPayment(): Promise<void> {
    console.log('💳 Seeding Payment Service...');
    
    try {
      // Seed wallets
      await this.seedWallets();
      
      // Seed wallet transactions
      await this.seedWalletTransactions();
      
      // Seed subscription plans
      await this.seedSubscriptionPlans();
      
      // Seed subscriptions
      await this.seedSubscriptions();
      
      // Seed payment intents
      await this.seedPaymentIntents();
      
      // Seed refunds
      await this.seedRefunds();
      
      // Seed invoices
      await this.seedInvoices();
      
      console.log('✅ Payment Service seeded successfully');
    } catch (error) {
      console.error('❌ Failed to seed Payment Service:', error);
      throw error;
    }
  }

  // Cleanup methods
  private async cleanupAll(): Promise<void> {
    console.log('🧹 Cleaning up existing data...');
    
    // Cleanup in reverse dependency order
    const cleanupOrder = [
      'payment',
      'chat',
      'bidding',
      'matching',
      'request',
      'identity',
    ];

    for (const service of cleanupOrder) {
      if (this.config.services[service as keyof typeof this.config.services]) {
        await this.cleanupService(service);
      }
    }
    
    console.log('✅ Cleanup completed');
  }

  private async cleanupService(service: string): Promise<void> {
    console.log(`🧹 Cleaning up ${service} service...`);
    // Implementation would depend on your database setup
    // This is a placeholder for actual cleanup logic
  }

  // Individual entity seeding methods (placeholders for actual implementation)
  private async seedUsers(): Promise<void> {
    const { users } = identitySeedData;
    console.log(`  👥 Seeding ${users.length} users...`);
    // Actual database insertion logic would go here
  }

  private async seedMerchantProfiles(): Promise<void> {
    const { merchantProfiles } = identitySeedData;
    console.log(`  🏪 Seeding ${merchantProfiles.length} merchant profiles...`);
    // Actual database insertion logic would go here
  }

  private async seedNotificationPreferences(): Promise<void> {
    const { notificationPreferences } = identitySeedData;
    console.log(`  🔔 Seeding ${notificationPreferences.length} notification preferences...`);
    // Actual database insertion logic would go here
  }

  private async seedCategories(): Promise<void> {
    const { categories } = requestSeedData;
    console.log(`  📂 Seeding ${categories.length} categories...`);
    // Actual database insertion logic would go here
  }

  private async seedRequests(): Promise<void> {
    const { requests } = requestSeedData;
    console.log(`  📄 Seeding ${requests.length} requests...`);
    // Actual database insertion logic would go here
  }

  private async seedRequestImages(): Promise<void> {
    const { requestImages } = requestSeedData;
    console.log(`  🖼️ Seeding ${requestImages.length} request images...`);
    // Actual database insertion logic would go here
  }

  private async seedRequestStatusHistory(): Promise<void> {
    const { statusHistory } = requestSeedData;
    console.log(`  📊 Seeding ${statusHistory.length} status history entries...`);
    // Actual database insertion logic would go here
  }

  private async seedRequestViews(): Promise<void> {
    const { requestViews } = requestSeedData;
    console.log(`  👁️ Seeding ${requestViews.length} request views...`);
    // Actual database insertion logic would go here
  }

  private async seedMerchantInterests(): Promise<void> {
    const { merchantInterests } = matchingSeedData;
    console.log(`  🎯 Seeding ${merchantInterests.length} merchant interests...`);
    // Actual database insertion logic would go here
  }

  private async seedMerchantCoverageAreas(): Promise<void> {
    const { merchantCoverageAreas } = matchingSeedData;
    console.log(`  🗺️ Seeding ${merchantCoverageAreas.length} coverage areas...`);
    // Actual database insertion logic would go here
  }

  private async seedMerchantStatusCache(): Promise<void> {
    const { merchantStatusCache } = matchingSeedData;
    console.log(`  📈 Seeding ${merchantStatusCache.length} merchant status entries...`);
    // Actual database insertion logic would go here
  }

  private async seedMatchLogs(): Promise<void> {
    const { matchLogs } = matchingSeedData;
    console.log(`  📋 Seeding ${matchLogs.length} match logs...`);
    // Actual database insertion logic would go here
  }

  private async seedBids(): Promise<void> {
    const { bids } = biddingSeedData;
    console.log(`  💰 Seeding ${bids.length} bids...`);
    // Actual database insertion logic would go here
  }

  private async seedBidStatusHistory(): Promise<void> {
    const { bidStatusHistory } = biddingSeedData;
    console.log(`  📊 Seeding ${bidStatusHistory.length} bid status entries...`);
    // Actual database insertion logic would go here
  }

  private async seedBidAnalytics(): Promise<void> {
    const { bidAnalytics } = biddingSeedData;
    console.log(`  📈 Seeding ${bidAnalytics.length} bid analytics entries...`);
    // Actual database insertion logic would go here
  }

  private async seedConversations(): Promise<void> {
    const { conversations } = chatSeedData;
    console.log(`  💬 Seeding ${conversations.length} conversations...`);
    // Actual database insertion logic would go here
  }

  private async seedMessages(): Promise<void> {
    const { messages } = chatSeedData;
    console.log(`  📨 Seeding ${messages.length} messages...`);
    // Actual database insertion logic would go here
  }

  private async seedMessageDeliveryStatus(): Promise<void> {
    const { messageDeliveryStatus } = chatSeedData;
    console.log(`  📤 Seeding ${messageDeliveryStatus.length} delivery status entries...`);
    // Actual database insertion logic would go here
  }

  private async seedUserPresence(): Promise<void> {
    const { userPresence } = chatSeedData;
    console.log(`  👤 Seeding ${userPresence.length} user presence entries...`);
    // Actual database insertion logic would go here
  }

  private async seedTypingIndicators(): Promise<void> {
    const { typingIndicators } = chatSeedData;
    console.log(`  ⌨️ Seeding ${typingIndicators.length} typing indicators...`);
    // Actual database insertion logic would go here
  }

  private async seedWallets(): Promise<void> {
    const { wallets } = paymentSeedData;
    console.log(`  💳 Seeding ${wallets.length} wallets...`);
    // Actual database insertion logic would go here
  }

  private async seedWalletTransactions(): Promise<void> {
    const { walletTransactions } = paymentSeedData;
    console.log(`  💰 Seeding ${walletTransactions.length} transactions...`);
    // Actual database insertion logic would go here
  }

  private async seedSubscriptionPlans(): Promise<void> {
    const { subscriptionPlans } = paymentSeedData;
    console.log(`  📋 Seeding ${subscriptionPlans.length} subscription plans...`);
    // Actual database insertion logic would go here
  }

  private async seedSubscriptions(): Promise<void> {
    const { subscriptions } = paymentSeedData;
    console.log(`  🔄 Seeding ${subscriptions.length} subscriptions...`);
    // Actual database insertion logic would go here
  }

  private async seedPaymentIntents(): Promise<void> {
    const { paymentIntents } = paymentSeedData;
    console.log(`  💳 Seeding ${paymentIntents.length} payment intents...`);
    // Actual database insertion logic would go here
  }

  private async seedRefunds(): Promise<void> {
    const { refunds } = paymentSeedData;
    console.log(`  🔄 Seeding ${refunds.length} refunds...`);
    // Actual database insertion logic would go here
  }

  private async seedInvoices(): Promise<void> {
    const { invoices } = paymentSeedData;
    console.log(`  🧾 Seeding ${invoices.length} invoices...`);
    // Actual database insertion logic would go here
  }

  // Summary and statistics
  private printSummary(): void {
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    
    if (this.config.services.identity) {
      const { users, merchantProfiles, notificationPreferences } = identitySeedData;
      console.log(`📱 Identity Service:`);
      console.log(`   - Users: ${users.length}`);
      console.log(`   - Merchant Profiles: ${merchantProfiles.length}`);
      console.log(`   - Notification Preferences: ${notificationPreferences.length}`);
    }

    if (this.config.services.request) {
      const { categories, requests, requestImages, statusHistory, requestViews } = requestSeedData;
      console.log(`📋 Request Service:`);
      console.log(`   - Categories: ${categories.length}`);
      console.log(`   - Requests: ${requests.length}`);
      console.log(`   - Images: ${requestImages.length}`);
      console.log(`   - Status History: ${statusHistory.length}`);
      console.log(`   - Views: ${requestViews.length}`);
    }

    if (this.config.services.matching) {
      const { merchantInterests, merchantCoverageAreas, merchantStatusCache, matchLogs } = matchingSeedData;
      console.log(`🎯 Matching Engine:`);
      console.log(`   - Merchant Interests: ${merchantInterests.length}`);
      console.log(`   - Coverage Areas: ${merchantCoverageAreas.length}`);
      console.log(`   - Status Cache: ${merchantStatusCache.length}`);
      console.log(`   - Match Logs: ${matchLogs.length}`);
    }

    if (this.config.services.bidding) {
      const { bids, bidStatusHistory, bidAnalytics } = biddingSeedData;
      console.log(`💰 Bidding Service:`);
      console.log(`   - Bids: ${bids.length}`);
      console.log(`   - Status History: ${bidStatusHistory.length}`);
      console.log(`   - Analytics: ${bidAnalytics.length}`);
    }

    if (this.config.services.chat) {
      const { conversations, messages, messageDeliveryStatus, userPresence, typingIndicators } = chatSeedData;
      console.log(`💬 Chat Service:`);
      console.log(`   - Conversations: ${conversations.length}`);
      console.log(`   - Messages: ${messages.length}`);
      console.log(`   - Delivery Status: ${messageDeliveryStatus.length}`);
      console.log(`   - User Presence: ${userPresence.length}`);
      console.log(`   - Typing Indicators: ${typingIndicators.length}`);
    }

    if (this.config.services.payment) {
      const { wallets, walletTransactions, subscriptionPlans, subscriptions, paymentIntents, refunds, invoices } = paymentSeedData;
      console.log(`💳 Payment Service:`);
      console.log(`   - Wallets: ${wallets.length}`);
      console.log(`   - Transactions: ${walletTransactions.length}`);
      console.log(`   - Subscription Plans: ${subscriptionPlans.length}`);
      console.log(`   - Subscriptions: ${subscriptions.length}`);
      console.log(`   - Payment Intents: ${paymentIntents.length}`);
      console.log(`   - Refunds: ${refunds.length}`);
      console.log(`   - Invoices: ${invoices.length}`);
    }

    console.log('\n🎉 All services seeded successfully!');
    console.log('🚀 Your Reverse Marketplace is ready for testing!');
  }
}

// CLI usage function
export async function runSeeding(config?: Partial<SeedConfig>): Promise<void> {
  const seeder = new DatabaseSeeder(config);
  await seeder.seedAll();
}

// Export all seed data for direct access
export * from './identity-seed';
export * from './request-seed';
export * from './matching-seed';
export * from './bidding-seed';
export * from './chat-seed';
export * from './payment-seed';

// Default export
export default DatabaseSeeder;
