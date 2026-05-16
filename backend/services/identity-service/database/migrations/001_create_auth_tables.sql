-- ============================================================
-- Migration 001: Core Authentication Tables
-- ============================================================

-- ENUMS (create only if they don't exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('BUYER', 'MERCHANT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'BANNED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE otp_purpose AS ENUM ('LOGIN', 'PHONE_VERIFICATION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE token_type AS ENUM ('ACCESS', 'REFRESH');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone                 VARCHAR(20) UNIQUE NOT NULL,
    role                  user_role NOT NULL DEFAULT 'BUYER',
    status                user_status NOT NULL DEFAULT 'PENDING',
    phone_verified        BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at         TIMESTAMP WITH TIME ZONE NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until          TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_users_phone         ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role          ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status        ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone_status  ON users(phone, status);

-- ============================================================
-- user_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name        VARCHAR(100) NOT NULL DEFAULT '',
    last_name         VARCHAR(100) NOT NULL DEFAULT '',
    profile_image_url VARCHAR(500) NULL,
    location_lat      DECIMAL(10, 8) NULL,
    location_lng      DECIMAL(11, 8) NULL,
    address           TEXT NULL,
    city              VARCHAR(100) NULL,
    country           VARCHAR(100) NULL,
    preferences       JSONB DEFAULT '{}',
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id  ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_lat, location_lng);

-- ============================================================
-- otp_codes
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    phone      VARCHAR(20) NOT NULL,
    code       VARCHAR(6) NOT NULL,
    purpose    otp_purpose NOT NULL,
    attempts   INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at    TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone      ON otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id    ON otp_codes(user_id);

-- ============================================================
-- auth_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS auth_tokens (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
    token_type         token_type NOT NULL,
    token_hash         VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    ip_address         INET NULL,
    user_agent         TEXT NULL,
    expires_at         TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at       TIMESTAMP WITH TIME ZONE NULL,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at         TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id    ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash       ON auth_tokens(token_hash);

-- ============================================================
-- user_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token      VARCHAR(255) UNIQUE NOT NULL,
    device_fingerprint VARCHAR(255) NULL,
    ip_address         INET NULL,
    user_agent         TEXT NULL,
    is_active          BOOLEAN DEFAULT TRUE,
    last_activity_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at         TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id    ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token      ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active     ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Auto-update updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
  CREATE TRIGGER trigger_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trigger_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
