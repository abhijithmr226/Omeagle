import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, MessageSquare, Moon, Sun, Menu, X, Home, Shield, Info, Mail } from 'lucide-react';
import type { ChatMode, ThemeMode } from '../types/chat';

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
    <header className="ow-site-header">
      <div className="ow-header-container">
        {/* Left: Real Omegle Logo & Tagline */}
        <div className="ow-header-left">
          <button className="ow-mobile-menu-btn" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <Link to="/" onClick={() => onSelectMode('landing')} className="ow-logo-brand" title="Omegle: Talk to strangers!">
            {/* Omegle Dual Speech Bubble SVG */}
            <div className="ow-logo-icon">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 6C8.477 6 4 10.477 4 16C4 19.387 5.688 22.38 8.28 24.22L6 31L13.1 28.7C13.39 28.74 13.69 28.77 14 28.77C19.523 28.77 24 24.293 24 18.77C24 11.72 19.523 6 14 6Z" fill="#2C8CF4" />
                <path d="M30 18C25.58 18 22 21.58 22 26C22 28.71 23.35 31.1 25.42 32.58L23.6 38L29.28 36.16C29.52 36.19 29.76 36.21 30 36.21C34.42 36.21 38 32.63 38 28.21C38 22.58 34.42 18 30 18Z" fill="#58A6F8" opacity="0.9" />
              </svg>
            </div>

            {/* Omegle Orange Text */}
            <span className="ow-logo-text">omegle</span>
          </Link>

          <span className="ow-logo-tagline">Talk to strangers!</span>

          <nav className="ow-desktop-nav">
            <button 
              className={`ow-nav-link ${currentMode === 'video' ? 'active' : ''}`} 
              onClick={() => onSelectMode('video')}
            >
              <Video size={16} />
              <span>Video</span>
            </button>
            <button 
              className={`ow-nav-link ${currentMode === 'text' ? 'active' : ''}`} 
              onClick={() => onSelectMode('text')}
            >
              <MessageSquare size={16} />
              <span>Text</span>
            </button>
          </nav>
        </div>

        {/* Right: Online Count Pill & Theme Toggle */}
        <div className="ow-header-right">
          <div className="ow-online-counter-badge" title="Active users online now">
            <span className="ow-online-count-number">{onlineCount.toLocaleString()}+</span>
            <span className="ow-online-count-label">online now</span>
          </div>

          <button className="ow-header-icon-btn" onClick={() => setMobileMenuOpen(true)} title="Select Language" aria-label="Select Language">
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
          </button>
          
          <button className="ow-header-icon-btn" onClick={onToggleTheme} title="Toggle Dark/Light Mode" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && <div className="ow-mobile-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Mobile Drawer */}
      <div className={`ow-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`} ref={menuRef}>
        <div className="ow-drawer-bar" />
        <div className="ow-drawer-body">
          <button className="ow-drawer-item" onClick={() => { onSelectMode('landing'); navigate('/'); setMobileMenuOpen(false); }}>
            <Home size={18} /> <span>Home</span>
          </button>
          <button className="ow-drawer-item" onClick={() => { onSelectMode('video'); setMobileMenuOpen(false); }}>
            <Video size={18} /> <span>Video Chat</span>
          </button>
          <button className="ow-drawer-item" onClick={() => { onSelectMode('text'); setMobileMenuOpen(false); }}>
            <MessageSquare size={18} /> <span>Text Chat</span>
          </button>
          
          <div className="ow-drawer-sep" />
          <div className="ow-drawer-section-label">REGIONAL HUBS</div>
          <div className="ow-drawer-lang-grid">
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/hi'); setMobileMenuOpen(false); }}>🇮🇳 हिन्दी</button>
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/bn'); setMobileMenuOpen(false); }}>🇧🇩 বাংলা</button>
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/ta'); setMobileMenuOpen(false); }}>🇮🇳 தமிழ்</button>
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/te'); setMobileMenuOpen(false); }}>🇮🇳 తెలుగు</button>
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/mr'); setMobileMenuOpen(false); }}>🇮🇳 मराठी</button>
            <button className="ow-drawer-lang-chip" onClick={() => { navigate('/gu'); setMobileMenuOpen(false); }}>🇮🇳 ગુજરાતી</button>
          </div>

          <div className="ow-drawer-sep" />
          <button className="ow-drawer-item" onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
            <Info size={18} /> <span>About</span>
          </button>
          <button className="ow-drawer-item" onClick={() => { navigate('/safety'); setMobileMenuOpen(false); }}>
            <Shield size={18} /> <span>Safety</span>
          </button>
          <button className="ow-drawer-item" onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>
            <Mail size={18} /> <span>Contact</span>
          </button>
        </div>
      </div>

      <style>{`
        .ow-site-header {
          background: linear-gradient(180deg, #d6e8fa 0%, #ffffff 100%);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        [data-theme='dark'] .ow-site-header {
          background: #111827;
        }

        .ow-header-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0.4rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }

        .ow-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .ow-logo-brand {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-decoration: none;
        }

        .ow-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ow-logo-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 2.25rem;
          font-weight: 900;
          color: var(--omegle-orange);
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .ow-logo-tagline {
          font-size: 1.45rem;
          font-weight: 800;
          color: #000000;
          margin-left: 0.5rem;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        [data-theme='dark'] .ow-logo-tagline {
          color: #F8FAFC;
        }

        .ow-desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-left: 1.25rem;
        }

        .ow-nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .ow-nav-link:hover, .ow-nav-link.active {
          color: var(--brand-blue);
          background: var(--brand-blue-light);
        }

        .ow-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ow-online-counter-badge {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          color: #3b8eed;
          font-family: inherit;
        }

        .ow-online-count-number {
          font-size: 1.25rem;
          font-weight: 800;
          color: #3b8eed;
        }

        .ow-online-count-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #3b8eed;
        }

        .ow-header-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
        }

        [data-theme='dark'] .ow-header-icon-btn {
          background: #1e293b;
        }

        .ow-header-icon-btn:hover {
          color: var(--brand-blue);
          border-color: var(--brand-blue);
        }

        .ow-mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Mobile Drawer */
        .ow-mobile-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 140;
        }

        .ow-mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          border-radius: 0 0 16px 16px;
          box-shadow: var(--shadow-xl);
          z-index: 150;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
          overflow: hidden;
          padding-bottom: 1rem;
        }

        .ow-mobile-drawer.open {
          transform: translateY(0);
        }

        .ow-drawer-bar {
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: var(--border-color);
          margin: 0.5rem auto 0;
        }

        .ow-drawer-body {
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ow-drawer-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
        }

        .ow-drawer-item:hover {
          background: var(--bg-surface-secondary);
          color: var(--brand-blue);
        }

        .ow-drawer-sep {
          height: 1px;
          background: var(--border-color);
          margin: 0.4rem 0;
        }

        .ow-drawer-section-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          padding: 0.25rem 0.5rem;
        }

        .ow-drawer-lang-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }

        .ow-drawer-lang-chip {
          padding: 0.45rem 0.75rem;
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 600;
          text-align: left;
          color: var(--text-primary);
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .ow-logo-tagline {
            display: none;
          }
          .ow-desktop-nav {
            display: none;
          }
          .ow-mobile-menu-btn {
            display: flex;
          }
          .ow-mobile-backdrop {
            display: block;
          }
          .ow-mobile-drawer {
            display: flex;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .ow-logo-text {
            font-size: 1.85rem;
          }
          .ow-online-count-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
