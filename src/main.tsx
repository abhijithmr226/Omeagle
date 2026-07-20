import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupScreen } from './components/SetupScreen';
import './index.css';

const supabaseReady =
  !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      {!supabaseReady ? (
        <SetupScreen />
      ) : (
        <BrowserRouter>
          <SupabaseProvider>
            <ThemeProvider>
              <SettingsProvider>
                <App />
              </SettingsProvider>
            </ThemeProvider>
          </SupabaseProvider>
        </BrowserRouter>
      )}
    </ErrorBoundary>
  </React.StrictMode>
);
