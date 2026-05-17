-- Migration 006: fulfillment status on bids + reviews table

-- Fulfillment status enum
DO $$ BEGIN
  CREATE TYPE "FulfillmentStatus" AS ENUM ('AWAITING', 'PREPARING', 'IN_DELIVERY', 'DELIVERED', 'CONFIRMED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Review type enum
DO $$ BEGIN
  CREATE TYPE "ReviewType" AS ENUM ('BUYER_TO_MERCHANT', 'MERCHANT_TO_BUYER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add fulfillment fields to bids
ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS chat_room_id UUID,
  ADD COLUMN IF NOT EXISTS fulfillment_status "FulfillmentStatus",
  ADD COLUMN IF NOT EXISTS fulfillment_updated_at TIMESTAMPTZ;

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  type "ReviewType" NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (bid_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_bid ON reviews(bid_id);
