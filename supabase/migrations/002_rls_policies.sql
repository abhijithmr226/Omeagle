-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiting_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLICIES
-- ============================================================

-- Anyone can read online status (for online count)
CREATE POLICY "Users: anyone can view online status"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users: can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for upsert on signup)
CREATE POLICY "Users: can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- WAITING QUEUE POLICIES
-- ============================================================

-- Users can only see their own queue entry
CREATE POLICY "Queue: can read own entries"
  ON waiting_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own queue entry
CREATE POLICY "Queue: can insert own entry"
  ON waiting_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own queue entry
CREATE POLICY "Queue: can delete own entry"
  ON waiting_queue FOR DELETE
  USING (auth.uid() = user_id);

-- Users can update their own queue entry
CREATE POLICY "Queue: can update own entry"
  ON waiting_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- CALLS POLICIES
-- ============================================================

-- Users can only see calls they are part of
CREATE POLICY "Calls: can view own calls"
  ON calls FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- System/Edge Functions create calls (via service role)
-- Users don't insert calls directly

-- Users can update calls they are part of (e.g., end call)
CREATE POLICY "Calls: can update own calls"
  ON calls FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================================
-- SIGNALS POLICIES
-- ============================================================

-- Users can only see signals for calls they are part of
CREATE POLICY "Signals: can view signals in own calls"
  ON signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = signals.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

-- Users can insert signals for calls they are part of
CREATE POLICY "Signals: can insert signals in own calls"
  ON signals FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = signals.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
        AND calls.status = 'active'
    )
  );

-- Users can delete signals for calls they are part of
CREATE POLICY "Signals: can delete signals in own calls"
  ON signals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = signals.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================

-- Users can only see messages for calls they are part of
CREATE POLICY "Messages: can view messages in own calls"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = messages.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
    )
  );

-- Users can insert messages for calls they are part of
CREATE POLICY "Messages: can insert messages in own calls"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = messages.call_id
        AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
        AND calls.status = 'active'
    )
  );

-- ============================================================
-- REPORTS POLICIES
-- ============================================================

-- Users can insert reports
CREATE POLICY "Reports: can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Reports: can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- ============================================================
-- REALTIME: Enable realtime for key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE waiting_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE signals;
