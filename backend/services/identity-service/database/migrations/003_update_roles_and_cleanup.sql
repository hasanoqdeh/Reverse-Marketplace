-- ============================================================
-- Migration 003: Role Extensions & Cleanup Utilities
-- ============================================================

-- Extend user_role enum to include granular admin sub-roles
-- (uses a separate admin_role column to keep user_role clean)
DO $$ BEGIN
  CREATE TYPE admin_sub_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS admin_sub_role admin_sub_role NULL;

-- Index for fast admin lookups
CREATE INDEX IF NOT EXISTS idx_users_admin_sub_role ON users(admin_sub_role)
  WHERE admin_sub_role IS NOT NULL;

-- Cleanup helper: remove expired OTPs (called by scheduled job)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW() AND used_at IS NULL;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup helper: expire stale sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE user_sessions SET is_active = FALSE
  WHERE is_active = TRUE AND expires_at < NOW();
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup helper: revoke expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE auth_tokens SET revoked_at = NOW()
  WHERE revoked_at IS NULL AND expires_at < NOW();
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
