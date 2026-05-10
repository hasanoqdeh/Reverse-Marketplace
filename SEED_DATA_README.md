# Seed Data Documentation

This document describes the comprehensive seed data created for the Reverse Marketplace platform.

## Overview

The seed data provides a realistic testing environment with:
- **12 Users**: 2 Admins, 5 Buyers, 5 Merchants
- **5 Sample Requests**: Electronics, Spare Parts, Furniture, Custom items
- **9 Bids**: Competitive bidding with different statuses
- **1 Active Conversation**: Chat messages for an accepted bid
- **Wallets & Transactions**: Financial data for all users
- **Subscription Plans**: Basic, Professional, Enterprise tiers
- **Matching Data**: Merchant interests, coverage areas, and analytics

## Data Structure

### Users & Authentication

#### Admin Users
- **System Administrator** (+966500000001) - Full system access
- **Support Manager** (+966500000002) - User management and support

#### Buyer Users
- **Ahmed Mohammed** (+966511111111) - Trust Score: 85.5, Balance: 5,000 SAR
- **Fatima Al-Rashid** (+966522222222) - Trust Score: 92.3, Balance: 3,000 SAR
- **Khalid Abdullah** (+966533333333) - Trust Score: 78.9, Balance: 7,500 SAR
- **Nora Al-Saud** (+966544444444) - Trust Score: 88.7, Balance: 2,000 SAR
- **Mohammed Al-Hassan** (+966555555555) - Trust Score: 91.2, Balance: 10,000 SAR

#### Merchant Users
- **Ali Electronics** (+966511111110) - Trust Score: 94.5, Professional Plan
- **Riyadh Auto Parts** (+966522222220) - Trust Score: 89.8, Basic Plan
- **Premium Furniture Store** (+966533333330) - Trust Score: 96.2, Enterprise Plan
- **Tech Solutions** (+966544444440) - Trust Score: 87.3, Professional Plan
- **Custom Crafts Workshop** (+966555555550) - Trust Score: 91.7, Basic Plan (Trial)

### Sample Requests

1. **iPhone 14 Pro Max** (req-001)
   - Buyer: Ahmed Mohammed
   - Category: Electronics
   - Budget: ~5,500 SAR
   - Status: Active
   - Bids: 2 (Ali Electronics, Tech Solutions)

2. **Toyota Camry Brake Pads** (req-002)
   - Buyer: Fatima Al-Rashid
   - Category: Spare Parts
   - Budget: ~450 SAR
   - Status: Active
   - Bids: 2 (Riyadh Auto Parts, Ali Electronics)

3. **Modern Office Chair Set** (req-003)
   - Buyer: Khalid Abdullah
   - Category: Furniture
   - Budget: ~500 SAR per chair
   - Status: Active
   - Bids: 2 (Premium Furniture Store, Ali Electronics)

4. **Custom Arabic Calligraphy** (req-004)
   - Buyer: Nora Al-Saud
   - Category: Custom
   - Budget: ~1,200 SAR
   - Status: Active
   - Bids: 1 (Custom Crafts Workshop)

5. **MacBook Pro 16" M2** (req-005)
   - Buyer: Mohammed Al-Hassan
   - Category: Electronics
   - Budget: ~12,500 SAR
   - Status: In Progress
   - Bids: 2 (Tech Solutions - Accepted, Ali Electronics - Rejected)

### Bidding Data

#### Active Bids (4 requests)
- iPhone 14 Pro Max: 5,500 SAR (Ali Electronics), 5,450 SAR (Tech Solutions)
- Toyota Camry Brake Pads: 450 SAR (Riyadh Auto Parts), 425 SAR (Ali Electronics)
- Office Chairs: 480 SAR (Premium Furniture Store), 450 SAR (Ali Electronics)
- Custom Calligraphy: 1,200 SAR (Custom Crafts Workshop)

#### Completed Deal (1 request)
- MacBook Pro: 12,500 SAR (Tech Solutions) - Accepted by buyer

### Chat Conversation

Active conversation between Mohammed Al-Hassan (buyer) and Tech Solutions (merchant):
- 10 messages exchanged
- Includes text, location sharing, and image sharing
- Deal coordination and delivery details
- System completion message

### Financial Data

#### Wallet Balances
- Buyers: 2,000 - 10,000 SAR each
- Merchants: 5,000 - 25,000 SAR each
- Admins: 0 SAR (no transactions)

#### Subscription Plans
- **Basic**: 99 SAR/month - 50 bids/month, 5% commission
- **Professional**: 299 SAR/month - 200 bids/month, 3% commission
- **Enterprise**: 999 SAR/month - Unlimited bids, 2% commission

#### Transactions
- Wallet deposits for buyers
- Subscription payments for merchants
- Bid fees (10 SAR per bid)
- Payouts for completed deals

### Matching Engine Data

#### Merchant Interests
- Each merchant registered for relevant categories
- Priority levels for matching algorithm

#### Coverage Areas
- Geographic service areas with radius
- Multiple cities per merchant
- Different service radii (30-100 km)

#### Merchant Status Cache
- Real-time availability status
- Trust scores and ratings
- Performance metrics
- Response speed analytics

## Running Seed Data

### Prerequisites
1. Start all databases (PostgreSQL, MongoDB, Redis, Cassandra)
2. Start RabbitMQ
3. Ensure all services are built

### Individual Service Seeding
```bash
# Seed identity service (users, merchants, verification)
pnpm run seed:identity

# Seed request service (categories, requests, images)
pnpm run seed:request

# Seed payment service (wallets, subscriptions, transactions)
pnpm run seed:payment

# Seed bidding service (bids, analytics)
pnpm run seed:bidding

# Seed chat service (conversations, messages)
pnpm run seed:chat

# Seed matching engine (merchant data, analytics)
pnpm run seed:matching
```

### Full System Seeding
```bash
# Seed all services in correct order
pnpm run seed:all
```

## Data Relationships

The seed data maintains proper relationships:
- Users → Wallets → Transactions
- Users → Notification Preferences
- Merchants → Profiles → Documents → Subscriptions
- Requests → Images → Status History → Views
- Requests → Bids → Chat Conversations → Messages
- Merchants → Interests → Coverage Areas → Status Cache → Match Logs

## Testing Scenarios

This seed data enables testing of:
1. **User Registration & Authentication**
2. **Merchant Verification Workflow**
3. **Request Creation & Publishing**
4. **Real-time Matching Algorithm**
5. **Competitive Bidding System**
6. **Chat & Communication**
7. **Payment Processing**
8. **Subscription Management**
9. **Admin Dashboard Features**
10. **Analytics & Reporting**

## Security Notes

- All phone numbers are fictional
- No real payment information included
- Document URLs are placeholder S3 paths
- Passwords are not included (OTP-based auth only)

## Customization

To modify seed data:
1. Update the relevant seed file in `services/{service}/src/seed/seed-data.ts`
2. Adjust user IDs, phone numbers, and relationships carefully
3. Maintain foreign key consistency across services
4. Re-run the specific service seed or full seeding

## Troubleshooting

### Common Issues
1. **Foreign Key Constraints**: Ensure services are seeded in dependency order
2. **Missing Dependencies**: Install all required packages before seeding
3. **Database Connections**: Verify all databases are running and accessible
4. **Permission Errors**: Ensure database user has proper permissions

### Reset Data
To reset all seed data:
```bash
# Stop all services
# Clear databases
# Re-run seeding
pnpm run seed:all
```
