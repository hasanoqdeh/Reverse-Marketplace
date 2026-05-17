-- ============================================================
-- Migration 004: Chat Room Tables (PostgreSQL)
-- Messages are stored in MongoDB (ChatMessage collection)
-- ============================================================

-- ENUMs
DO $$ BEGIN
  CREATE TYPE "RoomType" AS ENUM ('DIRECT', 'GROUP', 'REQUEST', 'BID', 'SUPPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ParticipantRole" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(255) NOT NULL,
    description        TEXT NULL,
    type               "RoomType" NOT NULL DEFAULT 'DIRECT',
    related_request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    related_bid_id     UUID REFERENCES bids(id) ON DELETE CASCADE,
    created_by         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active          BOOLEAN DEFAULT TRUE,
    max_participants   INTEGER DEFAULT 100,
    last_message_at    TIMESTAMPTZ NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_type             ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_request_id       ON chat_rooms(related_request_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_bid_id           ON chat_rooms(related_bid_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by       ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active           ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message_at  ON chat_rooms(last_message_at DESC NULLS LAST);

-- chat_participants
CREATE TABLE IF NOT EXISTS chat_participants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id       UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role          "ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    joined_at     TIMESTAMPTZ DEFAULT NOW(),
    last_read_at  TIMESTAMPTZ NULL,
    is_muted      BOOLEAN DEFAULT FALSE,
    is_banned     BOOLEAN DEFAULT FALSE,
    banned_until  TIMESTAMPTZ NULL,
    banned_by     UUID REFERENCES users(id) NULL,
    banned_reason TEXT NULL,
    left_at       TIMESTAMPTZ NULL,
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_role    ON chat_participants(role);
CREATE INDEX IF NOT EXISTS idx_chat_participants_banned  ON chat_participants(is_banned);

-- updated_at trigger for chat_rooms
CREATE OR REPLACE FUNCTION update_chat_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER trigger_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_chat_rooms_updated_at();
