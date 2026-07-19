import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth';
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
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

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

export async function pollMatch(): Promise<MatchResult> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('match_users_in_queue', {
    p_user_id: userId,
    p_mode: 'video',
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

export async function endCall(callId: string): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { error: callError } = await supabase
    .from('calls')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (callError) console.error('[queue] endCall error:', callError);
  await leaveQueue();
}

export async function cleanupAfterSkip(callId: string): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  const { error: callError } = await supabase
    .from('calls')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('id', callId)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (callError) console.error('[queue] skip cleanup error:', callError);
  await leaveQueue();
}
