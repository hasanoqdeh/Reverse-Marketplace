# Reverse Marketplace - Seed Data Documentation

## Overview

This directory contains comprehensive seed data for testing all services in the Reverse Marketplace platform. The seed data covers realistic scenarios with users, merchants, requests, bids, conversations, and payments.

## Structure

```
scripts/seed-data/
├── identity-seed.ts      # Users, merchants, notification preferences
├── request-seed.ts        # Categories, requests, images, views
├── matching-seed.ts       # Merchant interests, coverage areas, match logs
├── bidding-seed.ts        # Bids, bid analytics, status history
├── chat-seed.ts          # Conversations, messages, presence
├── payment-seed.ts       # Wallets, transactions, subscriptions
└── master-seed.ts        # Orchestration script
```

## Quick Start

### Seed All Services
```bash
npm run seed
```

### Seed with Cleanup
```bash
npm run seed --cleanup
```

### Seed Specific Service
```bash
npm run seed --identity-only
npm run seed --request-only
npm run seed --matching-only
npm run seed --bidding-only
npm run seed --chat-only
npm run seed --payment-only
```

## Data Overview

### Identity Service (`identity-seed.ts`)

**Users Created:**
- **Admin Users (2):** System administrator, support manager
- **Buyer Users (5):** Mixed verification status and trust scores
- **Merchant Users (5):** Different business types and verification status

**Key Features:**
- Omani phone numbers (+968)
- Arabic names and businesses
- Realistic trust scores (70-95)
- Verification status variations
- Complete merchant profiles with business details

**Sample Data:**
```typescript
// Admin User
{
  id: 'admin-001',
  phoneNumber: '+96895000001',
  fullName: 'System Administrator',
  role: UserRole.ADMIN,
  isVerified: true,
  isBanned: false,
  trustScore: 100
}

// Merchant Profile
{
  id: 'merchant-profile-001',
  userId: 'merchant-001',
  businessName: 'Oman Electronics Store',
  businessType: 'ELECTRONICS',
  rating: 4.8,
  totalTransactions: 1250,
  responseTime: 15,
  acceptanceRate: 85
}
```

### Request Service (`request-seed.ts`)

**Categories (4 Active):**
- Electronics 📱
- Spare Parts 🔧
- Furniture 🪑
- Custom 🛠️

**Requests Created:**
- **Active Requests (6):** Various categories and locations
- **In Progress (1):** Has accepted bid
- **Completed (1):** Finished transaction
- **Expired (1):** Past deadline
- **Draft (1):** Not yet published

**Geographic Coverage:**
- Muscat (Al-Khuwair, Ruwi, Al-Qurum, Al-Hail)
- Salalah
- Sohar
- Nizwa

**Sample Request:**
```typescript
{
  id: 'req-001',
  buyerId: 'buyer-001',
  categoryId: 'cat-electronics',
  title: 'iPhone 14 Pro Max - 256GB',
  description: 'Looking for iPhone 14 Pro Max 256GB in Deep Purple...',
  latitude: 23.5859,
  longitude: 58.4059,
  status: RequestStatus.ACTIVE,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}
```

### Matching Engine (`matching-seed.ts`)

**Merchant Interests:**
- Category-based preferences
- Priority scoring (1-10)
- Price range filters
- Service radius settings

**Coverage Areas:**
- Geographic service areas
- Service radius in kilometers
- Active/inactive status
- Omani cities and regions

**Status Cache:**
- Real-time merchant availability
- Trust scores and load metrics
- Response time tracking
- Acceptance rates

**Sample Match Log:**
```typescript
{
  id: 'match-log-001',
  requestId: 'req-001',
  matchedMerchants: ['merchant-001', 'merchant-005'],
  totalMerchants: 2,
  matchAlgorithm: 'geo_category_score_v2',
  matchScore: 92,
  processingTime: 145,
  success: true
}
```

### Bidding Service (`bidding-seed.ts`)

**Bids Created:**
- **Pending Bids (6):** Active competition
- **Accepted Bid (1):** Won contract
- **Rejected Bid (1):** Lost to competitor
- **Expired Bid (1):** Request expired
- **Withdrawn Bid (1):** Merchant withdrew

**Bid Analytics:**
- Price statistics per request
- Merchant count tracking
- Delivery time analysis
- Top bid identification

**Sample Bid:**
```typescript
{
  id: 'bid-001',
  request_id: 'req-001',
  merchant_id: 'merchant-001',
  price: 4850,
  currency: 'SAR',
  delivery_time: 2,
  description: 'Brand new iPhone 14 Pro Max...',
  warranty: '1 year Apple warranty + 6 months store warranty',
  status: BidStatus.PENDING
}
```

### Chat Service (`chat-seed.ts`)

**Conversations:**
- **Active (4):** Ongoing discussions
- **Archived (1):** Completed deals
- **Blocked (1):** Problematic interaction

**Messages:**
- Text, image, and system messages
- Read status tracking
- Delivery confirmation
- Real-time typing indicators

**User Presence:**
- Online/offline status
- Last seen tracking
- Socket connection IDs
- Typing indicators

**Sample Conversation:**
```typescript
{
  conversationId: 'conv-001',
  requestId: 'req-007',
  buyerId: 'buyer-002',
  merchantId: 'merchant-001',
  status: ConversationStatus.ACTIVE
}
```

### Payment Service (`payment-seed.ts`)

**Wallets:**
- **Active Wallets (9):** Normal operation
- **Suspended Wallet (1):** Verification issues
- Various balance levels
- Frozen funds for pending deals

**Transactions:**
- Deposits, withdrawals, bid fees
- Subscription payments
- Refunds and bonuses
- Complete status tracking

**Subscription Plans:**
- **Basic:** 49 SAR/month, 50 bids
- **Pro:** 99 SAR/month, 200 bids, priority matching
- **Enterprise:** 299 SAR/year, unlimited bids

**Sample Wallet:**
```typescript
{
  id: 'wallet-buyer-002',
  user_id: 'buyer-002',
  balance: 8000.00,
  currency: 'SAR',
  status: WalletStatus.ACTIVE,
  frozen_balance: 4200.00 // Frozen for accepted bid
}
```

## Test Scenarios Covered

### 1. User Journey Testing
- **New Buyer Registration:** Phone verification, profile creation
- **Merchant Onboarding:** Business registration, document verification
- **Request Creation:** Draft to published workflow
- **Bidding Process:** Multiple bids, competition, selection
- **Deal Completion:** Acceptance, payment, fulfillment

### 2. Edge Cases
- **Expired Requests:** Automatic cleanup
- **Rejected Bids:** Competition handling
- **Blocked Conversations:** Dispute resolution
- **Suspended Accounts:** Verification issues
- **Failed Payments:** Transaction handling

### 3. Performance Testing
- **High Volume:** Multiple concurrent requests
- **Geographic Distribution:** Nationwide coverage
- **Real-time Features:** Chat, notifications, matching
- **Analytics Processing:** Bid analytics, metrics

### 4. Business Logic Testing
- **Trust Score Impact:** Merchant selection
- **Subscription Benefits:** Priority matching, fee discounts
- **Geographic Filtering:** Distance-based matching
- **Category Matching:** Business type validation

## Data Relationships

```
Users (Identity) → Requests (Request Service) → Bids (Bidding Service)
                    ↓                           ↓
            Categories (Request)      ←   Conversations (Chat)
                    ↓                           ↓
            Matching (Matching)       ←   Payments (Payment)
```

## Usage in Testing

### Unit Testing
```typescript
import { identitySeedData } from '../seed-data/identity-seed';

describe('User Service', () => {
  it('should create user with valid data', async () => {
    const user = identitySeedData.users[0];
    const result = await userService.create(user);
    expect(result).toBeDefined();
  });
});
```

### Integration Testing
```typescript
import { runSeeding } from '../seed-data/master-seed';

beforeAll(async () => {
  await runSeeding({ cleanup: true });
});

describe('Request Flow', () => {
  it('should complete full request lifecycle', async () => {
    // Test complete flow with seeded data
  });
});
```

### Performance Testing
```typescript
import { getActiveRequests } from '../seed-data/request-seed';

describe('Load Testing', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = getActiveRequests();
    // Test with realistic data volume
  });
});
```

## Customization

### Adding New Data
1. Update relevant seed file
2. Add helper functions
3. Update master seed script
4. Run with `--cleanup` to refresh

### Environment-Specific Data
```typescript
// For development
const devConfig = {
  services: { identity: true, request: true },
  cleanup: true
};

// For production testing
const prodConfig = {
  services: { all: true },
  cleanup: false
};
```

## Best Practices

1. **Realistic Data:** Use authentic Omani names, businesses, and locations
2. **Edge Cases:** Include failed, expired, and problematic scenarios
3. **Relationships:** Maintain data consistency across services
4. **Performance:** Consider volume for load testing
5. **Privacy:** Use fake phone numbers and PII

## Troubleshooting

### Common Issues
- **Foreign Key Constraints:** Ensure data dependency order
- **Duplicate Data:** Use cleanup option
- **Missing Relations:** Check ID references across services
- **Performance:** Use selective seeding for large datasets

### Debug Mode
```bash
npm run seed --verbose --cleanup
```

## Maintenance

### Regular Updates
- Add new test scenarios as features are added
- Update subscription plans and pricing
- Refresh geographic data
- Add new business categories

### Data Validation
- Run integrity checks after seeding
- Verify relationships between services
- Test edge cases and error conditions
- Validate business rules compliance

---

This seed data provides a comprehensive foundation for testing all aspects of the Reverse Marketplace platform, from basic functionality to complex business scenarios and edge cases.
