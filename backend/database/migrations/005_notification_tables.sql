-- 005_notification_tables.sql
-- Notification system: templates, notifications, channel configs, preferences, deliveries, reads, analytics

-- ─── ENUM types ───────────────────────────────────────────────────────────────

CREATE TYPE notification_type AS ENUM (
  'SYSTEM', 'REQUEST', 'BID', 'PAYMENT', 'CHAT', 'SUBSCRIPTION', 'SECURITY', 'MARKETING'
);

CREATE TYPE notification_channel AS ENUM (
  'IN_APP', 'PUSH', 'EMAIL', 'SMS', 'WEBHOOK'
);

CREATE TYPE notification_priority AS ENUM (
  'LOW', 'NORMAL', 'HIGH', 'URGENT'
);

CREATE TYPE notification_status AS ENUM (
  'PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'EXPIRED', 'READ'
);

CREATE TYPE notif_delivery_status AS ENUM (
  'PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'
);

CREATE TYPE notif_analytics_event AS ENUM (
  'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED', 'CLICKED', 'DISMISSED'
);

-- ─── notification_templates ───────────────────────────────────────────────────

CREATE TABLE notification_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100)         NOT NULL,
  type             notification_type    NOT NULL,
  channel          notification_channel NOT NULL,
  subject_template VARCHAR(500)         NULL,
  content_template TEXT                 NOT NULL,
  variables        JSONB                DEFAULT '{}',
  default_locale   VARCHAR(10)          DEFAULT 'en',
  is_active        BOOLEAN              DEFAULT TRUE,
  version          INTEGER              DEFAULT 1,
  created_by       UUID                 REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ          DEFAULT NOW(),
  updated_at       TIMESTAMPTZ          DEFAULT NOW()
);

CREATE INDEX idx_notif_templates_type    ON notification_templates(type);
CREATE INDEX idx_notif_templates_channel ON notification_templates(channel);
CREATE INDEX idx_notif_templates_active  ON notification_templates(is_active);

-- ─── notifications ─────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                notification_type    NOT NULL,
  title               VARCHAR(255)         NOT NULL,
  content             TEXT                 NOT NULL,
  channel             notification_channel NOT NULL DEFAULT 'IN_APP',
  priority            notification_priority NOT NULL DEFAULT 'NORMAL',
  status              notification_status  NOT NULL DEFAULT 'PENDING',
  template_id         UUID                 REFERENCES notification_templates(id) ON DELETE SET NULL,
  template_variables  JSONB                DEFAULT '{}',
  metadata            JSONB                DEFAULT '{}',
  scheduled_at        TIMESTAMPTZ          NULL,
  sent_at             TIMESTAMPTZ          NULL,
  delivered_at        TIMESTAMPTZ          NULL,
  read_at             TIMESTAMPTZ          NULL,
  expires_at          TIMESTAMPTZ          NULL,
  created_at          TIMESTAMPTZ          DEFAULT NOW(),
  updated_at          TIMESTAMPTZ          DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_type       ON notifications(type);
CREATE INDEX idx_notifications_channel    ON notifications(channel);
CREATE INDEX idx_notifications_status     ON notifications(status);
CREATE INDEX idx_notifications_priority   ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ─── notification_channels (per-user channel endpoints) ───────────────────────

CREATE TABLE notification_channels (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID                 NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_type   notification_channel NOT NULL,
  is_enabled     BOOLEAN              DEFAULT TRUE,
  device_token   VARCHAR(500)         NULL,
  email_address  VARCHAR(255)         NULL,
  phone_number   VARCHAR(20)          NULL,
  preferences    JSONB                DEFAULT '{}',
  last_used_at   TIMESTAMPTZ          NULL,
  verified_at    TIMESTAMPTZ          NULL,
  created_at     TIMESTAMPTZ          DEFAULT NOW(),
  updated_at     TIMESTAMPTZ          DEFAULT NOW(),
  UNIQUE(user_id, channel_type)
);

CREATE INDEX idx_notif_channels_user_id ON notification_channels(user_id);
CREATE INDEX idx_notif_channels_type    ON notification_channels(channel_type);
CREATE INDEX idx_notif_channels_enabled ON notification_channels(is_enabled);

-- ─── notification_preferences ────────────────────────────────────────────────

CREATE TABLE notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type     notification_type     NOT NULL,
  channel_type          notification_channel  NOT NULL,
  is_enabled            BOOLEAN               DEFAULT TRUE,
  quiet_hours_start     TIME                  NULL,
  quiet_hours_end       TIME                  NULL,
  min_priority          notification_priority NULL,
  max_frequency_minutes INTEGER               NULL,
  preferences           JSONB                 DEFAULT '{}',
  created_at            TIMESTAMPTZ           DEFAULT NOW(),
  updated_at            TIMESTAMPTZ           DEFAULT NOW(),
  UNIQUE(user_id, notification_type, channel_type)
);

CREATE INDEX idx_notif_prefs_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notif_prefs_type    ON notification_preferences(notification_type);
CREATE INDEX idx_notif_prefs_channel ON notification_preferences(channel_type);
CREATE INDEX idx_notif_prefs_enabled ON notification_preferences(is_enabled);

-- ─── notification_deliveries ──────────────────────────────────────────────────

CREATE TABLE notification_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID                  NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel_type    notification_channel  NOT NULL,
  provider        VARCHAR(100)          NOT NULL,
  recipient       VARCHAR(500)          NOT NULL,
  status          notif_delivery_status NOT NULL DEFAULT 'PENDING',
  attempt_count   INTEGER               DEFAULT 0,
  sent_at         TIMESTAMPTZ           NULL,
  delivered_at    TIMESTAMPTZ           NULL,
  error_message   TEXT                  NULL,
  error_code      VARCHAR(100)          NULL,
  metadata        JSONB                 DEFAULT '{}',
  created_at      TIMESTAMPTZ           DEFAULT NOW()
);

CREATE INDEX idx_notif_deliveries_notif_id ON notification_deliveries(notification_id);
CREATE INDEX idx_notif_deliveries_channel  ON notification_deliveries(channel_type);
CREATE INDEX idx_notif_deliveries_status   ON notification_deliveries(status);

-- ─── notification_reads ───────────────────────────────────────────────────────

CREATE TABLE notification_reads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id     UUID        NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at             TIMESTAMPTZ DEFAULT NOW(),
  device_fingerprint  VARCHAR(255) NULL,
  ip_address          INET        NULL,
  user_agent          TEXT        NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

CREATE INDEX idx_notif_reads_notif_id ON notification_reads(notification_id);
CREATE INDEX idx_notif_reads_user_id  ON notification_reads(user_id);
CREATE INDEX idx_notif_reads_read_at  ON notification_reads(read_at DESC);

-- ─── notification_analytics ───────────────────────────────────────────────────

CREATE TABLE notification_analytics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id  UUID                    REFERENCES notifications(id) ON DELETE SET NULL,
  user_id          UUID                    REFERENCES users(id) ON DELETE SET NULL,
  event_type       notif_analytics_event   NOT NULL,
  channel_type     notification_channel    NOT NULL,
  provider         VARCHAR(100)            NULL,
  delivery_time_ms INTEGER                 NULL,
  success          BOOLEAN                 NOT NULL,
  error_code       VARCHAR(100)            NULL,
  metadata         JSONB                   DEFAULT '{}',
  created_at       TIMESTAMPTZ             DEFAULT NOW()
);

CREATE INDEX idx_notif_analytics_notif_id  ON notification_analytics(notification_id);
CREATE INDEX idx_notif_analytics_user_id   ON notification_analytics(user_id);
CREATE INDEX idx_notif_analytics_event     ON notification_analytics(event_type);
CREATE INDEX idx_notif_analytics_channel   ON notification_analytics(channel_type);
CREATE INDEX idx_notif_analytics_created   ON notification_analytics(created_at DESC);

-- ─── updated_at triggers ─────────────────────────────────────────────────────

CREATE TRIGGER trg_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_notif_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_notif_channels_updated_at
  BEFORE UPDATE ON notification_channels
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trg_notif_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
