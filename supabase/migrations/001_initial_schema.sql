-- ============================================================
-- OMEAGLE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  online BOOLEAN DEFAULT false,
  country TEXT,
  interests TEXT[] DEFAULT '{}',
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_online ON users(online);

-- ============================================================
-- WAITING QUEUE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS waiting_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('video', 'text')),
  preferences JSONB DEFAULT '{}',
  call_id UUID,
  joined_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waiting_queue_mode ON waiting_queue(mode);
CREATE INDEX IF NOT EXISTS idx_waiting_queue_user ON waiting_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_waiting_queue_pending ON waiting_queue(mode, call_id) WHERE call_id IS NULL;

-- ============================================================
-- CALLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user2_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  mode TEXT DEFAULT 'video' CHECK (mode IN ('video', 'text')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calls_user1 ON calls(user1_id);
CREATE INDEX IF NOT EXISTS idx_calls_user2 ON calls(user2_id);
CREATE INDEX IF NOT EXISTS idx_calls_active ON calls(status) WHERE status = 'active';

-- ============================================================
-- SIGNALS TABLE (for WebRTC signaling backup)
-- ============================================================
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer', 'answer', 'ice-candidate')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signals_call ON signals(call_id);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_call ON messages(call_id, created_at);

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTION: set user offline (for sendBeacon)
-- ============================================================
CREATE OR REPLACE FUNCTION set_user_offline(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET online = false, updated_at = now() WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: match users in queue
-- ============================================================
CREATE OR REPLACE FUNCTION match_users_in_queue(
  p_user_id UUID,
  p_mode TEXT,
  p_preferences JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  matched_user RECORD;
  new_call_id UUID;
  partner_profile JSONB;
  result JSONB;
  is_initiator BOOLEAN;
BEGIN
  -- Check if user already has an active call
  SELECT c.id, (c.user2_id = p_user_id) AS i_am_initiator
  INTO new_call_id, is_initiator
  FROM calls c
  WHERE (c.user1_id = p_user_id OR c.user2_id = p_user_id)
    AND c.status = 'active'
  LIMIT 1;

  IF new_call_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'matched',
      'call_id', new_call_id,
      'initiator', is_initiator
    );
  END IF;

  -- Find a waiting user to match with (exclude self)
  SELECT wq.user_id, wq.id AS queue_id
  INTO matched_user
  FROM waiting_queue wq
  WHERE wq.mode = p_mode
    AND wq.user_id != p_user_id
    AND wq.call_id IS NULL
  ORDER BY wq.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF matched_user IS NOT NULL THEN
    -- Create a new call: waiting user = user1, caller = user2 (initiator)
    INSERT INTO calls (user1_id, user2_id, status, mode)
    VALUES (matched_user.user_id, p_user_id, 'active', p_mode)
    RETURNING id INTO new_call_id;

    -- Remove both from queue
    DELETE FROM waiting_queue WHERE user_id IN (matched_user.user_id, p_user_id);

    -- Get partner profile
    SELECT jsonb_build_object(
      'country', u.country,
      'gender', u.gender,
      'interests', u.interests
    ) INTO partner_profile
    FROM users u
    WHERE u.id = matched_user.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'call_id', new_call_id,
      'partner_id', matched_user.user_id,
      'partner_profile', partner_profile,
      'initiator', true
    );
  END IF;

  -- No match found, add user to queue (remove any existing entry first)
  DELETE FROM waiting_queue WHERE user_id = p_user_id;

  INSERT INTO waiting_queue (user_id, mode, preferences)
  VALUES (p_user_id, p_mode, p_preferences);

  RETURN jsonb_build_object('status', 'waiting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CLEANUP: Remove stale queue entries (older than 60 seconds)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_stale_queue()
RETURNS VOID AS $$
BEGIN
  DELETE FROM waiting_queue
  WHERE joined_at < now() - interval '60 seconds'
    AND call_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CLEANUP: End stale calls (older than 30 minutes)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_stale_calls()
RETURNS VOID AS $$
BEGIN
  UPDATE calls
  SET status = 'ended', ended_at = now()
  WHERE status = 'active'
    AND started_at < now() - interval '30 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
