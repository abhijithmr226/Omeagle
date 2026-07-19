import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

let cachedUser: User | null = null;

export async function initializeAuth(): Promise<User> {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    cachedUser = session.user;
    await upsertProfile(session.user.id);
    await setOnlineStatus(session.user.id, true);
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error('Failed to create anonymous user');

  cachedUser = data.user;
  await upsertProfile(data.user.id);
  await setOnlineStatus(data.user.id, true);
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
  return Number(data ?? 1) + 1;
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

  const handleBeforeUnload = () => {
    if (cachedUser) {
      navigator.sendBeacon(
        `${supabaseUrl}/rest/v1/rpc/set_user_offline`,
        new Blob(
          [JSON.stringify({ uid: cachedUser.id })],
          { type: 'application/json' }
        )
      );
    }
  };

  const handleVisibilityChange = () => {
    if (cachedUser) {
      if (document.visibilityState === 'visible') {
        setOnlineStatus(cachedUser.id, true);
      } else {
        setOnlineStatus(cachedUser.id, false);
      }
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
