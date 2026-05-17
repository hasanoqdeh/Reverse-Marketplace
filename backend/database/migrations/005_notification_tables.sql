-- 005_notification_tables.sql

-- Drop old over-engineered types if they exist from a partial run
DROP TYPE IF EXISTS notification_type       CASCADE;
DROP TYPE IF EXISTS notification_channel    CASCADE;
DROP TYPE IF EXISTS notification_priority   CASCADE;
DROP TYPE IF EXISTS notification_status     CASCADE;
DROP TYPE IF EXISTS notif_delivery_status   CASCADE;
DROP TYPE IF EXISTS notif_analytics_event   CASCADE;

CREATE TYPE notification_type AS ENUM (
  'NEW_MESSAGE',
  'BID_PLACED',
  'STATUS_IN_DELIVERY',
  'BID_ACCEPTED',
  'BUYER_REVIEW'
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      VARCHAR(255)      NOT NULL,
  body       TEXT              NOT NULL,
  data       JSONB             DEFAULT '{}',
  is_read    BOOLEAN           DEFAULT FALSE,
  created_at TIMESTAMPTZ       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
