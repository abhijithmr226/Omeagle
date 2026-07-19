import React, { useState } from 'react';
import { Video, MessageSquare, Moon, Sun, Menu, X } from 'lucide-react';
import { ChatMode, ThemeMode } from '../types/chat';

interface HeaderProps {
  currentMode: ChatMode;
  onSelectMode: (mode: ChatMode) => void;
  onlineCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode, onSelectMode, onlineCount, theme, onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a href="#" onClick={(e) => { e.preventDefault(); onSelectMode('landing'); }} className="logo-link">
            <img src="/headerlogo.png" alt="Omeagle" className="header-logo-img" />
          </a>
          <nav className="desktop-nav">
            <button className={`nav-tab ${currentMode === 'video' ? 'active' : ''}`} onClick={() => onSelectMode('video')}>
              <Video size={18} /><span>Video</span>
            </button>
            <button className={`nav-tab ${currentMode === 'text' ? 'active' : ''}`} onClick={() => onSelectMode('text')}>
              <MessageSquare size={18} /><span>Text</span>
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="header-online-badge">
            <span className="pulse-dot-green"></span>
            <span className="online-number">{onlineCount.toLocaleString()}</span>
            <span className="online-label">online</span>
          </div>
          <button className="theme-toggle-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="sun-icon" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" onClick={() => setMobileMenuOpen(false)}>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('landing')}>Home</button>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('video')}><Video size={18} /> Video Chat</button>
          <button className="mobile-drawer-item" onClick={() => onSelectMode('text')}><MessageSquare size={18} /> Text Chat</button>
        </div>
      )}
      <style>{`
        .site-header { background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; }
        .header-container { max-width: 1440px; margin: 0 auto; padding: 0.6rem 1.25rem; display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .header-left { display: flex; align-items: center; gap: 1.5rem; }
        .mobile-menu-btn { display: none; color: var(--text-primary); padding: 0.4rem; }
        .logo-link { display: flex; align-items: center; text-decoration: none; }
        .header-logo-img { height: 38px; width: auto; object-fit: contain; }
        [data-theme='dark'] .header-logo-img { filter: invert(1); }
        .desktop-nav { display: flex; align-items: center; gap: 0.5rem; margin-left: 1rem; }
        .nav-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; font-weight: 600; font-size: 0.95rem; color: var(--text-secondary); border-radius: var(--radius-md); position: relative; }
        .nav-tab:hover { color: var(--brand-blue); background-color: var(--bg-surface-secondary); }
        .nav-tab.active { color: var(--brand-blue); }
        .nav-tab.active::after { content: ''; position: absolute; bottom: -10px; left: 0; right: 0; height: 3px; background-color: var(--brand-blue); border-radius: 3px 3px 0 0; }
        .header-right { display: flex; align-items: center; gap: 0.75rem; }
        .header-online-badge { display: flex; align-items: center; gap: 0.4rem; background-color: var(--bg-surface-secondary); padding: 0.4rem 0.8rem; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; }
        .online-number { color: var(--brand-blue); font-weight: 700; }
        .online-label { color: var(--text-secondary); }
        .theme-toggle-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-full); color: var(--text-secondary); background-color: var(--bg-surface-secondary); }
        .theme-toggle-btn:hover { color: var(--brand-blue); }
        .sun-icon { color: #f59e0b; }
        .mobile-nav-drawer { display: none; flex-direction: column; padding: 0.5rem 0.75rem 1rem; border-top: 1px solid var(--border-color); background-color: var(--bg-surface); }
        .mobile-drawer-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; font-weight: 600; font-size: 0.95rem; color: var(--text-primary); border-radius: var(--radius-md); }
        .mobile-drawer-item:hover { background-color: var(--bg-surface-secondary); }
        @media (max-width: 868px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-nav-drawer { display: flex; }
          .header-container { padding: 0.5rem 0.75rem; }
          .header-logo-img { height: 32px; }
        }
      `}</style>
    </header>
  );
};
