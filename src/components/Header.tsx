import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, MessageSquare, Moon, Sun, Menu, X, Home, Shield, Info, Mail } from 'lucide-react';
import { ChatMode, ThemeMode } from '../types/chat';
import headerLogo from '../assets/headerlogo.png';

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
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <button className="mobile-menu-btn" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" onClick={() => onSelectMode('landing')} className="logo-link">
            <img src={headerLogo} alt="Omeagle" className="header-logo-img" />
          </Link>
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
          <button className="theme-toggle-btn" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="sun-icon" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="mobile-drawer-handle" />
        <div className="mobile-drawer-content">
          <button className="mobile-drawer-item" onClick={() => { onSelectMode('landing'); navigate('/'); setMobileMenuOpen(false); }}>
            <Home size={20} /> <span>Home</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { onSelectMode('video'); setMobileMenuOpen(false); }}>
            <Video size={20} /> <span>Video Chat</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { onSelectMode('text'); setMobileMenuOpen(false); }}>
            <MessageSquare size={20} /> <span>Text Chat</span>
          </button>
          <div className="mobile-drawer-divider" />
          <button className="mobile-drawer-item" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
            <Info size={20} /> <span>About</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { navigate('/safety'); setMobileMenuOpen(false); }}>
            <Shield size={20} /> <span>Safety</span>
          </button>
          <button className="mobile-drawer-item" onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>
            <Mail size={20} /> <span>Contact</span>
          </button>
        </div>
      </div>

      <style>{`
        .site-header { background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(255,255,255,0.85); }
        [data-theme='dark'] .site-header { background: rgba(21,28,40,0.85); }
        .header-container { max-width: 1440px; margin: 0 auto; padding: 0.6rem 1.25rem; display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .header-left { display: flex; align-items: center; gap: 1.5rem; }
        .mobile-menu-btn { display: none; color: var(--text-primary); padding: 0.5rem; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; border-radius: var(--radius-md); }
        .mobile-menu-btn:active { background: var(--bg-surface-secondary); }
        .logo-link { display: flex; align-items: center; text-decoration: none; }
        .header-logo-img { height: 38px; width: auto; object-fit: contain; }
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
        .mobile-menu-backdrop { display: none; }

        .mobile-nav-drawer { display: none; flex-direction: column; background-color: var(--bg-surface); overflow: hidden; }
        .mobile-drawer-handle { width: 36px; height: 4px; border-radius: 2px; background: var(--border-color); margin: 0.5rem auto 0; flex-shrink: 0; }
        .mobile-drawer-content { display: flex; flex-direction: column; padding: 0.5rem 0.75rem 1rem; gap: 0.15rem; }
        .mobile-drawer-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1rem; font-weight: 600; font-size: 0.95rem; color: var(--text-primary); border-radius: var(--radius-md); min-height: 52px; transition: all 0.15s ease; }
        .mobile-drawer-item:active { background-color: var(--bg-surface-secondary); transform: scale(0.98); }
        .mobile-drawer-item svg { color: var(--text-secondary); flex-shrink: 0; }
        .mobile-drawer-divider { height: 1px; background: var(--border-color); margin: 0.5rem 0.5rem; }

        @media (max-width: 1024px) {
          .desktop-nav { display: none; }
          .mobile-menu-btn { display: flex; }
          .mobile-nav-drawer { display: flex; position: fixed; top: 0; left: 0; right: 0; z-index: 150; transform: translateY(-100%); transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); border-radius: 0 0 var(--radius-xl) var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.2); padding-top: env(safe-area-inset-top, 0px); }
          .mobile-nav-drawer.open { transform: translateY(0); }
          .mobile-menu-backdrop { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 140; animation: fadeIn 0.2s ease; }
          .header-container { padding: 0.5rem 0.75rem; height: 56px; }
          .header-logo-img { height: 32px; }
          .online-label { display: none; }
          .header-online-badge { padding: 0.35rem 0.6rem; }
        }

        @media (max-width: 380px) {
          .header-online-badge { display: none; }
        }
      `}</style>
    </header>
  );
};
