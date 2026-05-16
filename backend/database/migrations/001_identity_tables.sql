-- ============================================================
-- Migration 001: Identity Service Tables
-- ============================================================

-- ENUMS — names must match Prisma schema exactly (PascalCase)
DO $$ BEGIN CREATE TYPE "UserRole"    AS ENUM ('BUYER', 'MERCHANT', 'ADMIN');                                                           EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "UserStatus"  AS ENUM ('PENDING', 'ACTIVE', 'BANNED', 'SUSPENDED');                                             EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "TokenType"   AS ENUM ('ACCESS', 'REFRESH');                                                                    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AdminSubRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SUPPORT');                                                     EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- users
CREATE TABLE IF NOT EXISTS users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone                 VARCHAR(20) UNIQUE NOT NULL,
    role                  "UserRole"     NOT NULL DEFAULT 'BUYER',
    status                "UserStatus"   NOT NULL DEFAULT 'PENDING',
    phone_verified        BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW(),
    last_login_at         TIMESTAMPTZ NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until          TIMESTAMPTZ NULL,
    admin_sub_role        "AdminSubRole" NULL
);
CREATE INDEX IF NOT EXISTS idx_users_phone          ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role           ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status         ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone_status   ON users(phone, status);
CREATE INDEX IF NOT EXISTS idx_users_admin_sub_role ON users(admin_sub_role) WHERE admin_sub_role IS NOT NULL;
DO $$ BEGIN
  CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name        VARCHAR(100) NOT NULL DEFAULT '',
    last_name         VARCHAR(100) NOT NULL DEFAULT '',
    profile_image_url VARCHAR(500) NULL,
    location_lat      DECIMAL(10, 8) NULL,
    location_lng      DECIMAL(11, 8) NULL,
    address           TEXT NULL,
    city              VARCHAR(100) NULL,
    country           VARCHAR(100) NULL,
    preferences       JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id  ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_lat, location_lng);
DO $$ BEGIN
  CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: otp_codes live in MongoDB (see src/models/OtpCode.js) — TTL auto-purge

-- auth_tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_type         "TokenType" NOT NULL,
    token_hash         VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    ip_address         VARCHAR(45) NULL,
    user_agent         TEXT NULL,
    expires_at         TIMESTAMPTZ NOT NULL,
    last_used_at       TIMESTAMPTZ NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    revoked_at         TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id    ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash       ON auth_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);

-- NOTE: user_sessions and admin_activity_logs live in MongoDB (see src/models/)
