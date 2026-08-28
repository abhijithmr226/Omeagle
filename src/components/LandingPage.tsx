import React, { useState, useEffect, useRef } from 'react';
import { Video, MessageSquare, Settings2, Globe, Tag, Heart, Shield, Zap, Smartphone, Plus, X, Check } from 'lucide-react';
import type { UserSettings } from '../types/chat';

interface LandingPageProps {
  onStartChat: (mode: 'video' | 'text') => void;
  onlineCount: number;
  settings: UserSettings;
  onOpenPrefs: () => void;
  onUpdateInterests?: (interests: string[]) => void;
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

const POPULAR_SUGGESTIONS = [
  'gaming', 'anime', 'music', 'movies', 'coding', 'travel', 'cricket', 'dosti', 'tech', 'fitness'
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartChat,
  onlineCount,
  settings,
  onOpenPrefs,
  onUpdateInterests
}) => {
  const [displayCount, setDisplayCount] = useState(onlineCount || 52410);
  const [isAnimating, setIsAnimating] = useState(false);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(settings.interests || []);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [ageAgreed, setAgeAgreed] = useState(true);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const prevCountRef = useRef(onlineCount || 52410);

  useEffect(() => {
    if (settings.interests) {
      setInterests(settings.interests);
    }
  }, [settings.interests]);

  useEffect(() => {
    if (onlineCount && onlineCount !== prevCountRef.current) {
      setIsAnimating(true);
      const diff = onlineCount - prevCountRef.current;
      const steps = Math.min(Math.abs(diff), 20);
      const stepSize = diff / steps;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayCount(onlineCount);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 300);
        } else {
          setDisplayCount(Math.round(prevCountRef.current + stepSize * step));
        }
      }, 30);
      prevCountRef.current = onlineCount;
      return () => clearInterval(interval);
    }
  }, [onlineCount]);

  const handleAddInterest = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || interests.includes(clean)) return;
    const updated = [...interests, clean];
    setInterests(updated);
    setInterestInput('');
    if (onUpdateInterests) onUpdateInterests(updated);
  };

  const handleRemoveInterest = (tag: string) => {
    const updated = interests.filter(t => t !== tag);
    setInterests(updated);
    if (onUpdateInterests) onUpdateInterests(updated);
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInterest(interestInput);
    }
  };

  const handleStart = (mode: 'video' | 'text') => {
    if (!termsAgreed || !ageAgreed) {
      setShowWarningToast(true);
      setTimeout(() => setShowWarningToast(false), 3000);
      return;
    }
    onStartChat(mode);
  };

  const hasPrefs = settings.country || settings.gender || interests.length > 0 || settings.preferredGender;

  return (
    <div className="ow-landing-wrapper">
      {/* ── Main Omegle Hero Section (Dual Column) ───────────── */}
      <main className="ow-hero-container">
        {/* Left Column: Omegle Intro & Guidelines */}
        <section className="ow-hero-left" aria-label="Omegle Description & Info">
          <div className="ow-intro-card">
            <h1 className="ow-main-heading">
              Talk to Strangers!
            </h1>
            
            <p className="ow-intro-paragraph">
              <strong>Omegle</strong> (oh-meg-ull) is a great way to meet new friends. When you use Omegle, you are paired randomly with another person to talk one-on-one. If you prefer, you can add your interests and you'll be paired with someone who has similar interests.
            </p>

            <div className="ow-mobile-note-box">
              <div className="ow-mobile-note-icon">
                <Smartphone size={22} />
              </div>
              <div className="ow-mobile-note-text">
                <strong>You don't need an app to use Omegle on your phone or tablet!</strong>
                <p>The web site works great on mobile browsers with instant WebRTC camera access.</p>
              </div>
            </div>

            <div className="ow-guidelines-box">
              <div className="ow-guidelines-head">
                <Shield size={16} className="ow-shield-icon" />
                <span>Video is moderated, but no moderation is perfect.</span>
              </div>
              <p className="ow-guidelines-desc">
                Users are solely responsible for their behavior while using Omegle. You must be 18+ or 13+ with parental permission.
              </p>
            </div>
          </div>
        </section>

        {/* Right Column: Start Chatting Action Box */}
        <section className="ow-hero-right" aria-label="Start Chatting Actions">
          <div className="ow-action-card">
            <div className="ow-action-header">
              <span className="ow-start-label">Start chatting:</span>
              <div className={`ow-online-pill ${isAnimating ? 'ow-pulse' : ''}`}>
                <span className="ow-green-dot" />
                <span><strong>{displayCount.toLocaleString()}</strong> online</span>
              </div>
            </div>

            {/* Big Dual Mode CTA Buttons */}
            <div className="ow-cta-row">
              <button 
                type="button" 
                className="ow-btn-mode ow-btn-text" 
                onClick={() => handleStart('text')}
                title="Start Anonymous Text Chat"
              >
                <div className="ow-btn-icon-wrap">
                  <MessageSquare size={26} />
                </div>
                <div className="ow-btn-text-wrap">
                  <span className="ow-btn-title">Text</span>
                  <span className="ow-btn-subtitle">Anonymous Chat</span>
                </div>
              </button>

              <button 
                type="button" 
                className="ow-btn-mode ow-btn-video" 
                onClick={() => handleStart('video')}
                title="Start Live Random Video Chat"
              >
                <div className="ow-btn-icon-wrap">
                  <Video size={28} />
                </div>
                <div className="ow-btn-text-wrap">
                  <span className="ow-btn-title">Video</span>
                  <span className="ow-btn-subtitle">Cam to Cam Chat</span>
                </div>
              </button>
            </div>

            {/* Interest Matching Box ("What do you wanna talk about?") */}
            <div className="ow-interests-box">
              <label htmlFor="interest-input" className="ow-interests-label">
                <span>What do you wanna talk about?</span>
                <span className="ow-optional-badge">Optional</span>
              </label>

              <div className="ow-interest-input-wrap">
                <input
                  id="interest-input"
                  type="text"
                  className="ow-interest-input"
                  placeholder="Add your interests (e.g., anime, music, gaming...)"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                />
                <button
                  type="button"
                  className="ow-add-tag-btn"
                  onClick={() => handleAddInterest(interestInput)}
                  disabled={!interestInput.trim()}
                  aria-label="Add Interest Tag"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Active User Interest Tags */}
              {interests.length > 0 && (
                <div className="ow-active-tags-row">
                  {interests.map((tag) => (
                    <span key={tag} className="ow-interest-chip">
                      #{tag}
                      <button 
                        type="button" 
                        className="ow-chip-remove" 
                        onClick={() => handleRemoveInterest(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Suggested Tags */}
              <div className="ow-suggested-tags">
                <span className="ow-suggested-title">Popular:</span>
                <div className="ow-suggested-list">
                  {POPULAR_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`ow-suggested-chip ${interests.includes(tag) ? 'active' : ''}`}
                      onClick={() => interests.includes(tag) ? handleRemoveInterest(tag) : handleAddInterest(tag)}
                    >
                      {interests.includes(tag) ? <Check size={11} /> : '+'} {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matching Preferences Trigger */}
            <div className="ow-prefs-trigger-bar">
              <button type="button" className="ow-prefs-btn" onClick={onOpenPrefs}>
                <Settings2 size={16} />
                <span>{hasPrefs ? 'Edit Matching Filters (Country & Gender)' : 'Set Matching Preferences'}</span>
              </button>

              {hasPrefs && (
                <div className="ow-prefs-preview">
                  {settings.country && (
                    <span className="ow-pref-pill"><Globe size={11} /> {getFlag(settings.country)} {settings.country}</span>
                  )}
                  {settings.gender && (
                    <span className="ow-pref-pill">
                      {settings.gender === 'male' ? '♂ Male' : settings.gender === 'female' ? '♀ Female' : '⚧ Other'}
                    </span>
                  )}
                  {settings.preferredGender && settings.preferredGender !== 'any' && (
                    <span className="ow-pref-pill"><Heart size={11} /> Looking for {settings.preferredGender}</span>
                  )}
                </div>
              )}
            </div>

            {/* Checkboxes for Terms & Age Verification */}
            <div className="ow-agreements-group">
              <label className="ow-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={ageAgreed} 
                  onChange={(e) => setAgeAgreed(e.target.checked)} 
                  className="ow-checkbox"
                />
                <span>I am 18 or older (or 13+ with parental consent).</span>
              </label>

              <label className="ow-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={termsAgreed} 
                  onChange={(e) => setTermsAgreed(e.target.checked)} 
                  className="ow-checkbox"
                />
                <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> &amp; <a href="/safety" target="_blank" rel="noreferrer">Community Rules</a>.</span>
              </label>
            </div>

            {showWarningToast && (
              <div className="ow-warning-toast" role="alert">
                Please agree to the age and terms checkboxes to begin chatting.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── SEO Rich Content & Feature Cards ────────────────── */}
      <section className="ow-seo-container">
        <div className="ow-seo-inner">
          <h2 className="ow-seo-section-title">What is Omegle? The Free Online Stranger Chat Alternative</h2>
          <p>
            Omeagle is a modern, high-performance <strong>Omegle alternative</strong> that brings back the simplicity of the original Omegle with instant, one-click <strong>video chat with strangers</strong> and anonymous <strong>text chat</strong>. With peer-to-peer WebRTC technology, end-to-end encrypted connections, and zero sign-up required, you can connect with friendly people worldwide in milliseconds.
          </p>

          {/* Key Platform Highlights */}
          <div className="ow-features-grid">
            <div className="ow-feature-card">
              <div className="ow-feature-icon-box">
                <Video size={24} />
              </div>
              <div className="ow-feature-info">
                <h3>100% Free Live Video Chat</h3>
                <p>High-definition camera-to-camera video chat with strangers across the globe. No subscriptions or hidden fees.</p>
              </div>
            </div>

            <div className="ow-feature-card">
              <div className="ow-feature-icon-box">
                <MessageSquare size={24} />
              </div>
              <div className="ow-feature-info">
                <h3>Anonymous Text Chat</h3>
                <p>Enjoy private, camera-free text conversations with strangers. Perfect for low bandwidth or quick conversations.</p>
              </div>
            </div>

            <div className="ow-feature-card">
              <div className="ow-feature-icon-box">
                <Tag size={24} />
              </div>
              <div className="ow-feature-info">
                <h3>Interest-Based Matching</h3>
                <p>Add common topics like anime, gaming, or travel to get paired with someone who shares your exact hobbies.</p>
              </div>
            </div>

            <div className="ow-feature-card">
              <div className="ow-feature-icon-box">
                <Shield size={24} />
              </div>
              <div className="ow-feature-info">
                <h3>AI Shield &amp; Safe Moderation</h3>
                <p>24/7 client-side content moderation and one-click user reporting ensure a respectful, safe environment.</p>
              </div>
            </div>
          </div>

          {/* Omegle Comparison Table */}
          <h2 className="ow-seo-section-title">Omegle vs Alternatives in 2026</h2>
          <div className="ow-table-wrapper">
            <table className="ow-comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="ow-table-active-col">Omeagle (2026)</th>
                  <th>Omegle Legacy</th>
                  <th>Chatroulette</th>
                  <th>OmeTV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>100% Free Without Coins</td>
                  <td className="ow-table-active-col">✅ Yes (Unlimited)</td>
                  <td>✅ Yes</td>
                  <td>⚠️ Limited Coins</td>
                  <td>⚠️ Limited Coins</td>
                </tr>
                <tr>
                  <td>No Registration / No Sign-up</td>
                  <td className="ow-table-active-col">✅ Instant Access</td>
                  <td>✅ Instant Access</td>
                  <td>❌ Requires Account</td>
                  <td>❌ Requires Account</td>
                </tr>
                <tr>
                  <td>Interest Matching</td>
                  <td className="ow-table-active-col">✅ Real-Time Tag Filtering</td>
                  <td>✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>Real-Time AI Moderation</td>
                  <td className="ow-table-active-col">✅ Advanced Client AI</td>
                  <td>❌ None</td>
                  <td>⚠️ Basic</td>
                  <td>⚠️ Basic</td>
                </tr>
                <tr>
                  <td>Ultra-Fast WebRTC P2P Video</td>
                  <td className="ow-table-active-col">✅ HD 60fps Low Latency</td>
                  <td>⚠️ SD 240p</td>
                  <td>✅ HD</td>
                  <td>✅ HD</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Regional Hubs & Languages */}
          <h2 className="ow-seo-section-title">Talk to Strangers Worldwide</h2>
          <p>Choose your preferred language hub or explore global conversations:</p>
          <div className="ow-lang-chips-grid">
            <a href="/hi" className="ow-lang-chip">🇮🇳 हिन्दी (Hindi)</a>
            <a href="/bn" className="ow-lang-chip">🇧🇩 বাংলা (Bengali)</a>
            <a href="/ta" className="ow-lang-chip">🇮🇳 தமிழ் (Tamil)</a>
            <a href="/te" className="ow-lang-chip">🇮🇳 తెలుగు (Telugu)</a>
            <a href="/mr" className="ow-lang-chip">🇮🇳 मराठी (Marathi)</a>
            <a href="/gu" className="ow-lang-chip">🇮🇳 ગુજરાતી (Gujarati)</a>
            <a href="/kn" className="ow-lang-chip">🇮🇳 ಕನ್ನಡ (Kannada)</a>
            <a href="/ml" className="ow-lang-chip">🇮🇳 മലയാളം (Malayalam)</a>
            <a href="/pa" className="ow-lang-chip">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</a>
            <a href="/ur" className="ow-lang-chip">🇵🇰 اردو (Urdu)</a>
            <a href="/ar" className="ow-lang-chip">🇦🇪 العربية (Arabic)</a>
            <a href="/chat/india" className="ow-lang-chip">🇮🇳 India Hub</a>
          </div>
        </div>
      </section>

      {/* ── OmegleWeb Exact Component Styles ─────────────────── */}
      <style>{`
        .ow-landing-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          min-height: calc(100vh - 64px);
          min-height: calc(100dvh - 64px);
          padding: 1.5rem 1rem 3rem;
        }

        .ow-hero-container {
          display: grid;
          grid-template-columns: minmax(320px, 1.15fr) minmax(340px, 1fr);
          gap: 2rem;
          max-width: 1180px;
          width: 100%;
          margin: 1rem auto 2.5rem;
          align-items: stretch;
        }

        /* ── Left Column ────────────────────────────────────── */
        .ow-hero-left {
          display: flex;
          flex-direction: column;
        }

        .ow-intro-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2.25rem 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .ow-main-heading {
          font-size: 2.75rem;
          line-height: 1.15;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }

        .ow-intro-paragraph {
          font-size: 1.08rem;
          line-height: 1.65;
          color: var(--text-secondary);
        }

        .ow-intro-paragraph strong {
          color: var(--brand-blue);
          font-weight: 700;
        }

        .ow-mobile-note-box {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.15rem 1.25rem;
        }

        .ow-mobile-note-icon {
          color: var(--brand-blue);
          background: var(--brand-blue-light);
          padding: 0.6rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ow-mobile-note-text strong {
          display: block;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .ow-mobile-note-text p {
          font-size: 0.86rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }

        .ow-guidelines-box {
          background: rgba(239, 68, 68, 0.05);
          border: 1px dashed rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          padding: 0.9rem 1.1rem;
        }

        .ow-guidelines-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--status-red);
          margin-bottom: 0.25rem;
        }

        .ow-guidelines-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.45;
        }

        /* ── Right Column (Action Card) ─────────────────────── */
        .ow-hero-right {
          display: flex;
          flex-direction: column;
        }

        .ow-action-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
          box-shadow: var(--shadow-md);
          position: relative;
        }

        .ow-action-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ow-start-label {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .ow-online-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .ow-online-pill.ow-pulse {
          transform: scale(1.04);
          border-color: var(--status-green);
        }

        .ow-green-dot {
          width: 8px;
          height: 8px;
          background-color: var(--status-green);
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.8);
        }

        /* CTA Buttons */
        .ow-cta-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .ow-btn-mode {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.4rem 1rem;
          border-radius: var(--radius-lg);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          gap: 0.6rem;
          user-select: none;
        }

        .ow-btn-text {
          background: var(--bg-surface-secondary);
          border-color: var(--border-color);
          color: var(--text-primary);
        }

        .ow-btn-text:hover {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .ow-btn-text .ow-btn-icon-wrap {
          color: var(--brand-blue);
        }

        .ow-btn-video {
          background: var(--brand-gradient, linear-gradient(135deg, #0066FF 0%, #0052CC 100%));
          color: #ffffff;
          box-shadow: 0 8px 24px -4px rgba(0, 102, 255, 0.4);
        }

        .ow-btn-video:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(0, 102, 255, 0.55);
          filter: brightness(1.06);
        }

        .ow-btn-video:active, .ow-btn-text:active {
          transform: scale(0.98);
        }

        .ow-btn-title {
          font-size: 1.4rem;
          font-weight: 800;
          display: block;
          line-height: 1.1;
        }

        .ow-btn-subtitle {
          font-size: 0.8rem;
          opacity: 0.85;
          font-weight: 600;
          display: block;
          margin-top: 0.2rem;
        }

        /* Interest Matching */
        .ow-interests-box {
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ow-interests-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ow-optional-badge {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .ow-interest-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.35rem 0.5rem 0.35rem 0.85rem;
          transition: border-color 0.2s;
        }

        .ow-interest-input-wrap:focus-within {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px var(--brand-blue-light);
        }

        .ow-interest-input {
          border: none;
          background: none;
          outline: none;
          font-size: 0.92rem;
          color: var(--text-primary);
          width: 100%;
        }

        .ow-add-tag-btn {
          background: var(--brand-blue);
          color: #ffffff;
          border-radius: var(--radius-sm);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }

        .ow-add-tag-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ow-active-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .ow-interest-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .ow-chip-remove {
          background: none;
          border: none;
          color: var(--brand-blue);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          opacity: 0.7;
        }

        .ow-chip-remove:hover {
          opacity: 1;
        }

        .ow-suggested-tags {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 0.25rem;
        }

        .ow-suggested-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .ow-suggested-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .ow-suggested-chip {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 0.2rem 0.55rem;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .ow-suggested-chip:hover {
          border-color: var(--brand-blue);
          color: var(--brand-blue);
        }

        .ow-suggested-chip.active {
          background: var(--brand-blue-light);
          border-color: var(--brand-blue);
          color: var(--brand-blue);
        }

        /* Matching Preferences Button */
        .ow-prefs-trigger-bar {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .ow-prefs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-surface-secondary);
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ow-prefs-btn:hover {
          border-color: var(--brand-blue);
          color: var(--brand-blue);
          background: var(--brand-blue-light);
        }

        .ow-prefs-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          justify-content: center;
        }

        .ow-pref-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.2rem 0.55rem;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* Checkboxes */
        .ow-agreements-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.9rem;
        }

        .ow-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
          line-height: 1.4;
        }

        .ow-checkbox {
          accent-color: var(--brand-blue);
          width: 16px;
          height: 16px;
          margin-top: 0.1rem;
          flex-shrink: 0;
        }

        .ow-checkbox-label a {
          color: var(--brand-blue);
          text-decoration: underline;
        }

        .ow-warning-toast {
          background: var(--status-red);
          color: #ffffff;
          padding: 0.65rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.84rem;
          font-weight: 600;
          text-align: center;
          animation: slideUp 0.2s ease;
        }

        /* ── SEO Section ────────────────────────────────────── */
        .ow-seo-container {
          max-width: 1180px;
          width: 100%;
          border-top: 1px solid var(--border-color);
          padding-top: 3.5rem;
          margin-top: 1.5rem;
        }

        .ow-seo-inner {
          line-height: 1.7;
        }

        .ow-seo-section-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .ow-seo-section-title:first-child {
          margin-top: 0;
        }

        .ow-seo-inner p {
          font-size: 1.02rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .ow-features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          margin: 2rem 0;
        }

        .ow-feature-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.4rem;
          box-shadow: var(--shadow-sm);
        }

        .ow-feature-icon-box {
          color: var(--brand-blue);
          background: var(--brand-blue-light);
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ow-feature-info h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .ow-feature-info p {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }

        /* Comparison Table */
        .ow-table-wrapper {
          overflow-x: auto;
          margin: 1.5rem 0 2.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .ow-comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.92rem;
          min-width: 550px;
        }

        .ow-comparison-table th, .ow-comparison-table td {
          padding: 0.85rem 1.15rem;
          text-align: center;
          border-bottom: 1px solid var(--border-color);
        }

        .ow-comparison-table th {
          background: var(--bg-surface-secondary);
          font-weight: 700;
          color: var(--text-primary);
        }

        .ow-comparison-table th:first-child, .ow-comparison-table td:first-child {
          text-align: left;
          font-weight: 600;
        }

        .ow-comparison-table .ow-table-active-col {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          font-weight: 700;
        }

        .ow-comparison-table th.ow-table-active-col {
          background: var(--brand-blue);
          color: #ffffff;
        }

        .ow-lang-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .ow-lang-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.45rem 0.9rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.15s;
        }

        .ow-lang-chip:hover {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }

        /* ── Responsive Media Queries ───────────────────────── */
        @media (max-width: 960px) {
          .ow-hero-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .ow-main-heading {
            font-size: 2.2rem;
          }

          .ow-features-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .ow-landing-wrapper {
            padding: 1rem 0.75rem 2rem;
          }

          .ow-action-card, .ow-intro-card {
            padding: 1.5rem 1.15rem;
          }

          .ow-cta-row {
            grid-template-columns: 1fr;
          }

          .ow-main-heading {
            font-size: 1.85rem;
          }
        }
      `}</style>
    </div>
  );
};
