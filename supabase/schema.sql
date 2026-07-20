-- ============================================================
-- OMEAGLE COMPLETE SUPABASE SCHEMA & CONFIGURATION
-- Paste and run this ENTIRE file in Supabase SQL Editor
-- ============================================================

-- 1. ENABLES EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  online BOOLEAN DEFAULT false,
  country TEXT,
  interests TEXT[] DEFAULT '{}',
  gender TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_online ON users(online);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- 3. WAITING QUEUE TABLE
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

-- 4. CALLS TABLE
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

-- 5. SIGNALS TABLE (WebRTC Signaling Backup)
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('offer', 'answer', 'ice-candidate')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signals_call ON signals(call_id);
CREATE INDEX IF NOT EXISTS idx_signals_sender ON signals(sender_id);

-- 6. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_call ON messages(call_id, created_at);

-- 7. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
DROP POLICY IF EXISTS "Users: select all" ON users;
CREATE POLICY "Users: select all" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users: update own profile" ON users;
CREATE POLICY "Users: update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users: insert own profile" ON users;
CREATE POLICY "Users: insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- WAITING QUEUE POLICIES
DROP POLICY IF EXISTS "Queue: manage own" ON waiting_queue;
CREATE POLICY "Queue: manage own" ON waiting_queue FOR ALL USING (auth.uid() = user_id);

-- CALLS POLICIES
DROP POLICY IF EXISTS "Calls: view own calls" ON calls;
CREATE POLICY "Calls: view own calls" ON calls FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Calls: update own calls" ON calls;
CREATE POLICY "Calls: update own calls" ON calls FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- SIGNALS POLICIES
DROP POLICY IF EXISTS "Signals: view own calls" ON signals;
CREATE POLICY "Signals: view own calls" ON signals FOR SELECT
  USING (EXISTS (SELECT 1 FROM calls WHERE calls.id = signals.call_id AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())));

DROP POLICY IF EXISTS "Signals: insert own signals" ON signals;
CREATE POLICY "Signals: insert own signals" ON signals FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM calls WHERE calls.id = signals.call_id AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())));

-- MESSAGES POLICIES
DROP POLICY IF EXISTS "Messages: view own calls" ON messages;
CREATE POLICY "Messages: view own calls" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM calls WHERE calls.id = messages.call_id AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())));

DROP POLICY IF EXISTS "Messages: insert own messages" ON messages;
CREATE POLICY "Messages: insert own messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM calls WHERE calls.id = messages.call_id AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())));

-- REPORTS POLICIES
DROP POLICY IF EXISTS "Reports: insert own" ON reports;
CREATE POLICY "Reports: insert own" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ============================================================
-- STORED FUNCTIONS & PROCEDURES
-- ============================================================

-- Online User Counter RPC
DROP FUNCTION IF EXISTS get_online_count();
CREATE OR REPLACE FUNCTION get_online_count()
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM users WHERE online = true AND last_seen > now() - interval '45 seconds';
$$ LANGUAGE sql SECURITY DEFINER;

-- Match Users In Queue RPC Function
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
  is_initiator BOOLEAN;
BEGIN
  -- Ensure user row exists in users table to prevent FK constraint violations
  INSERT INTO users (id, online, last_seen)
  VALUES (p_user_id, true, now())
  ON CONFLICT (id) DO UPDATE SET online = true, last_seen = now();

  -- End any previous active call for this user
  UPDATE calls SET status = 'ended', ended_at = now()
  WHERE (user1_id = p_user_id OR user2_id = p_user_id) AND status = 'active';

  -- Find waiting user in queue (same mode, excluding self)
  SELECT wq.user_id INTO matched_user
  FROM waiting_queue wq
  WHERE wq.mode = p_mode
    AND wq.user_id != p_user_id
  ORDER BY wq.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF matched_user IS NOT NULL THEN
    -- Create active call (user1 = waiting user, user2 = caller/initiator)
    INSERT INTO calls (user1_id, user2_id, status, mode)
    VALUES (matched_user.user_id, p_user_id, 'active', p_mode)
    RETURNING id INTO new_call_id;

    -- Remove both users from waiting queue
    DELETE FROM waiting_queue WHERE user_id IN (matched_user.user_id, p_user_id);

    -- Fetch partner profile
    SELECT jsonb_build_object(
      'country', u.country,
      'gender', u.gender,
      'interests', u.interests
    ) INTO partner_profile
    FROM users u WHERE u.id = matched_user.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'call_id', new_call_id,
      'partner_id', matched_user.user_id,
      'partner_profile', partner_profile,
      'initiator', true
    );
  END IF;

  -- No match found — add user to queue
  DELETE FROM waiting_queue WHERE user_id = p_user_id;
  INSERT INTO waiting_queue (user_id, mode, preferences)
  VALUES (p_user_id, p_mode, p_preferences);

  RETURN jsonb_build_object('status', 'waiting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-cleanup signals on call end trigger
CREATE OR REPLACE FUNCTION cleanup_signals_on_call_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'active' THEN
    DELETE FROM signals WHERE call_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_cleanup_signals ON calls;
CREATE TRIGGER trg_cleanup_signals
  AFTER UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_signals_on_call_end();

-- ============================================================
-- SUPABASE REALTIME PUBLICATION
-- Enable realtime broadcasting and postgres_changes
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE calls;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'waiting_queue'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE waiting_queue;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'signals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE signals;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
