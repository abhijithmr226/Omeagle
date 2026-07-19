import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

let cachedUser: User | null = null;

// Keep cachedUser in sync with Supabase auth state changes (e.g. token refresh)
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    cachedUser = session.user;
  } else if (event === 'SIGNED_OUT') {
    cachedUser = null;
  }
});

export async function initializeAuth(): Promise<User> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    cachedUser = session.user;
    // Fire-and-forget: don't block page load for profile/status updates
    upsertProfile(session.user.id).catch(() => {});
    setOnlineStatus(session.user.id, true).catch(() => {});
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('Failed to create anonymous user');

  cachedUser = data.user;
  // Fire-and-forget: don't block page load for profile/status updates
  upsertProfile(data.user.id).catch(() => {});
  setOnlineStatus(data.user.id, true).catch(() => {});
  return data.user;
}

export function getCurrentUser(): User | null {
  return cachedUser;
}

export function getCurrentUserId(): string | null {
  return cachedUser?.id ?? null;
}

async function upsertProfile(userId: string) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('users')
    .upsert(
      { id: userId, updated_at: now, last_seen: now },
      { onConflict: 'id', ignoreDuplicates: false }
    );
  if (error) console.error('[auth] upsertProfile error:', error);
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: now, last_seen: now })
    .eq('id', userId);
  if (error) console.error('[auth] updateProfile error:', error);
}

export async function setOnlineStatus(userId: string, online: boolean) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('users')
    .update({
      online,
      last_seen: now,
      updated_at: now,
    })
    .eq('id', userId);
  if (error) console.error('[auth] setOnlineStatus error:', error);
}

export async function getOnlineCount(): Promise<number> {
  const { data, error } = await supabase.rpc('get_online_count');
  if (error) return 1;
  return Number(data ?? 1);   // FIX: removed artificial +1 inflation
}

export async function signOut() {
  if (cachedUser) {
    await setOnlineStatus(cachedUser.id, false);
  }
  cachedUser = null;
  await supabase.auth.signOut();
}

export function setupOnlineWatchdog() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // FIX: Use fetch with keepalive instead of sendBeacon.
  // sendBeacon cannot set custom headers, so the Supabase REST endpoint
  // would reject it with 401. fetch + keepalive behaves identically but
  // supports headers and completes even after the page unloads.
  const setOfflineViaFetch = () => {
    if (!cachedUser) return;
    fetch(`${supabaseUrl}/rest/v1/rpc/set_user_offline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ uid: cachedUser.id }),
      keepalive: true,
    }).catch(() => {});
  };

  const handleBeforeUnload = () => {
    setOfflineViaFetch();
  };

  const handleVisibilityChange = () => {
    if (!cachedUser) return;
    if (document.visibilityState === 'visible') {
      setOnlineStatus(cachedUser.id, true);
    } else {
      setOfflineViaFetch();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
