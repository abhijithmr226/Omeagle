import React, { useState, useEffect, useRef } from 'react';
import { Video, MessageSquare, Settings2, Globe, Tag, Heart, Shield, Plus, X, Check, Smartphone, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(settings.interests || []);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (settings.interests) {
      setInterests(settings.interests);
    }
  }, [settings.interests]);

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

  const hasPrefs = settings.country || settings.gender || interests.length > 0 || settings.preferredGender;

  const faqs = [
    {
      q: "Wait, is this actually free?",
      tag: "Text Chat Service",
      a: "Yup, 100% free! No credit card, no subscription BS, no 'free trial' that charges you later. Just pure random chat vibes whenever you want."
    },
    {
      q: "How's this different from the OG Omegle?",
      tag: "Omegle 2.0",
      a: "We basically took everything cool about Omegle and made it way better: matching based on interests, works great on mobile, and way less sketch overall. Think Omegle 2.0 but actually not terrible."
    },
    {
      q: "Is it safe tho? Like actually safe?",
      tag: "AI Moderation",
      a: "For real - we have AI + human mods working 24/7 to kick creeps and bots. Still anonymous, but not a total lawless wasteland like the old days. Report buttons actually work here."
    },
    {
      q: "Do I need to download an app?",
      tag: "No Download",
      a: "Nope! Works right in your browser on phone, tablet, or laptop. No app store downloads, no permissions drama. Just open and start chatting."
    }
  ];

  return (
    <div className="ow-landing-container">
      {/* ── Main White Container Box ────────────────────────── */}
      <div className="ow-main-card">
        {/* Top Mobile App Note */}
        <div className="ow-mobile-note-banner">
          <span>You don't need an app to use Omegle on your <a href="#mobile">phone</a> or tablet! The web site works great on <a href="#mobile">mobile</a>.</span>
        </div>

        {/* Main Title & Intro Paragraph */}
        <h1 className="ow-card-title">Omegle - Talk to Strangers</h1>

        <p className="ow-card-description">
          Welcome to <strong>Omegle Web</strong> - resurrected from the legendary Omegle by a group of college kids who believed the magic of random connections shouldn't end. We've brought back the <strong>anonymous, free spirit</strong> of the original Omegle, but with modern safety features. Connect instantly through <strong>random video chat</strong> or text chat - completely free, no registration, staying true to Omegle's roots while being a <strong>safer, monitored space</strong> for genuine conversations.
        </p>

        {/* Monitored Clean Banner Pill */}
        <div className="ow-monitored-pill">
          <span>Chats are monitored. Keep it clean ❗</span>
        </div>

        {/* ── Action Section: Interests & Start Buttons ─────── */}
        <div className="ow-action-dock">
          {/* Left: What do you wanna talk about? */}
          <div className="ow-interest-column">
            <label htmlFor="landing-interest-input" className="ow-section-label">
              What do you wanna talk about?
            </label>

            <div className="ow-input-wrapper">
              <input
                id="landing-interest-input"
                type="text"
                className="ow-real-input"
                placeholder="Add your interests (optional)"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleInterestKeyDown}
              />
              {interestInput.trim() && (
                <button
                  type="button"
                  className="ow-input-add-btn"
                  onClick={() => handleAddInterest(interestInput)}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Active User Interest Chips */}
            {interests.length > 0 && (
              <div className="ow-active-chips-wrap">
                {interests.map((tag) => (
                  <span key={tag} className="ow-active-tag">
                    #{tag}
                    <button 
                      type="button" 
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
            <div className="ow-popular-suggestions">
              <span className="ow-popular-label">Popular:</span>
              {POPULAR_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`ow-popular-chip ${interests.includes(tag) ? 'selected' : ''}`}
                  onClick={() => interests.includes(tag) ? handleRemoveInterest(tag) : handleAddInterest(tag)}
                >
                  {interests.includes(tag) ? '✓' : '+'} {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Start chatting buttons */}
          <div className="ow-start-column">
            <span className="ow-section-label">Start chatting:</span>

            <div className="ow-btn-group">
              <button 
                type="button" 
                className="ow-primary-btn" 
                onClick={() => onStartChat('text')}
                title="Start Anonymous Text Chat"
              >
                Text
              </button>

              <span className="ow-btn-separator">or</span>

              <button 
                type="button" 
                className="ow-primary-btn" 
                onClick={() => onStartChat('video')}
                title="Start Live Random Video Chat"
              >
                Video
              </button>

              <span className="ow-btn-separator">/</span>

              <button 
                type="button" 
                className="ow-unmonitored-btn" 
                onClick={() => onStartChat('video')}
                title="Start Video Chat (Unmonitored Section)"
              >
                <span>Video</span>
                <span className="ow-btn-subtext">(Unmonitored)</span>
              </button>
            </div>

            {/* Matching Preferences Trigger */}
            <div className="ow-prefs-bar">
              <button type="button" className="ow-filter-link-btn" onClick={onOpenPrefs}>
                <Settings2 size={14} />
                <span>{hasPrefs ? 'Edit Country & Gender Filters' : 'Set Matching Filters'}</span>
              </button>

              {hasPrefs && (
                <div className="ow-prefs-chips">
                  {settings.country && (
                    <span className="ow-filter-chip"><Globe size={11} /> {getFlag(settings.country)} {settings.country}</span>
                  )}
                  {settings.gender && (
                    <span className="ow-filter-chip">
                      {settings.gender === 'male' ? '♂ Male' : settings.gender === 'female' ? '♀ Female' : '⚧ Other'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FAQ Accordion Section ───────────────────────────── */}
        <div className="ow-faq-section">
          <h2 className="ow-faq-heading">▼ Frequently Asked Questions (FAQs)</h2>

          <div className="ow-faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="ow-faq-item">
                <div 
                  className="ow-faq-question-row" 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="ow-faq-q-text">{faq.q}</span>
                  <span className="ow-faq-tag-badge">{faq.tag}</span>
                  {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {openFaq === idx && (
                  <p className="ow-faq-answer">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Regional Language Hubs ──────────────────────────── */}
        <div className="ow-lang-hubs-section">
          <h3 className="ow-lang-heading">Regional Language Hubs &amp; Global Chat</h3>
          <div className="ow-lang-chips-row">
            <a href="/hi" className="ow-lang-pill">🇮🇳 हिन्दी (Hindi)</a>
            <a href="/bn" className="ow-lang-pill">🇧🇩 বাংলা (Bengali)</a>
            <a href="/ta" className="ow-lang-pill">🇮🇳 தமிழ் (Tamil)</a>
            <a href="/te" className="ow-lang-pill">🇮🇳 తెలుగు (Telugu)</a>
            <a href="/mr" className="ow-lang-pill">🇮🇳 मराठी (Marathi)</a>
            <a href="/gu" className="ow-lang-pill">🇮🇳 ગુજરાતી (Gujarati)</a>
            <a href="/ur" className="ow-lang-pill">🇵🇰 اردو (Urdu)</a>
            <a href="/ar" className="ow-lang-pill">🇦🇪 العربية (Arabic)</a>
            <a href="/chat/india" className="ow-lang-pill">🇮🇳 India Hub</a>
          </div>
        </div>
      </div>

      {/* ── Exact OmegleWeb.io CSS Rules ──────────────────────── */}
      <style>{`
        .ow-landing-container {
          width: 100%;
          min-height: calc(100vh - 60px);
          min-height: calc(100dvh - 60px);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem 3rem;
          background: #ffffff;
        }

        [data-theme='dark'] .ow-landing-container {
          background: #0f172a;
        }

        .ow-main-card {
          max-width: 1160px;
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          padding: 2rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Mobile Note Link */
        .ow-mobile-note-banner {
          text-align: center;
          font-size: 0.95rem;
          color: #222222;
          font-weight: 500;
          padding-bottom: 0.5rem;
        }

        [data-theme='dark'] .ow-mobile-note-banner {
          color: #cbd5e1;
        }

        .ow-mobile-note-banner a {
          color: var(--brand-blue);
          font-weight: 700;
          text-decoration: underline;
        }

        /* Title & Description */
        .ow-card-title {
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ow-card-description {
          font-size: 1.05rem;
          line-height: 1.65;
          color: var(--text-secondary);
          margin: 0;
        }

        .ow-card-description strong {
          color: var(--text-primary);
          font-weight: 700;
        }

        /* Monitored Clean Banner Pill */
        .ow-monitored-pill {
          background: var(--monitored-bg);
          border: 1px solid var(--monitored-border);
          border-radius: 6px;
          padding: 0.65rem 1.5rem;
          text-align: center;
          margin: 0.5rem auto 1rem;
          max-width: 480px;
          width: 100%;
        }

        .ow-monitored-pill span {
          font-size: 1.15rem;
          font-weight: 800;
          color: #000000;
          letter-spacing: -0.01em;
        }

        /* Action Dock (Two Columns) */
        .ow-action-dock {
          display: grid;
          grid-template-columns: minmax(320px, 1.2fr) minmax(340px, 1fr);
          gap: 2rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
          align-items: start;
        }

        .ow-interest-column,
        .ow-start-column {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .ow-section-label {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Input Field */
        .ow-input-wrapper {
          display: flex;
          align-items: center;
          background: #fafcff;
          border: 1px solid var(--border-color-input);
          border-radius: 4px;
          padding: 0.2rem 0.4rem 0.2rem 0.85rem;
          height: 44px;
          transition: border-color 0.2s;
        }

        [data-theme='dark'] .ow-input-wrapper {
          background: #1e293b;
        }

        .ow-input-wrapper:focus-within {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 2px var(--brand-blue-light);
        }

        .ow-real-input {
          border: none;
          background: none;
          outline: none;
          font-size: 1rem;
          color: var(--text-primary);
          width: 100%;
        }

        .ow-real-input::placeholder {
          color: #94a3b8;
        }

        .ow-input-add-btn {
          background: var(--brand-blue);
          color: #ffffff;
          border: none;
          border-radius: 3px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .ow-active-chips-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .ow-active-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
        }

        .ow-active-tag button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          display: flex;
          padding: 0;
        }

        .ow-popular-suggestions {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
          padding-top: 0.2rem;
        }

        .ow-popular-label {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .ow-popular-chip {
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          padding: 0.15rem 0.55rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s;
        }

        .ow-popular-chip:hover {
          border-color: var(--brand-blue);
          color: var(--brand-blue);
        }

        .ow-popular-chip.selected {
          background: var(--brand-blue-light);
          border-color: var(--brand-blue);
          color: var(--brand-blue);
        }

        /* Buttons Group (Text, Video, Video Unmonitored) */
        .ow-btn-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .ow-primary-btn {
          background: var(--omegle-blue-gradient);
          border: 1px solid #1a6ecf;
          color: #ffffff;
          font-size: 1.15rem;
          font-weight: 700;
          padding: 0.65rem 1.65rem;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          transition: transform 0.1s, filter 0.15s;
          user-select: none;
        }

        .ow-primary-btn:hover {
          background: var(--omegle-blue-gradient-hover);
          transform: translateY(-1px);
        }

        .ow-primary-btn:active {
          transform: scale(0.97);
        }

        .ow-unmonitored-btn {
          background: linear-gradient(180deg, #5ba3f5 0%, #3e8ee6 100%);
          border: 1px solid #2e7cd4;
          color: #ffffff;
          padding: 0.45rem 1rem;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        .ow-unmonitored-btn:hover {
          filter: brightness(1.06);
        }

        .ow-unmonitored-btn span {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .ow-btn-subtext {
          font-size: 0.68rem;
          opacity: 0.9;
        }

        .ow-btn-separator {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .ow-prefs-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          padding-top: 0.35rem;
        }

        .ow-filter-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .ow-filter-link-btn:hover {
          color: var(--brand-blue);
          border-color: var(--brand-blue);
        }

        .ow-prefs-chips {
          display: flex;
          gap: 0.35rem;
        }

        .ow-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* FAQs */
        .ow-faq-section {
          border-top: 1px solid var(--border-color);
          padding-top: 1.75rem;
          margin-top: 0.5rem;
        }

        .ow-faq-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .ow-faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .ow-faq-item {
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.75rem 1rem;
        }

        .ow-faq-question-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.96rem;
          color: var(--text-primary);
        }

        .ow-faq-tag-badge {
          background: var(--brand-blue-light);
          color: var(--brand-blue);
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          margin-left: auto;
          margin-right: 0.75rem;
        }

        .ow-faq-answer {
          font-size: 0.92rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        /* Regional Language Hubs */
        .ow-lang-hubs-section {
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .ow-lang-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .ow-lang-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .ow-lang-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          background: var(--bg-surface-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-full);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.15s;
        }

        .ow-lang-pill:hover {
          border-color: var(--brand-blue);
          background: var(--brand-blue-light);
          color: var(--brand-blue);
        }

        @media (max-width: 840px) {
          .ow-action-dock {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .ow-main-card {
            padding: 1.5rem 1.15rem;
          }

          .ow-card-title {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};
