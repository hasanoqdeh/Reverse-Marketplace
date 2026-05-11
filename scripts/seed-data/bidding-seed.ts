// Entity interfaces for Bidding Service seed data
export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
  AUTO_REJECTED = 'AUTO_REJECTED',
}

export interface Bid {
  id: string;
  request_id: string;
  merchant_id: string;
  price: number;
  currency: string;
  delivery_time?: number; // in days
  description?: string;
  warranty?: string;
  images?: string[];
  status: BidStatus;
  expires_at?: Date;
  submitted_at?: Date;
  accepted_at?: Date;
  rejected_at?: Date;
  rejection_reason?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BidStatusHistory {
  id: string;
  bidId: string;
  fromStatus?: BidStatus;
  toStatus: BidStatus;
  reason?: string;
  changedBy?: string;
  changedAt?: Date;
}

export interface BidAnalytics {
  id: string;
  requestId: string;
  totalBids: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  averageDeliveryTime: number;
  merchantCount: number;
  topBidId?: string;
  analyticsGeneratedAt?: Date;
}

// Seed data for Bidding Service
export const biddingSeedData = {
  bids: [
    // Bids for req-001 (iPhone 14 Pro Max)
    {
      id: 'bid-001',
      request_id: 'req-001',
      merchant_id: 'merchant-001',
      price: 4850,
      currency: 'SAR',
      delivery_time: 2,
      description: 'Brand new iPhone 14 Pro Max 256GB Deep Purple. Original Apple warranty included. Free delivery within Muscat.',
      warranty: '1 year Apple warranty + 6 months store warranty',
      images: ['https://example.com/bid-images/iphone-stock-1.jpg', 'https://example.com/bid-images/iphone-box-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: 'bid-002',
      request_id: 'req-001',
      merchant_id: 'merchant-005',
      price: 4799,
      currency: 'SAR',
      delivery_time: 3,
      description: 'iPhone 14 Pro Max 256GB Deep Purple - Sealed box. Special discount available. Includes free screen protector.',
      warranty: '1 year Apple warranty',
      images: ['https://example.com/bid-images/iphone-stock-2.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 30 * 60 * 1000),
    },

    // Bids for req-002 (Gaming Laptop)
    {
      id: 'bid-003',
      request_id: 'req-002',
      merchant_id: 'merchant-001',
      price: 8500,
      currency: 'SAR',
      delivery_time: 5,
      description: 'ASUS ROG Strix G16 with RTX 4070, 32GB DDR5 RAM, 1TB NVMe SSD. Top gaming performance guaranteed.',
      warranty: '2 year international warranty + 1 year store warranty',
      images: ['https://example.com/bid-images/rog-laptop-1.jpg', 'https://example.com/bid-images/rog-specs-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 90 * 60 * 1000),
    },

    // Bids for req-003 (Toyota Brake Pads)
    {
      id: 'bid-004',
      request_id: 'req-003',
      merchant_id: 'merchant-002',
      price: 280,
      currency: 'SAR',
      delivery_time: 1,
      description: 'Genuine Toyota brake pads for 2022 Hilux. Front and rear sets included. In stock ready for immediate delivery.',
      warranty: '12 months or 20,000 km warranty',
      images: ['https://example.com/bid-images/toyota-brake-pads-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 45 * 60 * 1000),
    },

    // Bids for req-004 (Honda Battery)
    {
      id: 'bid-005',
      request_id: 'req-004',
      merchant_id: 'merchant-002',
      price: 450,
      currency: 'SAR',
      delivery_time: 2,
      description: 'High-performance battery for Honda Civic 2021. 3-year warranty. Premium brand with excellent reviews.',
      warranty: '36 months warranty',
      images: ['https://example.com/bid-images/honda-battery-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 20 * 60 * 1000),
    },

    // Bids for req-005 (Office Furniture)
    {
      id: 'bid-006',
      request_id: 'req-005',
      merchant_id: 'merchant-003',
      price: 2200,
      currency: 'SAR',
      delivery_time: 7,
      description: 'Modern executive office desk (180x80cm) with ergonomic chair. Premium materials, cable management included.',
      warranty: '5 years warranty on desk, 3 years on chair',
      images: ['https://example.com/bid-images/office-set-1.jpg', 'https://example.com/bid-images/desk-details-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 120 * 60 * 1000),
    },

    // Bids for req-006 (Custom Fabrication)
    {
      id: 'bid-007',
      request_id: 'req-006',
      merchant_id: 'merchant-004',
      price: 3500,
      currency: 'SAR',
      delivery_time: 14,
      description: 'Custom steel storage racks as specified. Heavy-duty construction with 500kg load capacity per shelf.',
      warranty: '2 years warranty against manufacturing defects',
      images: ['https://example.com/bid-images/steel-racks-1.jpg', 'https://example.com/bid-images/fabrication-details-1.jpg'],
      status: BidStatus.PENDING,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      submitted_at: new Date(Date.now() - 180 * 60 * 1000),
    },

    // Accepted bid for req-007 (Samsung TV)
    {
      id: 'bid-008',
      request_id: 'req-007',
      merchant_id: 'merchant-001',
      price: 4200,
      currency: 'SAR',
      delivery_time: 3,
      description: 'Samsung 65" QLED 4K Smart TV 2023 model. Professional installation included. 2-year Samsung warranty.',
      warranty: '2 years Samsung warranty + 1 year store warranty',
      images: ['https://example.com/bid-images/samsung-tv-1.jpg', 'https://example.com/bid-images/tv-installation-1.jpg'],
      status: BidStatus.ACCEPTED,
      submitted_at: new Date(Date.now() - 18 * 60 * 60 * 1000),
      accepted_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },

    // Rejected bid for req-007
    {
      id: 'bid-009',
      request_id: 'req-007',
      merchant_id: 'merchant-005',
      price: 4350,
      currency: 'SAR',
      delivery_time: 4,
      description: 'Samsung 65" QLED TV 2023 model. Free wall mounting service included.',
      warranty: '2 years Samsung warranty',
      images: ['https://example.com/bid-images/samsung-tv-2.jpg'],
      status: BidStatus.REJECTED,
      submitted_at: new Date(Date.now() - 16 * 60 * 60 * 1000),
      rejected_at: new Date(Date.now() - 12 * 60 * 60 * 1000),
      rejection_reason: 'Buyer chose another bid with better price and delivery time',
    },

    // Expired bid
    {
      id: 'bid-010',
      request_id: 'req-009', // Expired request
      merchant_id: 'merchant-003',
      price: 1800,
      currency: 'SAR',
      delivery_time: 10,
      description: 'King size wooden bed frame with built-in storage. Modern design with premium finish.',
      warranty: '3 years warranty',
      images: ['https://example.com/bid-images/bed-frame-1.jpg'],
      status: BidStatus.EXPIRED,
      submitted_at: new Date(Date.now() - 72 * 60 * 60 * 1000),
      expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Withdrawn bid
    {
      id: 'bid-011',
      request_id: 'req-002',
      merchant_id: 'merchant-005',
      price: 8800,
      currency: 'SAR',
      delivery_time: 7,
      description: 'MSI Gaming Laptop with RTX 4070. High-performance gaming machine.',
      warranty: '2 years warranty',
      status: BidStatus.WITHDRAWN,
      submitted_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
      updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ] as Bid[],

  bidStatusHistory: [
    // Status changes for bid-008 (Accepted)
    {
      id: 'bid-hist-001',
      bidId: 'bid-008',
      fromStatus: undefined,
      toStatus: BidStatus.PENDING,
      reason: 'Bid submitted',
      changedBy: 'merchant-001',
      changedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    },
    {
      id: 'bid-hist-002',
      bidId: 'bid-008',
      fromStatus: BidStatus.PENDING,
      toStatus: BidStatus.ACCEPTED,
      reason: 'Bid accepted by buyer',
      changedBy: 'buyer-002',
      changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },

    // Status changes for bid-009 (Rejected)
    {
      id: 'bid-hist-003',
      bidId: 'bid-009',
      fromStatus: undefined,
      toStatus: BidStatus.PENDING,
      reason: 'Bid submitted',
      changedBy: 'merchant-005',
      changedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    },
    {
      id: 'bid-hist-004',
      bidId: 'bid-009',
      fromStatus: BidStatus.PENDING,
      toStatus: BidStatus.REJECTED,
      reason: 'Buyer chose another bid with better price and delivery time',
      changedBy: 'buyer-002',
      changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },

    // Status changes for bid-010 (Expired)
    {
      id: 'bid-hist-005',
      bidId: 'bid-010',
      fromStatus: undefined,
      toStatus: BidStatus.PENDING,
      reason: 'Bid submitted',
      changedBy: 'merchant-003',
      changedAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    },
    {
      id: 'bid-hist-006',
      bidId: 'bid-010',
      fromStatus: BidStatus.PENDING,
      toStatus: BidStatus.EXPIRED,
      reason: 'Bid expired automatically',
      changedBy: 'system',
      changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

    // Status changes for bid-011 (Withdrawn)
    {
      id: 'bid-hist-007',
      bidId: 'bid-011',
      fromStatus: undefined,
      toStatus: BidStatus.PENDING,
      reason: 'Bid submitted',
      changedBy: 'merchant-005',
      changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
    {
      id: 'bid-hist-008',
      bidId: 'bid-011',
      fromStatus: BidStatus.PENDING,
      toStatus: BidStatus.WITHDRAWN,
      reason: 'Merchant withdrew bid due to inventory issues',
      changedBy: 'merchant-005',
      changedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ] as BidStatusHistory[],

  bidAnalytics: [
    // Analytics for req-001 (iPhone)
    {
      id: 'analytics-001',
      requestId: 'req-001',
      totalBids: 2,
      averagePrice: 4824.5,
      minPrice: 4799,
      maxPrice: 4850,
      priceRange: 51,
      averageDeliveryTime: 2.5,
      merchantCount: 2,
      topBidId: 'bid-002', // Lowest price
      analyticsGeneratedAt: new Date(Date.now() - 15 * 60 * 1000),
    },

    // Analytics for req-002 (Gaming Laptop)
    {
      id: 'analytics-002',
      requestId: 'req-002',
      totalBids: 1,
      averagePrice: 8500,
      minPrice: 8500,
      maxPrice: 8500,
      priceRange: 0,
      averageDeliveryTime: 5,
      merchantCount: 1,
      topBidId: 'bid-003',
      analyticsGeneratedAt: new Date(Date.now() - 30 * 60 * 1000),
    },

    // Analytics for req-003 (Brake Pads)
    {
      id: 'analytics-003',
      requestId: 'req-003',
      totalBids: 1,
      averagePrice: 280,
      minPrice: 280,
      maxPrice: 280,
      priceRange: 0,
      averageDeliveryTime: 1,
      merchantCount: 1,
      topBidId: 'bid-004',
      analyticsGeneratedAt: new Date(Date.now() - 20 * 60 * 1000),
    },

    // Analytics for req-004 (Honda Battery)
    {
      id: 'analytics-004',
      requestId: 'req-004',
      totalBids: 1,
      averagePrice: 450,
      minPrice: 450,
      maxPrice: 450,
      priceRange: 0,
      averageDeliveryTime: 2,
      merchantCount: 1,
      topBidId: 'bid-005',
      analyticsGeneratedAt: new Date(Date.now() - 10 * 60 * 1000),
    },

    // Analytics for req-005 (Office Furniture)
    {
      id: 'analytics-005',
      requestId: 'req-005',
      totalBids: 1,
      averagePrice: 2200,
      minPrice: 2200,
      maxPrice: 2200,
      priceRange: 0,
      averageDeliveryTime: 7,
      merchantCount: 1,
      topBidId: 'bid-006',
      analyticsGeneratedAt: new Date(Date.now() - 60 * 60 * 1000),
    },

    // Analytics for req-006 (Custom Fabrication)
    {
      id: 'analytics-006',
      requestId: 'req-006',
      totalBids: 1,
      averagePrice: 3500,
      minPrice: 3500,
      maxPrice: 3500,
      priceRange: 0,
      averageDeliveryTime: 14,
      merchantCount: 1,
      topBidId: 'bid-007',
      analyticsGeneratedAt: new Date(Date.now() - 90 * 60 * 1000),
    },

    // Analytics for req-007 (Samsung TV)
    {
      id: 'analytics-007',
      requestId: 'req-007',
      totalBids: 2,
      averagePrice: 4275,
      minPrice: 4200,
      maxPrice: 4350,
      priceRange: 150,
      averageDeliveryTime: 3.5,
      merchantCount: 2,
      topBidId: 'bid-008', // Accepted bid
      analyticsGeneratedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },

    // Analytics for req-009 (Expired Request)
    {
      id: 'analytics-008',
      requestId: 'req-009',
      totalBids: 1,
      averagePrice: 1800,
      minPrice: 1800,
      maxPrice: 1800,
      priceRange: 0,
      averageDeliveryTime: 10,
      merchantCount: 1,
      topBidId: 'bid-010',
      analyticsGeneratedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ] as BidAnalytics[],
};

// Helper functions
export const getPendingBids = () => biddingSeedData.bids.filter(b => b.status === BidStatus.PENDING);
export const getAcceptedBids = () => biddingSeedData.bids.filter(b => b.status === BidStatus.ACCEPTED);
export const getBidsByRequest = (requestId: string) => biddingSeedData.bids.filter(b => b.request_id === requestId);
export const getBidsByMerchant = (merchantId: string) => biddingSeedData.bids.filter(b => b.merchant_id === merchantId);
export const getLowestBid = (requestId: string) => {
  const bids = getBidsByRequest(requestId).filter(b => b.status === BidStatus.PENDING);
  return bids.reduce((lowest, bid) => (bid.price < lowest.price ? bid : lowest), bids[0]);
};
