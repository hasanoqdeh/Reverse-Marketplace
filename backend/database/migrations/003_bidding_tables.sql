-- ============================================================
-- Migration 003: Bidding System Tables
-- ============================================================

-- ENUMs
DO $$ BEGIN
  CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- bids
CREATE TABLE IF NOT EXISTS bids (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    merchant_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount          DECIMAL(12, 2) NOT NULL,
    delivery_days   INTEGER NOT NULL,
    delivery_notes  TEXT NULL,
    special_terms   TEXT NULL,
    status          "BidStatus" NOT NULL DEFAULT 'PENDING',
    priority_score  INTEGER DEFAULT 0,
    is_template     BOOLEAN DEFAULT FALSE,
    template_name   VARCHAR(100) NULL,
    bid_fee         DECIMAL(10, 2) DEFAULT 0.00,
    fee_paid        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NULL,
    accepted_at     TIMESTAMPTZ NULL,
    rejected_at     TIMESTAMPTZ NULL,
    withdrawn_at    TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_bids_request_id      ON bids(request_id);
CREATE INDEX IF NOT EXISTS idx_bids_merchant_id     ON bids(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bids_status          ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_amount          ON bids(amount);
CREATE INDEX IF NOT EXISTS idx_bids_created_at      ON bids(created_at);
CREATE INDEX IF NOT EXISTS idx_bids_priority_score  ON bids(priority_score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bids_unique_request_merchant ON bids(request_id, merchant_id);

DO $$ BEGIN
  CREATE TRIGGER trigger_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

