import React, { useEffect, useRef } from 'react';
import { Video, MessageSquare, ShieldCheck, Globe, ShieldOff, Lock, Users, Star, ChevronRight, Home, Heart, User } from 'lucide-react';
import { ChatMode } from '../types/chat';

interface LandingPageProps {
  onStartChat: (mode: 'video' | 'text') => void;
  onlineCount: number;
  onOpenSafety: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onlineCount,
  onOpenSafety
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.dataset.loaded) {
      adRef.current.dataset.loaded = 'true';
      const s = document.createElement('script');
      s.src = 'https://pl30431395.effectivecpmnetwork.com/1b8f39848ef48014d2c1645ee86941c1/invoke.js';
      s.async = true;
      (s as any).dataset.cfasync = 'false';
      document.body.appendChild(s);
    }
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Container */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Talk to <span className="highlight-text">strangers</span> anywhere
          </h1>
          <p className="hero-subtitle">
            Meet new people from around the world instantly
          </p>

          {/* Action Buttons */}
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
        </div>

        {/* Hero Visual Collage */}
        <div className="hero-visual">
          <div className="visual-wrapper">
            {/* Top Avatar Card */}
            <div className="avatar-card avatar-top">
              <picture>
                <source srcSet="/girl.webp" type="image/webp" />
                <img 
                  src="/girl.png" 
                  alt="Stranger profile female" 
                  className="avatar-img"
                  width="220"
                  height="240"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>

            {/* Bottom Avatar Card */}
            <div className="avatar-card avatar-bottom">
              <picture>
                <source srcSet="/boy.webp" type="image/webp" />
                <img 
                  src="/boy.png" 
                  alt="Stranger profile male" 
                  className="avatar-img"
                  width="210"
                  height="220"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
              <div className="floating-globe-badge">
                <Globe size={24} className="globe-icon-spin" />
              </div>
            </div>

            {/* Decorative SVGs */}
            <svg className="decor-swirl" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 40 Q 50 10, 80 50 T 40 90" stroke="#0066ff" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <div className="decor-heart">🧡</div>
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="safety-banner-card" onClick={onOpenSafety}>
        <div className="banner-left">
          <div className="shield-icon-badge">
            <ShieldCheck size={26} />
          </div>
          <div className="banner-text">
            <h3>100% Safe & Anonymous</h3>
            <p>Your privacy is our priority. Chat securely.</p>
          </div>
        </div>
        <ChevronRight size={20} className="banner-arrow" />
      </section>

      {/* Why Omeagle Grid */}
      <section className="features-section">
        <h2 className="section-title">Why Omeagle?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple-bg">
              <Globe size={26} />
            </div>
            <h4>Global Community</h4>
            <p>Connect with people from all over the world</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange-bg">
              {/* ShieldOff icon representation for anonymity */}
              <ShieldOff size={26} />
            </div>
            <h4>Anonymous Chat</h4>
            <p>No sign up required. Your identity is safe</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green-bg">
              <Lock size={26} />
            </div>
            <h4>Safe & Secure</h4>
            <p>AI moderation and reporting system</p>
          </div>
        </div>
      </section>

      {/* Native Banner Ad */}
      <section className="native-ad-section">
        <div ref={adRef} id="container-1b8f39848ef48014d2c1645ee86941c1"></div>
      </section>

      {/* Live Online Users Card */}
      <section className="online-users-card">
        <div className="users-left">
          <div className="users-icon-circle">
            <Users size={24} />
          </div>
          <div className="users-info">
            <div className="online-count-large">{onlineCount.toLocaleString()}</div>
            <div className="online-subtext">users online now</div>
          </div>
        </div>
        <div className="live-pill">
          <span className="pulse-dot-green"></span>
          <span>Live</span>
        </div>
      </section>

      {/* Add Omeagle to Home Screen PWA Card */}
      <section className="pwa-install-card">
        <div className="pwa-left">
          <div className="star-icon-circle">
            <Star size={24} fill="#f59e0b" color="#f59e0b" />
          </div>
          <div className="pwa-text">
            <h4>Add Omeagle to Home Screen</h4>
            <p>Quick access to chat with strangers anytime, anywhere.</p>
          </div>
        </div>
        <button className="btn-add-now" onClick={() => alert("To add Omeagle to your home screen, tap your browser's share icon and select 'Add to Home Screen'.")}>
          Add Now
        </button>
      </section>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="mobile-bottom-nav">
        <button className="bottom-nav-item active">
          <Home size={22} />
          <span>Home</span>
        </button>
        <button className="bottom-nav-item" onClick={() => onStartChat('video')}>
          <Globe size={22} />
          <span>Discover</span>
        </button>
        <button className="bottom-nav-item">
          <Heart size={22} />
          <span>Favorites</span>
        </button>
        <button className="bottom-nav-item" onClick={onOpenSafety}>
          <ShieldCheck size={22} />
          <span>Safety</span>
        </button>
        <button className="bottom-nav-item">
          <User size={22} />
          <span>Profile</span>
        </button>
      </div>

      <style>{`
        .landing-page {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          padding: 1.5rem 0;
        }

        .hero-section {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
          align-items: center;
          padding: 1rem 0;
        }

        .hero-title {
          font-size: 3.5rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .highlight-text {
          color: var(--brand-blue);
          display: inline-block;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          max-width: 440px;
        }

        .btn-primary-lg {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background-color: var(--brand-blue);
          color: #ffffff;
          padding: 1rem 1.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          box-shadow: 0 8px 20px -4px rgba(0, 102, 255, 0.4);
        }

        .btn-primary-lg:hover {
          background-color: var(--brand-blue-hover);
          transform: translateY(-1px);
        }

        .btn-secondary-lg {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background-color: var(--bg-surface);
          border: 2px solid var(--brand-blue);
          color: var(--brand-blue);
          padding: 0.9rem 1.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .btn-secondary-lg:hover {
          background-color: var(--brand-blue-light);
        }

        /* Visual Collage */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .visual-wrapper {
          position: relative;
          width: 320px;
          height: 380px;
        }

        .avatar-card {
          position: absolute;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          border: 4px solid var(--bg-surface);
        }

        .avatar-top {
          width: 220px;
          height: 240px;
          top: 0;
          right: 0;
          transform: rotate(5deg);
        }

        .avatar-bottom {
          width: 210px;
          height: 220px;
          bottom: 10px;
          left: 0;
          transform: rotate(-6deg);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .floating-globe-badge {
          position: absolute;
          bottom: -10px;
          right: -10px;
          background: #ffffff;
          border-radius: var(--radius-full);
          padding: 8px;
          box-shadow: var(--shadow-md);
          color: var(--brand-blue);
        }

        .globe-icon-spin {
          animation: spin-slow 12s linear infinite;
        }

        .decor-swirl {
          position: absolute;
          top: -20px;
          left: 40px;
          width: 60px;
          height: 60px;
        }

        .decor-heart {
          position: absolute;
          top: 100px;
          left: 70px;
          font-size: 1.5rem;
        }

        /* Safety Banner Card */
        .safety-banner-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.1rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .safety-banner-card:hover {
          border-color: var(--status-green);
          box-shadow: var(--shadow-md);
        }

        .banner-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .shield-icon-badge {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background-color: var(--status-green-light);
          color: var(--status-green);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .banner-text h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }

        .banner-text p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .banner-arrow {
          color: var(--text-muted);
        }

        /* Why Omeagle Features Grid */
        .features-section {
          margin-top: 0.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1.25rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .feature-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .purple-bg { background-color: #f3e8ff; color: #9333ea; }
        .orange-bg { background-color: #ffedd5; color: #ea580c; }
        .green-bg { background-color: #d1fae5; color: #059669; }

        .feature-card h4 {
          font-size: 1.05rem;
          margin-bottom: 0.4rem;
        }

        .feature-card p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        /* Online Users Banner */
        .online-users-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .users-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .users-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background-color: var(--brand-blue-light);
          color: var(--brand-blue);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .online-count-large {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--brand-blue);
          line-height: 1.1;
        }

        .online-subtext {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .live-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
          color: var(--status-green);
          font-size: 0.9rem;
        }

        /* PWA Installation Card */
        .pwa-install-card {
          background-color: var(--brand-blue-light);
          border: 1px solid rgba(0, 102, 255, 0.2);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pwa-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .star-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background-color: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pwa-text h4 {
          font-size: 1.05rem;
          margin-bottom: 0.2rem;
        }

        .pwa-text p {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .btn-add-now {
          background-color: var(--bg-surface);
          border: 2px solid var(--brand-blue);
          color: var(--brand-blue);
          font-weight: 700;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-md);
        }

        .btn-add-now:hover {
          background-color: var(--brand-blue);
          color: #ffffff;
        }

        /* Native Ad Section */
        .native-ad-section {
          min-height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .native-ad-section:empty {
          display: none;
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--bg-surface);
          border-top: 1px solid var(--border-color);
          padding: 0.5rem;
          justify-content: space-around;
          align-items: center;
          z-index: 90;
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .bottom-nav-item.active {
          color: var(--brand-blue);
        }

        @media (max-width: 868px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-title {
            font-size: 2.4rem;
          }
          .hero-subtitle {
            font-size: 1.05rem;
          }
          .cta-group {
            margin: 0 auto;
            width: 100%;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-visual {
            margin-top: 1rem;
          }
          .mobile-bottom-nav {
            display: flex;
          }
          .pwa-install-card {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          .btn-add-now {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
