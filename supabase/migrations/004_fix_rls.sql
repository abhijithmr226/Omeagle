-- ============================================================
-- MIGRATION 004: Fix RLS, Add Missing Columns & Indexes
-- Run this in the Supabase SQL Editor AFTER 003_fix_schema.sql
-- ============================================================

-- ============================================================
-- 1. ADD MISSING COLUMNS
-- ============================================================

-- Add last_seen to users (was referenced in code but never defined in schema)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT now();

-- ============================================================
-- 2. DROP WEAK DUPLICATE RLS POLICIES FROM 003_fix_schema.sql
--    These create OR conditions that allow ANY user to write
--    to ANY call's signals/messages.
-- ============================================================

-- Signals: drop weak policy from 003 (only checks sender_id, not call membership)
DROP POLICY IF EXISTS "Signals: insert own" ON signals;
DROP POLICY IF EXISTS "Signals: read own calls" ON signals;
DROP POLICY IF EXISTS "Signals: delete own calls" ON signals;

-- Messages: drop weak policy from 003 (only checks sender_id, not call membership)
DROP POLICY IF EXISTS "Messages: insert own" ON messages;
DROP POLICY IF EXISTS "Messages: read own calls" ON messages;

-- Users: drop duplicate from 003
DROP POLICY IF EXISTS "Users: view all profiles" ON users;

-- ============================================================
-- 3. ENSURE CORRECT POLICIES EXIST (from 002_rls_policies.sql)
--    Recreate only if they were accidentally dropped.
-- ============================================================

-- Users: anyone can read profiles (needed for online count + partner display)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'Users: anyone can view online status'
  ) THEN
    CREATE POLICY "Users: anyone can view online status"
      ON users FOR SELECT USING (true);
  END IF;
END $$;

-- Signals: strict INSERT — must be sender AND in the call
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'signals' AND policyname = 'Signals: can insert signals in own calls'
  ) THEN
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
  END IF;
END $$;

-- Signals: SELECT — must be in the call
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'signals' AND policyname = 'Signals: can view signals in own calls'
  ) THEN
    CREATE POLICY "Signals: can view signals in own calls"
      ON signals FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM calls
          WHERE calls.id = signals.call_id
            AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Signals: DELETE — must be in the call
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'signals' AND policyname = 'Signals: can delete signals in own calls'
  ) THEN
    CREATE POLICY "Signals: can delete signals in own calls"
      ON signals FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM calls
          WHERE calls.id = signals.call_id
            AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
        )
      );
  END IF;
END $$;

-- Messages: strict INSERT — must be sender AND in the call
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'Messages: can insert messages in own calls'
  ) THEN
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
  END IF;
END $$;

-- Messages: SELECT — must be in the call
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'Messages: can view messages in own calls'
  ) THEN
    CREATE POLICY "Messages: can view messages in own calls"
      ON messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM calls
          WHERE calls.id = messages.call_id
            AND (calls.user1_id = auth.uid() OR calls.user2_id = auth.uid())
        )
      );
  END IF;
END $$;

-- ============================================================
-- 4. ADD MISSING INDEXES
-- ============================================================

-- Index on signals.sender_id (used in RLS policy check)
CREATE INDEX IF NOT EXISTS idx_signals_sender ON signals(sender_id);

-- Index on reports for admin queries
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_user_id);

-- Compound index on waiting_queue for faster matching
CREATE INDEX IF NOT EXISTS idx_waiting_queue_joined ON waiting_queue(mode, joined_at) WHERE call_id IS NULL;

-- ============================================================
-- 5. AUTO-CLEANUP SIGNALS WHEN CALL ENDS (via trigger)
-- ============================================================

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
  AFTER UPDATE OF status ON calls
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_signals_on_call_end();

-- ============================================================
-- 6. FIX get_online_count (no artificial +1)
-- ============================================================

CREATE OR REPLACE FUNCTION get_online_count()
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM users WHERE online = true AND last_seen > now() - interval '45 seconds';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- DONE — Verify with:
-- SELECT policyname, cmd FROM pg_policies WHERE tablename IN ('signals','messages','users') ORDER BY tablename, cmd;
-- ============================================================
