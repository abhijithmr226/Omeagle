import { supabase } from '../lib/supabase';
import { getCurrentUserId, initializeAuth } from '../lib/auth';
import type { PartnerProfile } from '../types/chat';

export interface MatchResult {
  status: 'waiting' | 'matched';
  call_id?: string;
  partner_id?: string;
  initiator?: boolean;
  partner_profile?: PartnerProfile;
}

export interface QueuePreferences {
  country?: string;
  gender?: string;
  interests?: string[];
  preferredGender?: string;
  preferredCountries?: string[];
}

export async function joinQueue(
  mode: 'video' | 'text',
  preferences?: QueuePreferences
): Promise<MatchResult> {
  let userId = getCurrentUserId();
  if (!userId) {
    const user = await initializeAuth();
    userId = user.id;
  }

  // Mark any prior active calls as ended so user doesn't get stuck in ghost room
  await supabase
    .from('calls')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('status', 'active')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  const { data, error } = await supabase.rpc('match_users_in_queue', {
    p_user_id: userId,
    p_mode: mode,
    p_preferences: preferences || {},
  });

  if (error) {
    console.error('[queue] RPC error:', error);
    throw new Error(error.message || 'Matchmaking failed');
  }

  return data as MatchResult;
}

export async function pollMatch(mode: 'video' | 'text'): Promise<MatchResult> {
  let userId = getCurrentUserId();
  if (!userId) {
    try {
      const user = await initializeAuth();
      userId = user.id;
    } catch {
      return { status: 'waiting' };
    }
  }

  const { data, error } = await supabase.rpc('match_users_in_queue', {
    p_user_id: userId,
    p_mode: mode,
    p_preferences: {},
  });

  if (error) {
    console.error('[queue] pollMatch error:', error);
    return { status: 'waiting' };
  }

  return (data as MatchResult) || { status: 'waiting' };
}

export async function leaveQueue(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('waiting_queue')
    .delete()
    .eq('user_id', userId);

  if (error) console.error('[queue] leaveQueue error:', error);
}

async function deleteSignals(callId: string): Promise<void> {
  const { error } = await supabase
    .from('signals')
    .delete()
    .eq('call_id', callId);
  if (error) console.error('[queue] deleteSignals error:', error);
}

export async function endCall(callId: string): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { error: callError } = await supabase
    .from('calls')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (callError) console.error('[queue] endCall error:', callError);

  // Clean up signals for this call (also handled by DB trigger in 004_fix_rls.sql)
  await deleteSignals(callId);
  await leaveQueue();
}

// Skip is identical to endCall — reuse it
export const cleanupAfterSkip = endCall;
