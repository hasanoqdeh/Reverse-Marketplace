import { Schema, Document } from 'mongoose';

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
  AUTO_REJECTED = 'AUTO_REJECTED',
}

export interface Bid extends Document {
  requestId: string;
  buyerId: string;
  merchantId: string;
  price: any; // Decimal128
  currency: string;
  deliveryTime?: string;
  notes?: string;
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    originalFileName: string;
    uploadedAt: Date;
  }>;
  status: BidStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Analytics fields
  viewedAt?: Date;
  merchantTrustScore?: number;
  responseTimeMs?: number;
}

const BidSchema = new Schema<Bid>({
  requestId: {
    type: String,
    required: true,
    index: true,
  },
  buyerId: {
    type: String,
    required: true,
    index: true,
  },
  merchantId: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Schema.Types.Decimal128,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    enum: ['OMR', 'USD', 'EUR'],
    default: 'OMR',
  },
  deliveryTime: {
    type: String,
    maxlength: 100,
  },
  notes: {
    type: String,
    maxlength: 1000,
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    originalFileName: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: Object.values(BidStatus),
    default: BidStatus.PENDING,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Analytics fields
  viewedAt: Date,
  merchantTrustScore: {
    type: Number,
    min: 0,
    max: 5,
  },
  responseTimeMs: {
    type: Number,
    min: 0,
  },
});

// Compound indexes for performance
BidSchema.index({ requestId: 1, status: 1 });
BidSchema.index({ merchantId: 1, status: 1 });
BidSchema.index({ buyerId: 1, status: 1 });
BidSchema.index({ requestId: 1, merchantId: 1 }, { unique: true }); // One bid per merchant per request

// Pre-save middleware
BidSchema.pre('save', function(next) {
  // updatedAt will be handled by the application layer
  next();
});

export { BidSchema };
