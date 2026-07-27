-- ============================================================
-- MIGRATION 005: Fix Matchmaking Race Condition in RPC Function
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION match_users_in_queue(
  p_user_id UUID,
  p_mode TEXT,
  p_preferences JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  existing_call RECORD;
  matched_user RECORD;
  new_call_id UUID;
  partner_profile JSONB;
  is_initiator BOOLEAN;
  partner_id UUID;
BEGIN
  -- Ensure user row exists in users table to prevent FK constraint violations
  INSERT INTO users (id, online, last_seen)
  VALUES (p_user_id, true, now())
  ON CONFLICT (id) DO UPDATE SET online = true, last_seen = now();

  -- 1. Check if user is ALREADY in an active call created within the last 30 minutes
  --    This prevents polling/re-entry from terminating active calls in progress.
  SELECT id, user1_id, user2_id INTO existing_call
  FROM calls
  WHERE (user1_id = p_user_id OR user2_id = p_user_id)
    AND status = 'active'
    AND started_at > now() - interval '30 minutes'
  ORDER BY started_at DESC
  LIMIT 1;

  IF existing_call IS NOT NULL THEN
    IF existing_call.user1_id = p_user_id THEN
      partner_id := existing_call.user2_id;
      is_initiator := false;
    ELSE
      partner_id := existing_call.user1_id;
      is_initiator := true;
    END IF;

    SELECT jsonb_build_object(
      'country', u.country,
      'gender', u.gender,
      'interests', u.interests
    ) INTO partner_profile
    FROM users u WHERE u.id = partner_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'call_id', existing_call.id,
      'partner_id', partner_id,
      'partner_profile', partner_profile,
      'initiator', is_initiator
    );
  END IF;

  -- 2. Find waiting user in queue (same mode, excluding self)
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

  -- 3. No match found — add user to queue if not already present
  IF NOT EXISTS (SELECT 1 FROM waiting_queue WHERE user_id = p_user_id AND mode = p_mode) THEN
    DELETE FROM waiting_queue WHERE user_id = p_user_id;
    INSERT INTO waiting_queue (user_id, mode, preferences)
    VALUES (p_user_id, p_mode, p_preferences);
  END IF;

  RETURN jsonb_build_object('status', 'waiting');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
