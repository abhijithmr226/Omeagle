import React, { useState } from 'react';
import { Video, MessageSquare, Globe, HelpCircle, Shield, Moon, Sun, Menu, ChevronDown, X } from 'lucide-react';
import { ChatMode, ThemeMode } from '../types/chat';

interface HeaderProps {
  currentMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  onlineCount: number;
  theme: ThemeMode;
  language: string;
  onToggleTheme: () => void;
  onOpenSafety: () => void;
  onOpenHelp: () => void;
  onLanguageChange: (code: string) => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onlineCount,
  theme,
  language,
  onToggleTheme,
  onOpenSafety,
  onOpenHelp,
  onLanguageChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLangLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';

  const handleLangSelect = (code: string) => {
    onLanguageChange(code);
    setLangOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a href="#" onClick={(e) => { e.preventDefault(); onSelectMode('landing'); }} className="logo-link">
            <img src="/headerlogo.png" alt="Omeagle Logo" className="header-logo-img" />
          </a>

          <nav className="desktop-nav">
            <button className={`nav-tab ${currentMode === 'video' ? 'active' : ''}`} onClick={() => onSelectMode('video')}>
              <Video size={18} />
              <span>Video Chat</span>
            </button>
            <button className={`nav-tab ${currentMode === 'text' ? 'active' : ''}`} onClick={() => onSelectMode('text')}>
              <MessageSquare size={18} />
              <span>Text Chat</span>
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-online-badge">
            <span className="pulse-dot-green"></span>
            <span className="online-number">{onlineCount.toLocaleString()}</span>
            <span className="online-label">online</span>
          </div>

          <div className="dropdown-wrapper">
            <button className="header-btn lang-btn" title="Select Language" onClick={() => setLangOpen(!langOpen)}>
              <Globe size={18} />
              <span className="hide-mobile">{currentLangLabel}</span>
              <ChevronDown size={14} />
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`lang-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => handleLangSelect(lang.code)}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="header-btn hide-mobile" onClick={onOpenHelp} title="Help">
            <HelpCircle size={18} />
            <span>Help</span>
          </button>

          <button className="header-btn safety-btn" onClick={onOpenSafety} title="Safety Tips">
            <Shield size={18} />
            <span className="hide-mobile">Safety</span>
          </button>

          <button className="theme-toggle-btn" onClick={onToggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="sun-icon" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" onClick={() => setMobileMenuOpen(false)}>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('landing')}>
            <span>Home</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('video')}>
            <Video size={18} />
            <span>Video Chat</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('text')}>
            <MessageSquare size={18} />
            <span>Text Chat</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { onOpenSafety(); setMobileMenuOpen(false); }}>
            <Shield size={18} />
            <span>Safety</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { onOpenHelp(); setMobileMenuOpen(false); }}>
            <HelpCircle size={18} />
            <span>Help</span>
          </button>
        </div>
      )}

      <style>{`
        .site-header {
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .header-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0.6rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .mobile-menu-btn {
          display: none;
          color: var(--text-primary);
          padding: 0.4rem;
        }
        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .header-logo-img {
          height: 38px;
          width: auto;
          object-fit: contain;
        }
        [data-theme='dark'] .header-logo-img {
          filter: invert(1);
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: 1rem;
        }
        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          position: relative;
        }
        .nav-tab:hover {
          color: var(--brand-blue);
          background-color: var(--bg-surface-secondary);
        }
        .nav-tab.active {
          color: var(--brand-blue);
        }
        .nav-tab.active::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          right: 0;
          height: 3px;
          background-color: var(--brand-blue);
          border-radius: 3px 3px 0 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .header-online-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background-color: var(--bg-surface-secondary);
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .online-number {
          color: var(--brand-blue);
          font-weight: 700;
        }
        .online-label {
          color: var(--text-secondary);
        }
        .header-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.85rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: var(--radius-md);
        }
        .header-btn:hover {
          background-color: var(--bg-surface-secondary);
          color: var(--text-primary);
        }
        .safety-btn {
          color: var(--text-primary);
        }
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          background-color: var(--bg-surface-secondary);
        }
        .theme-toggle-btn:hover {
          color: var(--brand-blue);
          background-color: var(--border-color);
        }
        .sun-icon {
          color: #f59e0b;
        }
        .dropdown-wrapper {
          position: relative;
        }
        .lang-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.4rem;
          min-width: 160px;
          z-index: 200;
          max-height: 300px;
          overflow-y: auto;
        }
        .lang-option {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.55rem 0.85rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
          border-radius: var(--radius-sm);
        }
        .lang-option:hover {
          background-color: var(--bg-surface-secondary);
        }
        .lang-option.active {
          color: var(--brand-blue);
          font-weight: 700;
        }
        .mobile-nav-drawer {
          display: none;
          flex-direction: column;
          padding: 0.5rem 0.75rem 1rem;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-surface);
        }
        .mobile-drawer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          border-radius: var(--radius-md);
        }
        .mobile-drawer-item:hover {
          background-color: var(--bg-surface-secondary);
        }
        @media (max-width: 868px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .mobile-nav-drawer {
            display: flex;
          }
          .hide-mobile {
            display: none !important;
          }
          .header-container {
            padding: 0.5rem 0.75rem;
          }
          .header-logo-img {
            height: 32px;
          }
        }
      `}</style>
    </header>
  );
};
