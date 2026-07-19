import React from 'react';
import { Video, MessageSquare, Settings2, Globe, Tag, Heart } from 'lucide-react';
import type { UserSettings } from '../types/chat';

interface LandingPageProps {
  onStartChat: (mode: 'video' | 'text') => void;
  onlineCount: number;
  settings: UserSettings;
  onOpenPrefs: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {};
function getFlag(code: string): string {
  if (!code) return '';
  if (COUNTRY_FLAGS[code]) return COUNTRY_FLAGS[code];
  COUNTRY_FLAGS[code] = String.fromCodePoint(
    ...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
  return COUNTRY_FLAGS[code];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, onlineCount, settings, onOpenPrefs }) => {
  const hasPrefs = settings.country || settings.gender || (settings.interests && settings.interests.length > 0) || settings.preferredGender;

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Talk to <span className="highlight-text">strangers</span> anywhere
          </h1>
          <p className="hero-subtitle">
            Meet new people from around the world instantly
          </p>
          <div className="cta-group">
            <button className="btn-primary-lg" onClick={() => onStartChat('video')}>
              <Video size={22} />
              <span>Start Video Chat</span>
            </button>
            <button className="btn-secondary-lg" onClick={() => onStartChat('text')}>
              <MessageSquare size={22} />
              <span>Text Chat</span>
            </button>
          </div>
          <button className="prefs-link-btn" onClick={onOpenPrefs}>
            <Settings2 size={16} />
            <span>{hasPrefs ? 'Edit Matching Preferences' : 'Set Matching Preferences'}</span>
          </button>
          {hasPrefs && (
            <div className="prefs-chips-row">
              {settings.country && (
                <span className="pref-chip"><Globe size={12} /> {getFlag(settings.country)} {settings.country}</span>
              )}
              {settings.gender && (
                <span className="pref-chip"><span className="pref-icon">{settings.gender === 'male' ? '♂' : settings.gender === 'female' ? '♀' : '⚧'}</span> {settings.gender}</span>
              )}
              {settings.interests && settings.interests.slice(0, 5).map((interest, i) => (
                <span key={i} className="pref-chip"><Tag size={12} /> {interest}</span>
              ))}
              {settings.preferredGender && (
                <span className="pref-chip"><Heart size={12} /> {settings.preferredGender === 'any' ? 'Any gender' : settings.preferredGender}</span>
              )}
            </div>
          )}
          <div className="online-badge">
            <span className="pulse-dot-green"></span>
            <span><strong>{onlineCount.toLocaleString()}</strong> people online now</span>
          </div>
        </div>
      </section>
      <style>{`
        .landing-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 64px); padding: 2rem 1rem; }
        .hero-section { text-align: center; max-width: 600px; }
        .hero-title { font-size: 3.5rem; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 1rem; color: var(--text-primary); }
        .highlight-text { color: var(--brand-blue); }
        .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem; }
        .cta-group { display: flex; flex-direction: column; gap: 0.9rem; max-width: 340px; margin: 0 auto; }
        .btn-primary-lg { display: flex; align-items: center; justify-content: center; gap: 0.75rem; background-color: var(--brand-blue); color: #ffffff; padding: 1rem 1.75rem; font-size: 1.1rem; font-weight: 700; border-radius: var(--radius-md); box-shadow: 0 8px 20px -4px rgba(0, 102, 255, 0.4); }
        .btn-primary-lg:hover { background-color: var(--brand-blue-hover); transform: translateY(-1px); }
        .btn-secondary-lg { display: flex; align-items: center; justify-content: center; gap: 0.75rem; background-color: var(--bg-surface); border: 2px solid var(--brand-blue); color: var(--brand-blue); padding: 0.9rem 1.75rem; font-size: 1.1rem; font-weight: 700; border-radius: var(--radius-md); }
        .btn-secondary-lg:hover { background-color: var(--brand-blue-light); }
        .prefs-link-btn { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1.25rem; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: var(--radius-md); transition: all 0.2s; background: none; border: 1px solid var(--border-color); }
        .prefs-link-btn:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: var(--brand-blue-light); }
        .prefs-chips-row { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-top: 1rem; max-width: 380px; margin-left: auto; margin-right: auto; }
        .pref-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.6rem; background: var(--brand-blue-light); color: var(--brand-blue); border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
        .pref-icon { font-size: 0.85rem; }
        .online-badge { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2.5rem; padding: 0.6rem 1.2rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 0.95rem; color: var(--text-secondary); }
        @media (max-width: 868px) {
          .hero-title { font-size: 2.4rem; }
          .hero-subtitle { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
};
