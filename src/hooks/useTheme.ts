import { useState, useCallback } from 'react';
import type { ThemeMode } from '../types/chat';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem('theme') as ThemeMode) || 'light'; } catch { return 'light'; }
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch {}
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
