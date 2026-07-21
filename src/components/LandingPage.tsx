import React, { useState, useEffect, useRef } from 'react';
import { Video, MessageSquare, Settings2, Globe, Tag, Heart, Shield, Zap, Users, Smartphone } from 'lucide-react';
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
  const [displayCount, setDisplayCount] = useState(onlineCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(onlineCount);

  useEffect(() => {
    if (onlineCount !== prevCountRef.current) {
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

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="highlight-text">Free Video Chat</span> with Strangers —{' '}
            <span className="hero-nosignup">No Sign Up</span>
          </h1>
          <p className="hero-subtitle">
            The best <strong>Omegle alternative</strong> — random video chat and text chat with strangers worldwide. Instant matching, 100% free, no registration ever.
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
          <div className={`online-badge ${isAnimating ? 'pulse' : ''}`}>
            <span className="pulse-dot-green"></span>
            <span><strong>{displayCount.toLocaleString()}</strong> people online now</span>
          </div>
        </div>
      </section>

      <section className="seo-content">
        <div className="seo-inner">
          <h2 className="seo-title">What Is Omeagle? The Best Omegle Alternative</h2>
          <p>
            Omeagle is a <strong>free video chat app</strong> that lets you <strong>talk to strangers</strong> from around the world — instantly and anonymously. As the top <strong>Omegle alternative</strong> (also searched as <em>omeegle</em>, <em>omegale</em>, or <em>omeagle</em>), it offers live random video chat with no registration required. Just open the site, click Start, and you're connected to a random stranger in seconds. It's the easiest way to <strong>video chat without registration</strong>.
          </p>

          <h2 className="seo-title">Free Video Chat App — No Registration Required</h2>
          <p>
            Unlike other random chat apps, Omeagle is <strong>100% free video chat</strong>. There are no coins, no credits, no subscriptions. Every feature — including <strong>Omeagle TV</strong>-style live video matching, text chat, and gender/country filters — is available for free. Start a <strong>video chat link</strong> session with any stranger, anytime, from any device.
          </p>

          <h2 className="seo-title">How to Video Chat with Strangers on Omeagle</h2>
          <p>
            Random <strong>video chat with strangers</strong> on Omeagle works using WebRTC (Web Real-Time Communication). When you click Start Video Chat, your browser requests camera and microphone access. Omeagle's matchmaking system instantly pairs you with a random user based on your preferences. Your video and audio travel peer-to-peer — we never record or store your conversations.
          </p>

          <div className="seo-features">
            <div className="seo-feature">
              <Video size={22} />
              <div>
                <strong>Omeagle TV — Live Video Chat</strong>
                <p>Random live video connections with strangers worldwide. HD quality, ultra-low latency — like Omegle TV but better.</p>
              </div>
            </div>
            <div className="seo-feature">
              <MessageSquare size={22} />
              <div>
                <strong>Free Text Chat — No Sign Up</strong>
                <p>Prefer typing? Text chat mode gives you anonymous random stranger chat without a camera — totally free.</p>
              </div>
            </div>
            <div className="seo-feature">
              <Shield size={22} />
              <div>
                <strong>Safe & Moderated</strong>
                <p>Real-time AI moderation detects and blocks inappropriate behavior before it reaches your screen.</p>
              </div>
            </div>
            <div className="seo-feature">
              <Globe size={22} />
              <div>
                <strong>Talk with People Worldwide</strong>
                <p>Filter by country to meet people from specific regions, or match globally for maximum variety.</p>
              </div>
            </div>
            <div className="seo-feature">
              <Smartphone size={22} />
              <div>
                <strong>Mobile Video Chat App</strong>
                <p>The best mobile <strong>video chat app</strong> — works on any smartphone or tablet, no download needed.</p>
              </div>
            </div>
            <div className="seo-feature">
              <Zap size={22} />
              <div>
                <strong>Instant Matching — Under 3 Seconds</strong>
                <p>Get connected to a random stranger in under 3 seconds. Hit Next to skip and find a new match instantly.</p>
              </div>
            </div>
          </div>

          <h2 className="seo-title">Omeagle vs Other Chat Platforms</h2>
          <p>See how Omeagle compares to other popular random chat alternatives in 2026.</p>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="highlight-col">Omeagle</th>
                  <th>Omegle (Legacy)</th>
                  <th>Chatroulette</th>
                  <th>OmeTV</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Free to Use</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>✅ Yes</td>
                  <td>⚠️ Limited</td>
                  <td>⚠️ Limited</td>
                </tr>
                <tr>
                  <td>No Sign Up Required</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>AI Moderation</td>
                  <td className="highlight-col">✅ Real-time</td>
                  <td>❌ None</td>
                  <td>⚠️ Basic</td>
                  <td>⚠️ Basic</td>
                </tr>
                <tr>
                  <td>Video Chat</td>
                  <td className="highlight-col">✅ HD</td>
                  <td>✅ SD</td>
                  <td>✅ HD</td>
                  <td>✅ HD</td>
                </tr>
                <tr>
                  <td>Text Chat</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>Country Filter</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                  <td>✅ Yes</td>
                </tr>
                <tr>
                  <td>Gender Filter</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                  <td>✅ Yes</td>
                </tr>
                <tr>
                  <td>Interest Matching</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>Mobile Optimized</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>⚠️ Partial</td>
                  <td>⚠️ Partial</td>
                  <td>✅ Yes</td>
                </tr>
                <tr>
                  <td>End-to-End Encryption</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                </tr>
                <tr>
                  <td>18+ Age Gate</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>❌ No</td>
                  <td>❌ No</td>
                  <td>⚠️ Partial</td>
                </tr>
                <tr>
                  <td>Report System</td>
                  <td className="highlight-col">✅ Yes</td>
                  <td>❌ No</td>
                  <td>⚠️ Basic</td>
                  <td>✅ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="seo-title">Why Omeagle Is the Best Omegle Alternative in 2026</h2>
          <p>
            Since Omegle shut down in 2023, millions of users searching for <em>omegle live</em>, <em>omegle video call</em>, <em>omegle free</em>, or <em>omegle chat with strangers</em> have been looking for a reliable replacement. Omeagle fills that gap perfectly — it is <strong>100% free</strong>, <strong>anonymous by design</strong>, and built on modern WebRTC technology. Whether you search for <em>omeegle</em>, <em>omegale</em>, or <em>omeagle</em>, this is where you end up.
          </p>

          <h2 className="seo-title">Video Chat with Strangers — Safely & Anonymously</h2>
          <p>
            Every <strong>video chat with strangers</strong> session on Omeagle is protected by end-to-end encryption, a report &amp; block system, and 24/7 AI-powered content moderation. No personal data is collected. No accounts are required. When you close your browser, your session disappears completely. <strong>Talk with strangers</strong> from any country — all you need is a browser.
          </p>

          <h2 className="seo-title">Start Your Free Video Chat Now</h2>
          <p>
            Thousands of people are online right now ready to chat. Whether you want to make a new friend, practice a language, or just have an interesting conversation, it starts with one click. Choose <strong>Video Chat</strong> for face-to-face or <strong>Text Chat</strong> for anonymous messaging. Set preferences for country, gender, and interests to find your ideal match.
          </p>
        </div>
      </section>
      <style>{`
        .landing-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 64px); min-height: calc(100dvh - 64px); padding: 2rem 1rem; }
        .hero-section { text-align: center; max-width: 600px; width: 100%; }
        .hero-title { font-size: 3.5rem; line-height: 1.15; letter-spacing: -0.02em; margin-bottom: 1rem; color: var(--text-primary); }
        .highlight-text { color: var(--brand-blue); }
        .hero-nosignup { color: var(--text-secondary); font-size: 0.75em; font-weight: 600; white-space: nowrap; }
        .hero-subtitle { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem; }
        .cta-group { display: flex; flex-direction: column; gap: 0.9rem; max-width: 340px; margin: 0 auto; width: 100%; }
        .btn-primary-lg { display: flex; align-items: center; justify-content: center; gap: 0.75rem; background-color: var(--brand-blue); color: #ffffff; padding: 1rem 1.75rem; font-size: 1.1rem; font-weight: 700; border-radius: var(--radius-md); box-shadow: 0 8px 20px -4px rgba(0, 102, 255, 0.4); min-height: 56px; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .btn-primary-lg:active { transform: scale(0.98); }
        .btn-primary-lg:hover { background-color: var(--brand-blue-hover); transform: translateY(-1px); }
        .btn-secondary-lg { display: flex; align-items: center; justify-content: center; gap: 0.75rem; background-color: var(--bg-surface); border: 2px solid var(--brand-blue); color: var(--brand-blue); padding: 0.9rem 1.75rem; font-size: 1.1rem; font-weight: 700; border-radius: var(--radius-md); min-height: 56px; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .btn-secondary-lg:active { background-color: var(--brand-blue-light); }
        .btn-secondary-lg:hover { background-color: var(--brand-blue-light); }
        .prefs-link-btn { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1.25rem; color: var(--text-secondary); font-size: 0.9rem; font-weight: 600; padding: 0.6rem 1rem; border-radius: var(--radius-md); transition: all 0.2s; background: none; border: 1px solid var(--border-color); min-height: 44px; -webkit-tap-highlight-color: transparent; }
        .prefs-link-btn:active { background: var(--brand-blue-light); color: var(--brand-blue); }
        .prefs-link-btn:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: var(--brand-blue-light); }
        .prefs-chips-row { display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; margin-top: 1rem; max-width: 380px; margin-left: auto; margin-right: auto; }
        .pref-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.25rem 0.6rem; background: var(--brand-blue-light); color: var(--brand-blue); border-radius: var(--radius-full); font-size: 0.78rem; font-weight: 600; white-space: nowrap; }
        .pref-icon { font-size: 0.85rem; }
        .online-badge { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2.5rem; padding: 0.6rem 1.2rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 0.95rem; color: var(--text-secondary); transition: transform 0.3s, box-shadow 0.3s; }
        .online-badge.pulse { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 102, 255, 0.3); }
        .seo-content { max-width: 720px; margin: 4rem auto 0; padding: 0 1rem; border-top: 1px solid var(--border-color); padding-top: 3rem; width: 100%; }
        .seo-inner { line-height: 1.75; }
        .seo-title { font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 0.75rem; color: var(--text-primary); }
        .seo-title:first-child { margin-top: 0; }
        .seo-content p { color: var(--text-secondary); font-size: 1.02rem; margin-bottom: 1rem; }
        .seo-content p strong { color: var(--text-primary); }
        .seo-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1.5rem 0; }
        .seo-feature { display: flex; gap: 0.85rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.1rem; transition: border-color 0.2s; }
        .seo-feature:hover { border-color: var(--brand-blue); }
        .seo-feature svg { flex-shrink: 0; color: var(--brand-blue); margin-top: 0.15rem; }
        .seo-feature strong { display: block; font-size: 0.95rem; margin-bottom: 0.25rem; }
        .seo-feature p { font-size: 0.88rem; margin: 0; color: var(--text-muted); line-height: 1.55; }
        .comparison-table-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 1.5rem 0; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
        .comparison-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; min-width: 500px; }
        .comparison-table th, .comparison-table td { padding: 0.75rem 1rem; text-align: center; border-bottom: 1px solid var(--border-color); }
        .comparison-table th { background: var(--bg-surface-secondary); font-weight: 700; color: var(--text-primary); white-space: nowrap; }
        .comparison-table th:first-child, .comparison-table td:first-child { text-align: left; font-weight: 600; color: var(--text-primary); position: sticky; left: 0; background: var(--bg-surface); z-index: 1; }
        .comparison-table th:first-child { background: var(--bg-surface-secondary); }
        .comparison-table td { color: var(--text-secondary); }
        .comparison-table tr:last-child td { border-bottom: none; }
        .comparison-table .highlight-col { background: rgba(0, 102, 255, 0.08); color: var(--brand-blue); font-weight: 700; }
        .comparison-table th.highlight-col { background: var(--brand-blue); color: #fff; }

        @media (max-width: 1024px) {
          .landing-page { min-height: calc(100vh - 56px); min-height: calc(100dvh - 56px); padding: 1.5rem 0.75rem; }
          .hero-title { font-size: 2.2rem; }
          .hero-subtitle { font-size: 1rem; margin-bottom: 1.5rem; }
          .cta-group { gap: 0.75rem; }
          .btn-primary-lg, .btn-secondary-lg { font-size: 1rem; padding: 0.85rem 1.5rem; }
          .online-badge { margin-top: 1.5rem; font-size: 0.88rem; }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 1.9rem; }
          .seo-features { grid-template-columns: 1fr; }
          .seo-title { font-size: 1.3rem; }
          .seo-content { margin-top: 2.5rem; padding-top: 2rem; }
          .seo-feature { padding: 0.9rem; }
        }

        @media (max-width: 380px) {
          .hero-title { font-size: 1.65rem; }
          .hero-subtitle { font-size: 0.92rem; }
        }

        @media (min-height: 800px) and (min-width: 869px) {
          .landing-page { padding-top: 4rem; }
        }
      `}</style>
    </div>
  );
};
