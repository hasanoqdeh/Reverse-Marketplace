import { Schema, Document } from 'mongoose';

export interface BidStatusHistory extends Document {
  bidId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

const BidStatusHistorySchema = new Schema<BidStatusHistory>({
  bidId: {
    type: String,
    required: true,
    index: true,
  },
  oldStatus: {
    type: String,
    required: true,
  },
  newStatus: {
    type: String,
    required: true,
  },
  changedBy: {
    type: String,
    required: true,
    index: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  reason: {
    type: String,
    maxlength: 500,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
});

// Compound indexes for performance
BidStatusHistorySchema.index({ bidId: 1, changedAt: -1 });
BidStatusHistorySchema.index({ changedBy: 1, changedAt: -1 });

export { BidStatusHistorySchema };
