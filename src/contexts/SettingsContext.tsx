import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSettings } from '../types/chat';

const STORAGE_KEY = 'omeagle_settings';

function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveSettings(s: UserSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  useEffect(() => { saveSettings(settings); }, [settings]);

  const updateSettings = useCallback((s: UserSettings) => setSettings(s), []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
