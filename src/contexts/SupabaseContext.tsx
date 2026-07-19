import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { initializeAuth, getCurrentUser, setupOnlineWatchdog } from '../lib/auth';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  error: null,
  initialized: false,
});

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const initAuth = useCallback(async () => {
    try {
      setLoading(true);
      const u = await initializeAuth();
      setUser(u);
      setInitialized(true);
    } catch (err) {
      console.error('[SupabaseProvider] Auth init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();

    // Set up online watchdog (handles tab close, visibility change)
    const cleanup = setupOnlineWatchdog();

    return () => {
      cleanup();
    };
  }, [initAuth]);

  return (
    <SupabaseContext.Provider value={{ user, loading, error, initialized }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabaseContext() {
  return useContext(SupabaseContext);
}
