import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** True when both env vars are present. Used to guard all Supabase calls. */
export const supabaseReady = !!(supabaseUrl && supabaseKey);

/**
 * Supabase client. Only safe to use when `supabaseReady === true`.
 * Accessing this when credentials are missing will throw at call-time
 * (not at import time), so the UI can render a setup screen first.
 */
export const supabase: SupabaseClient = supabaseReady
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 30,
        },
      },
    })
  : (null as unknown as SupabaseClient);
