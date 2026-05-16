-- ============================================================
-- Migration 002: Admin Panel Tables
-- ============================================================

DO $$ BEGIN
  CREATE TYPE admin_action_type AS ENUM (
    'USER_VIEW', 'USER_EDIT', 'USER_SUSPEND', 'USER_BAN', 'USER_DELETE',
    'USER_BULK_ACTION', 'ADMIN_ADD', 'ADMIN_EDIT', 'ADMIN_REMOVE',
    'SYSTEM_CONFIG_CHANGE', 'EXPORT_DATA', 'IMPORT_DATA', 'SECURITY_ALERT',
    'SESSION_TERMINATE', 'PASSWORD_RESET', 'VERIFICATION_OVERRIDE'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- admin_activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type    admin_action_type NOT NULL,
    target_type    VARCHAR(50) NOT NULL,
    target_id      UUID NULL,
    target_phone   VARCHAR(20) NULL,
    action_details JSONB DEFAULT '{}',
    ip_address     INET NULL,
    user_agent     TEXT NULL,
    success        BOOLEAN NOT NULL,
    failure_reason TEXT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id    ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at  ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target      ON admin_activity_logs(target_type, target_id);
