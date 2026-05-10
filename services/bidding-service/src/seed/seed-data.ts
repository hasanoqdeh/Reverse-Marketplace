import { Model } from 'mongoose';
import { Bid, BidStatus, BidSchema } from '../infrastructure/mongodb/schemas/bid.schema';

export const seedBiddingData = async (bidModel: Model<Bid>) => {
  console.log('🌱 Starting Bidding Service seed data...');

  // Clean existing data
  await bidModel.deleteMany({});

  // Clean existing data
  await bidModel.deleteMany({});

  // Create Sample Bids
  const bids = [
    {
      id: 'bid-001',
      requestId: 'req-001', // iPhone 14 Pro Max request
      merchantId: 'merchant-001', // Ali Electronics
      price: 5500.00,
      currency: 'SAR',
      deliveryTime: 2, // 2 days
      description: 'Brand new iPhone 14 Pro Max 256GB Deep Purple. Original Apple warranty included. Fast delivery guaranteed.',
      warranty: '1 year official warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/iphone-14-pro-max-bid-1.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      id: 'bid-002',
      requestId: 'req-001', // iPhone 14 Pro Max request
      merchantId: 'merchant-004', // Tech Solutions
      price: 5450.00,
      currency: 'SAR',
      deliveryTime: 1, // 1 day
      description: 'iPhone 14 Pro Max 256GB in Deep Purple. Sealed box with full Apple warranty. Same day delivery available.',
      warranty: '1 year official warranty + 6 months store warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/iphone-14-pro-max-bid-2.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    },
    {
      id: 'bid-003',
      requestId: 'req-002', // Toyota Camry brake pads
      merchantId: 'merchant-002', // Riyadh Auto Parts
      price: 450.00,
      currency: 'SAR',
      deliveryTime: 3, // 3 days
      description: 'Original Toyota brake pads for Camry 2020 model. Genuine parts with manufacturer warranty.',
      warranty: '2 years manufacturer warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/camry-brake-pads-bid-1.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: 'bid-004',
      requestId: 'req-002', // Toyota Camry brake pads
      merchantId: 'merchant-001', // Ali Electronics
      price: 425.00,
      currency: 'SAR',
      deliveryTime: 2, // 2 days
      description: 'High-quality aftermarket brake pads for Toyota Camry 2020. ISO certified with excellent performance.',
      warranty: '1 year warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/camry-brake-pads-bid-2.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    },
    {
      id: 'bid-005',
      requestId: 'req-003', // Office chairs
      merchantId: 'merchant-003', // Premium Furniture Store
      price: 480.00,
      currency: 'SAR',
      deliveryTime: 7, // 7 days
      description: 'Set of 5 modern ergonomic office chairs. High-quality materials with lumbar support and adjustable height.',
      warranty: '3 years warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/office-chairs-bid-1.jpg',
        'https://s3.amazonaws.com/reverse-marketplace/bids/office-chairs-bid-2.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'bid-006',
      requestId: 'req-003', // Office chairs
      merchantId: 'merchant-001', // Ali Electronics
      price: 450.00,
      currency: 'SAR',
      deliveryTime: 5, // 5 days
      description: '5 modern office chairs with ergonomic design. Basic models but good quality for startup budget.',
      warranty: '1 year warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/office-chairs-bid-3.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 150 * 60 * 1000), // 2.5 hours ago
    },
    {
      id: 'bid-007',
      requestId: 'req-004', // Custom calligraphy
      merchantId: 'merchant-005', // Custom Crafts Workshop
      price: 1200.00,
      currency: 'SAR',
      deliveryTime: 14, // 14 days
      description: 'Custom Arabic calligraphy artwork 100cm x 60cm. Modern style with traditional elements. Premium materials used.',
      warranty: 'Artwork quality guaranteed',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/calligraphy-bid-1.jpg'
      ],
      status: BidStatus.PENDING,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
    },
    {
      id: 'bid-008',
      requestId: 'req-005', // MacBook Pro (In Progress)
      merchantId: 'merchant-004', // Tech Solutions
      price: 12500.00,
      currency: 'SAR',
      deliveryTime: 3, // 3 days
      description: 'MacBook Pro 16" M2 Pro, 32GB RAM, 1TB SSD in Space Gray. Brand new with full Apple warranty.',
      warranty: '1 year Apple warranty + 6 months store warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/macbook-pro-bid-1.jpg'
      ],
      status: BidStatus.ACCEPTED,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
      acceptedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      id: 'bid-009',
      requestId: 'req-005', // MacBook Pro (In Progress)
      merchantId: 'merchant-001', // Ali Electronics
      price: 12700.00,
      currency: 'SAR',
      deliveryTime: 2, // 2 days
      description: 'MacBook Pro 16" M2 Pro with 32GB RAM and 1TB SSD. Space gray color. Fast delivery available.',
      warranty: '1 year official warranty',
      images: [
        'https://s3.amazonaws.com/reverse-marketplace/bids/macbook-pro-bid-2.jpg'
      ],
      status: BidStatus.REJECTED,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      submittedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
      rejectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      rejectionReason: 'Higher price compared to other bid',
    },
  ];

  for (const bidData of bids) {
    await bidModel.create(bidData);
    console.log(`✅ Created bid: ${bidData.price} SAR for request ${bidData.requestId}`);
  }

  console.log(`✅ Bidding Service seed data completed! Created ${bids.length} bids.`);
};
