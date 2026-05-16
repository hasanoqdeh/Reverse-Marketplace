-- ============================================================
-- Migration 002: Request Service Tables
-- ============================================================

-- ENUM — name must match Prisma schema exactly (PascalCase)
DO $$ BEGIN
  CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HAS_BIDS', 'COMPLETED', 'CANCELLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- request_categories
CREATE TABLE IF NOT EXISTS request_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    icon_url    VARCHAR(500) NULL,
    parent_id   UUID NULL REFERENCES request_categories(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_categories_parent_id ON request_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_request_categories_is_active ON request_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_request_categories_slug      ON request_categories(slug);
DO $$ BEGIN
  CREATE TRIGGER trigger_request_categories_updated_at BEFORE UPDATE ON request_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- requests
CREATE TABLE IF NOT EXISTS requests (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      UUID NOT NULL REFERENCES request_categories(id),
    title            VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    budget_min       DECIMAL(12, 2) NULL,
    budget_max       DECIMAL(12, 2) NULL,
    location_lat     DECIMAL(10, 8) NULL,
    location_lng     DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    location_city    VARCHAR(100) NULL,
    location_country VARCHAR(100) NULL,
    status           "RequestStatus" NOT NULL DEFAULT 'DRAFT',
    priority_score   INTEGER DEFAULT 0,
    bid_count        INTEGER DEFAULT 0,
    view_count       INTEGER DEFAULT 0,
    expires_at       TIMESTAMPTZ NULL,
    published_at     TIMESTAMPTZ NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_requests_buyer_id    ON requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_requests_category_id ON requests(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_status      ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_expires_at  ON requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_requests_created_at  ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_priority    ON requests(priority_score DESC);
DO $$ BEGIN
  CREATE TRIGGER trigger_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- request_images
CREATE TABLE IF NOT EXISTS request_images (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id        UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    image_url         VARCHAR(500) NOT NULL,
    thumbnail_url     VARCHAR(500) NULL,
    original_filename VARCHAR(255) NULL,
    file_size         BIGINT NOT NULL DEFAULT 0,
    mime_type         VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    width             INTEGER NULL,
    height            INTEGER NULL,
    sort_order        INTEGER DEFAULT 0,
    is_primary        BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_images_request_id ON request_images(request_id);
CREATE INDEX IF NOT EXISTS idx_request_images_is_primary ON request_images(request_id, is_primary);

-- request_drafts
CREATE TABLE IF NOT EXISTS request_drafts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id      UUID NULL REFERENCES request_categories(id) ON DELETE SET NULL,
    title            VARCHAR(255) NULL,
    description      TEXT NULL,
    budget_min       DECIMAL(12, 2) NULL,
    budget_max       DECIMAL(12, 2) NULL,
    location_lat     DECIMAL(10, 8) NULL,
    location_lng     DECIMAL(11, 8) NULL,
    location_address TEXT NULL,
    auto_save_data   JSONB DEFAULT '{}',
    expires_at       TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_drafts_buyer_id   ON request_drafts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_request_drafts_expires_at ON request_drafts(expires_at);
DO $$ BEGIN
  CREATE TRIGGER trigger_request_drafts_updated_at BEFORE UPDATE ON request_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- request_extensions
CREATE TABLE IF NOT EXISTS request_extensions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id          UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    original_expires_at TIMESTAMPTZ NOT NULL,
    new_expires_at      TIMESTAMPTZ NOT NULL,
    extension_reason    TEXT NULL,
    extended_by         UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_extensions_request_id ON request_extensions(request_id);

-- request_search_index
CREATE TABLE IF NOT EXISTS request_search_index (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id    UUID UNIQUE NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    search_vector TEXT NULL,
    category_path TEXT NULL,
    location_text TEXT NULL,
    budget_range  TEXT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_request_search_index_request_id ON request_search_index(request_id);

-- saved_searches
CREATE TABLE IF NOT EXISTS saved_searches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    search_criteria JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id   ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_active ON saved_searches(user_id, is_active);
DO $$ BEGIN
  CREATE TRIGGER trigger_saved_searches_updated_at BEFORE UPDATE ON saved_searches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTE: request_analytics and request_views live in MongoDB (see src/models/) — handled by analytics subscriber
