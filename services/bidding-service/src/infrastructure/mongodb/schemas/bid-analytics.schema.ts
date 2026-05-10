import { Schema, Document } from 'mongoose';

export interface BidAnalytics extends Document {
  requestId: string;
  totalBids: number;
  avgPrice: any; // Decimal128
  lowestPrice: any; // Decimal128
  highestPrice: any; // Decimal128
  priceRange: any; // Decimal128
  currency: string;
  lastUpdated: Date;
  // Additional analytics
  avgMerchantTrustScore: number;
  avgDeliveryTime?: string;
  bidDistribution: {
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
    withdrawn: number;
    autoRejected: number;
  };
  topBids: Array<{
    bidId: string;
    merchantId: string;
    price: number;
    merchantTrustScore: number;
    rank: number;
  }>;
}

const BidAnalyticsSchema = new Schema<BidAnalytics>({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  totalBids: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  avgPrice: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  lowestPrice: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  highestPrice: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  priceRange: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    enum: ['OMR', 'USD', 'EUR'],
    default: 'OMR',
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // Additional analytics
  avgMerchantTrustScore: {
    type: Number,
    min: 0,
    max: 5,
  },
  avgDeliveryTime: String,
  bidDistribution: {
    pending: { type: Number, default: 0 },
    accepted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    expired: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
    autoRejected: { type: Number, default: 0 },
  },
  topBids: [{
    bidId: { type: String, required: true },
    merchantId: { type: String, required: true },
    price: { type: Schema.Types.Decimal128, required: true },
    merchantTrustScore: { type: Number, required: true },
    rank: { type: Number, required: true },
  }],
});

// Index for performance
BidAnalyticsSchema.index({ lastUpdated: -1 });

export { BidAnalyticsSchema };
