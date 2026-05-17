-- ============================================================
-- Migration 008: Chat Room Participants
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_room_participants (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      UUID        NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    role         VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    last_read_at TIMESTAMPTZ NULL,
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at      TIMESTAMPTZ NULL,
    UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_participants_room ON chat_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_room_participants(user_id);
