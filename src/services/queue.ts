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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const res = await fetch(`${supabaseUrl}/functions/v1/match-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ mode, preferences: preferences || {} }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function pollMatch(): Promise<MatchResult> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const res = await fetch(`${supabaseUrl}/functions/v1/match-users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ mode: 'video', preferences: {} }),
  });

  if (!res.ok) {
    return { status: 'waiting' };
  }

  return res.json();
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
