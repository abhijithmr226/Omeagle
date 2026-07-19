import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserSettings } from '../types/chat';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({});
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
