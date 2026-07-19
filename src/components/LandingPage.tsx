import React from 'react';
import { Video, MessageSquare } from 'lucide-react';
import { ChatMode } from '../types/chat';

interface LandingPageProps {
  onStartChat: (mode: 'video' | 'text') => void;
  onlineCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, onlineCount }) => {
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
        .online-badge { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2.5rem; padding: 0.6rem 1.2rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 0.95rem; color: var(--text-secondary); }
        @media (max-width: 868px) {
          .hero-title { font-size: 2.4rem; }
          .hero-subtitle { font-size: 1.05rem; }
        }
      `}</style>
    </div>
  );
};
