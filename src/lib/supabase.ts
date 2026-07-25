import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Public credentials — safe to commit (anon/publishable key is client-side by design)
const SUPABASE_URL = 'https://bhrsheykwaduhpxiyqlw.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bCGSsLILysA90c5tDryyww_gvhDPaNW';

// Fall back to env vars if set (useful for forks / local overrides)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL;
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || SUPABASE_PUBLISHABLE_KEY;

/** Always true — credentials are baked in. */
export const supabaseReady = true;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
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
});
