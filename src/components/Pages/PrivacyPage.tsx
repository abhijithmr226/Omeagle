import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, Database, Cookie, Shield, Globe, Mail } from 'lucide-react';

interface PrivacyPageProps { onBack: () => void; }

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => (
  <div className="page-container policy-page">
    <button className="back-btn" onClick={onBack}>
      <ArrowLeft size={18} /> Back
    </button>

    <header className="policy-header">
      <Lock size={36} className="policy-icon" />
      <h1>Privacy Policy</h1>
      <p className="policy-meta"><em>Last updated: July 21, 2026</em></p>
      <p className="policy-subtitle">
        Omeagle is built on a foundation of anonymity and privacy. This policy explains exactly what
        data we collect, what we do with it, and how we protect you.
      </p>
    </header>

    <nav className="policy-toc">
      <h2>Contents</h2>
      <ol>
        <li><a href="#overview">Overview</a></li>
        <li><a href="#data-collected">Data We Collect</a></li>
        <li><a href="#data-not-collected">Data We Do NOT Collect</a></li>
        <li><a href="#how-used">How We Use Information</a></li>
        <li><a href="#webrtc">WebRTC &amp; Peer-to-Peer Video</a></li>
        <li><a href="#cookies">Cookies &amp; Local Storage</a></li>
        <li><a href="#third-party">Third-Party Services</a></li>
        <li><a href="#data-retention">Data Retention</a></li>
        <li><a href="#childrens">Children's Privacy</a></li>
        <li><a href="#your-rights">Your Rights</a></li>
        <li><a href="#changes">Changes to This Policy</a></li>
        <li><a href="#contact">Contact</a></li>
      </ol>
    </nav>

    <section id="overview" className="policy-section">
      <h2><Eye size={20} /> Overview</h2>
      <p>
        Omeagle is designed from the ground up for <strong>anonymous use</strong>. We do not require
        accounts, email addresses, or any personal identification to use the platform. Our philosophy
        is simple: collect as little data as possible, retain it for as short a time as possible, and
        never sell it to anyone.
      </p>
      <div className="policy-highlight">
        <Shield size={18} />
        <p><strong>Short version:</strong> We do not know who you are, and we like it that way.</p>
      </div>
    </section>

    <section id="data-collected" className="policy-section">
      <h2><Database size={20} /> Data We Collect</h2>
      <p>When you use Omeagle, the following minimal data may be processed:</p>
      <ul>
        <li>
          <strong>Anonymous session identifiers</strong> — A temporary, randomly generated UUID is
          created per browser session for matchmaking purposes. This ID is not linked to your identity
          and is discarded when your session ends.
        </li>
        <li>
          <strong>Connection logs</strong> — Basic server-side logs (timestamps of connections) for
          debugging and reliability. These logs do not contain your IP address in identifiable form
          and are deleted within 7 days.
        </li>
        <li>
          <strong>Anonymous analytics</strong> — Aggregate usage data via Google Analytics (GA4) and
          Google Tag Manager — page views, session duration, and device type. No personally
          identifiable information is collected. You can opt out via Google's opt-out browser add-on.
        </li>
        <li>
          <strong>Chat preferences</strong> — Country, gender, and interest preferences you set are
          stored only in your browser's <code>localStorage</code>. They never leave your device to
          our servers in identifiable form.
        </li>
        <li>
          <strong>Report data</strong> — If you submit a report against a user, we log the anonymous
          session IDs of both parties and the reason for the report, for moderation purposes.
        </li>
      </ul>
    </section>

    <section id="data-not-collected" className="policy-section">
      <h2>Data We Do NOT Collect</h2>
      <div className="policy-no-collect">
        <div className="no-collect-item">❌ Your real name</div>
        <div className="no-collect-item">❌ Email address</div>
        <div className="no-collect-item">❌ Phone number</div>
        <div className="no-collect-item">❌ Physical address</div>
        <div className="no-collect-item">❌ Video or audio recordings</div>
        <div className="no-collect-item">❌ Text chat message content</div>
        <div className="no-collect-item">❌ Precise GPS location</div>
        <div className="no-collect-item">❌ Credit card or payment information</div>
        <div className="no-collect-item">❌ Social media profiles</div>
        <div className="no-collect-item">❌ Biometric data</div>
      </div>
    </section>

    <section id="how-used" className="policy-section">
      <h2>How We Use Information</h2>
      <p>The minimal data we do collect is used exclusively for:</p>
      <ul>
        <li><strong>Matchmaking</strong> — Pairing you with another available user based on your preferences</li>
        <li><strong>Platform reliability</strong> — Diagnosing connection issues and improving performance</li>
        <li><strong>Moderation</strong> — Investigating and acting on community reports</li>
        <li><strong>Analytics</strong> — Understanding aggregate usage patterns to improve the product</li>
      </ul>
      <p>We do <strong>not</strong> use your data for advertising profiling, sell it to data brokers, or share it with third parties for marketing purposes.</p>
    </section>

    <section id="webrtc" className="policy-section">
      <h2>WebRTC &amp; Peer-to-Peer Video</h2>
      <p>
        All video and audio communication on Omeagle uses <strong>WebRTC (Web Real-Time Communication)</strong>.
        This means your video and audio stream travels <strong>directly between your device and your
        chat partner's device</strong>, peer-to-peer. Omeagle's servers are not a relay for your video
        data and do not have access to your video or audio in any form.
      </p>
      <p>
        To establish the peer-to-peer connection, WebRTC uses <strong>STUN servers</strong> (provided by
        Google) to discover your network address. These STUN servers only see your IP address during
        the connection setup phase — they do not see your video or audio, and they do not store your
        IP address permanently.
      </p>
    </section>

    <section id="cookies" className="policy-section">
      <h2><Cookie size={20} /> Cookies &amp; Local Storage</h2>
      <p>Omeagle uses minimal browser storage:</p>
      <ul>
        <li>
          <strong>sessionStorage</strong> — Stores your age verification confirmation for the current
          browser tab only. Cleared when you close the tab.
        </li>
        <li>
          <strong>localStorage</strong> — Stores your chat preferences (country, gender, interests,
          theme). This data never leaves your device.
        </li>
        <li>
          <strong>Google Analytics cookies</strong> — Used to measure aggregate site traffic. You can
          opt out via <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google's opt-out add-on</a>.
        </li>
      </ul>
      <p>We do not use advertising tracking cookies or third-party retargeting pixels.</p>
    </section>

    <section id="third-party" className="policy-section">
      <h2><Globe size={20} /> Third-Party Services</h2>
      <p>Omeagle uses the following third-party services. Each has its own privacy policy:</p>
      <ul>
        <li>
          <strong>Supabase</strong> — Backend infrastructure for matchmaking queues and signaling.
          Data is processed under Supabase's <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </li>
        <li>
          <strong>Google STUN Servers</strong> — Used for WebRTC connection setup. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </li>
        <li>
          <strong>Google Analytics / GTM</strong> — Aggregate, anonymized traffic analytics. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>.
        </li>
        <li>
          <strong>Vercel</strong> — Hosting and CDN. May log standard web server request metadata. See <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>.
        </li>
      </ul>
    </section>

    <section id="data-retention" className="policy-section">
      <h2>Data Retention</h2>
      <ul>
        <li><strong>Session IDs</strong> — Deleted immediately when you disconnect or your session expires</li>
        <li><strong>Connection logs</strong> — Deleted within 7 days</li>
        <li><strong>Report data</strong> — Retained for up to 90 days for moderation review, then deleted</li>
        <li><strong>Analytics data</strong> — Retained by Google Analytics per their standard data retention settings (14 months by default)</li>
      </ul>
    </section>

    <section id="childrens" className="policy-section">
      <h2>Children's Privacy</h2>
      <p>
        Omeagle is strictly for users who are <strong>18 years of age or older</strong>. We do not
        knowingly collect or process data from users under 18. If you are a parent or guardian and
        believe a minor has used this platform, please <Link to="/contact">contact us</Link> immediately
        and we will take appropriate action.
      </p>
    </section>

    <section id="your-rights" className="policy-section">
      <h2>Your Rights</h2>
      <p>
        Since we do not collect personally identifiable information, there is no data profile linked to
        you that we can retrieve, export, or delete on request. Your anonymous session ID is discarded
        automatically at session end. Your browser-stored preferences can be cleared at any time by
        clearing your browser's site data.
      </p>
      <p>
        If you are in the EU/EEA (GDPR) or California (CCPA), note that anonymous, non-identifiable
        aggregate data falls outside the scope of personal data subject to individual data rights requests.
      </p>
    </section>

    <section id="changes" className="policy-section">
      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with
        an updated "Last updated" date. Continued use of the platform after changes constitutes
        acceptance of the new policy.
      </p>
    </section>

    <section id="contact" className="policy-section">
      <h2><Mail size={20} /> Contact</h2>
      <p>
        For privacy-related inquiries, please visit our <Link to="/contact">Contact page</Link>.
        You can also read our <Link to="/safety">Safety Guide</Link> and{' '}
        <Link to="/terms">Terms of Service</Link> for related information.
      </p>
    </section>

    <style>{`
      .policy-page { max-width: 820px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
      .back-btn { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 0.5rem 1rem; margin-bottom: 1.5rem; transition: all 0.2s; }
      .back-btn:hover { color: var(--brand-blue); border-color: var(--brand-blue); background: var(--brand-blue-light); }
      .policy-header { margin-bottom: 2rem; }
      .policy-icon { color: var(--brand-blue); margin-bottom: 0.75rem; }
      .policy-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.25rem; }
      .policy-meta { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.75rem; }
      .policy-subtitle { font-size: 1.1rem; color: var(--text-secondary); line-height: 1.65; }
      .policy-toc { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 2.5rem; }
      .policy-toc h2 { font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      .policy-toc ol { padding-left: 1.25rem; columns: 2; column-gap: 2rem; }
      .policy-toc li { font-size: 0.9rem; margin-bottom: 0.35rem; break-inside: avoid; }
      .policy-toc a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
      .policy-toc a:hover { text-decoration: underline; }
      .policy-section { margin-bottom: 2.5rem; padding-top: 0.5rem; }
      .policy-section h2 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; }
      .policy-section h2 svg { color: var(--brand-blue); flex-shrink: 0; }
      .policy-section p { line-height: 1.75; color: var(--text-secondary); font-size: 1rem; margin-bottom: 0.9rem; }
      .policy-section p strong { color: var(--text-primary); }
      .policy-section a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
      .policy-section a:hover { text-decoration: underline; }
      .policy-section ul { padding-left: 1.5rem; margin-bottom: 1rem; }
      .policy-section li { margin-bottom: 0.6rem; line-height: 1.7; color: var(--text-secondary); }
      .policy-section li strong { color: var(--text-primary); }
      .policy-section code { background: var(--bg-surface-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
      .policy-highlight { display: flex; align-items: flex-start; gap: 0.75rem; background: var(--brand-blue-light); border: 1px solid rgba(0,102,255,0.15); border-radius: var(--radius-md); padding: 1rem 1.25rem; margin: 1rem 0; }
      .policy-highlight svg { color: var(--brand-blue); flex-shrink: 0; margin-top: 0.1rem; }
      .policy-highlight p { margin: 0; font-size: 0.95rem; }
      .policy-no-collect { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin: 1rem 0; }
      .no-collect-item { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.6rem 1rem; font-size: 0.9rem; color: var(--text-secondary); }
      @media (max-width: 640px) {
        .policy-toc ol { columns: 1; }
        .policy-no-collect { grid-template-columns: 1fr; }
        .policy-header h1 { font-size: 1.75rem; }
      }
    `}</style>
  </div>
);
