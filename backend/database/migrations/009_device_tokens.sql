-- Add missing notification type enum values
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'FULFILLMENT_UPDATED';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'DELIVERY_CONFIRMED';

-- Device tokens for FCM push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  platform    VARCHAR(10)  NOT NULL CHECK (platform IN ('android', 'ios')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
