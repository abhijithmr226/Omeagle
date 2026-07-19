-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Works with your existing tables as-is, adds what's needed
-- ============================================================

-- ============================================================
-- 1. ADD MISSING COLUMNS (your tables don't have these yet)
-- ============================================================

ALTER TABLE waiting_queue ADD COLUMN IF NOT EXISTS mode TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS mode TEXT;

-- ============================================================
-- 2. FIX RLS: signals + messages (receiver can't read partner data)
-- ============================================================

-- SIGNALS: receiver needs to read sender's signals
DROP POLICY IF EXISTS "Users can access signals" ON signals;

CREATE POLICY "Signals: read own calls"
  ON signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = signals.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

CREATE POLICY "Signals: insert own"
  ON signals FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Signals: delete own calls"
  ON signals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = signals.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

-- MESSAGES: receiver needs to read partner's messages
DROP POLICY IF EXISTS "Users manage own messages" ON messages;

CREATE POLICY "Messages: read own calls"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = messages.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

CREATE POLICY "Messages: insert own"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- 3. FIX USERS RLS: allow counting all online users
-- ============================================================

-- Current policy blocks online count queries
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

CREATE POLICY "Users: view all profiles"
  ON users FOR SELECT
  USING (true);

-- ============================================================
-- 4. HELPER FUNCTIONS
-- ============================================================

-- Count online users (bypasses RLS)
CREATE OR REPLACE FUNCTION get_online_count()
RETURNS BIGINT AS $$
  SELECT count(*)::bigint FROM users WHERE online = true;
$$ LANGUAGE sql SECURITY DEFINER;

-- Set user offline (for tab close via sendBeacon)
CREATE OR REPLACE FUNCTION set_user_offline(uid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET online = false, last_seen = now(), updated_at = now() WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. MATCHING FUNCTION (works with your exact schema)
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
  is_initiator BOOLEAN;
BEGIN
  -- Check if user already has an active call
  SELECT c.id, (c.user2_id = p_user_id) INTO new_call_id, is_initiator
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

  -- Find waiting user (same mode, exclude self)
  SELECT wq.user_id INTO matched_user
  FROM waiting_queue wq
  WHERE wq.mode = p_mode
    AND wq.user_id != p_user_id
  ORDER BY wq.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF matched_user IS NOT NULL THEN
    -- Create call: waiting user = user1, caller = user2 (initiator)
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
    FROM users u WHERE u.id = matched_user.user_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'call_id', new_call_id,
      'partner_id', matched_user.user_id,
      'partner_profile', partner_profile,
      'initiator', true
    );
  END IF;

  -- No match found — add to queue
  DELETE FROM waiting_queue WHERE user_id = p_user_id;
  INSERT INTO waiting_queue (user_id, mode, preferences)
  VALUES (p_user_id, p_mode, p_preferences);

  RETURN jsonb_build_object('status', 'waiting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. CLEANUP
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_stale_queue()
RETURNS VOID AS $$
BEGIN
  DELETE FROM waiting_queue WHERE joined_at < now() - interval '60 seconds';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_stale_calls()
RETURNS VOID AS $$
BEGIN
  UPDATE calls SET status = 'ended', ended_at = now()
  WHERE status = 'active' AND started_at < now() - interval '30 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_waiting_queue_mode ON waiting_queue(mode);
CREATE INDEX IF NOT EXISTS idx_users_online ON users(online);
CREATE INDEX IF NOT EXISTS idx_calls_active ON calls(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_messages_call ON messages(call_id, created_at);

-- ============================================================
-- 8. ENABLE REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
