import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Shield, Globe, Users, Heart, Code } from 'lucide-react';

interface AboutPageProps { onBack: () => void; }

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => (
  <div className="page-container about-page">
    <button className="back-btn" onClick={onBack}>
      <ArrowLeft size={18} /> Back
    </button>

    <header className="about-header">
      <h1>About Omeagle</h1>
      <p className="about-subtitle">
        The free, anonymous random video chat platform built for genuine human connection —
        no sign up, no registration, no barriers.
      </p>
    </header>

    <section className="about-section">
      <h2>What Is Omeagle?</h2>
      <p>
        <strong>Omeagle</strong> is a free random video chat and text chat platform that connects you
        instantly with strangers from around the world. Built as the best modern{' '}
        <Link to="/">Omegle alternative</Link>, Omeagle lets you <strong>talk to strangers</strong> anonymously
        via live video chat or text — with no account, no email, and no personal data required.
      </p>
      <p>
        Simply open your browser, click <strong>Start Video Chat</strong> or <strong>Text Chat</strong>,
        and within seconds you are connected to a random person somewhere on the planet. Whether you
        want to make new friends, practice a language, or just have an interesting conversation,
        Omeagle makes it effortless.
      </p>
    </section>

    <section className="about-section">
      <h2>Our Mission</h2>
      <p>
        We believe genuine human connection should be accessible to everyone, everywhere — without
        paywalls, sign-up barriers, or invasive data collection. The original Omegle shut down in
        November 2023, leaving millions of users without a trusted platform for anonymous random chat.
      </p>
      <p>
        Omeagle was built to fill that gap: a modern, safe, and completely free <strong>Omegle alternative</strong>{' '}
        powered by cutting-edge WebRTC technology, real-time AI moderation, and a global matching system
        that connects people across 190+ countries in under 3 seconds.
      </p>
    </section>

    <section className="about-section">
      <h2>How Omeagle Works</h2>
      <div className="about-steps">
        <div className="about-step">
          <div className="step-number">1</div>
          <div>
            <strong>Click Start</strong>
            <p>Choose Video Chat or Text Chat from the home page. No account needed.</p>
          </div>
        </div>
        <div className="about-step">
          <div className="step-number">2</div>
          <div>
            <strong>Grant Camera Access</strong>
            <p>For video mode, allow your browser to use your camera and microphone — one-time, one session.</p>
          </div>
        </div>
        <div className="about-step">
          <div className="step-number">3</div>
          <div>
            <strong>Get Matched Instantly</strong>
            <p>Our matchmaking system pairs you with a random stranger based on your preferences in under 3 seconds.</p>
          </div>
        </div>
        <div className="about-step">
          <div className="step-number">4</div>
          <div>
            <strong>Chat, Skip, Repeat</strong>
            <p>Talk freely. Click Next to find a new stranger. Click Stop when you're done. That's it.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="about-section">
      <h2>Why Choose Omeagle?</h2>
      <div className="about-features">
        <div className="about-feature">
          <Zap size={24} />
          <div>
            <strong>100% Free, Always</strong>
            <p>No coins, no credits, no premium tiers. Every feature is free for every user, forever.</p>
          </div>
        </div>
        <div className="about-feature">
          <Shield size={24} />
          <div>
            <strong>Anonymous by Design</strong>
            <p>No sign up, no profiles, no personal data collected. Your identity stays completely private.</p>
          </div>
        </div>
        <div className="about-feature">
          <Globe size={24} />
          <div>
            <strong>Global Matching</strong>
            <p>Connect with people from 190+ countries. Set country preferences or go fully global.</p>
          </div>
        </div>
        <div className="about-feature">
          <Users size={24} />
          <div>
            <strong>AI-Powered Safety</strong>
            <p>Real-time AI moderation detects and blocks inappropriate content before it reaches your screen.</p>
          </div>
        </div>
        <div className="about-feature">
          <Heart size={24} />
          <div>
            <strong>Interest Matching</strong>
            <p>Add interest tags to be matched with people who share your hobbies and passions.</p>
          </div>
        </div>
        <div className="about-feature">
          <Code size={24} />
          <div>
            <strong>Built on WebRTC</strong>
            <p>Peer-to-peer video and audio. We never store or record your conversations.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="about-section">
      <h2>Platform Features</h2>
      <ul className="about-list">
        <li><strong>Free random video chat</strong> — HD peer-to-peer video, no downloads required</li>
        <li><strong>Text chat with strangers</strong> — anonymous messaging without a camera</li>
        <li><strong>Country filter</strong> — match with users from specific countries or regions</li>
        <li><strong>Gender preference</strong> — set preferred match genders</li>
        <li><strong>Interest tags</strong> — find people who share your hobbies</li>
        <li><strong>Camera flip</strong> — switch between front and rear cameras on mobile</li>
        <li><strong>Report &amp; block</strong> — instantly report or block any user</li>
        <li><strong>Dark &amp; light mode</strong> — choose the interface theme you prefer</li>
        <li><strong>PWA support</strong> — add to your home screen for an app-like experience</li>
        <li><strong>Mobile optimized</strong> — works perfectly on all smartphones and tablets</li>
      </ul>
    </section>

    <section className="about-section">
      <h2>Safety &amp; Privacy</h2>
      <p>
        Safety is not an afterthought on Omeagle — it is built into every layer of the platform.
        All video streams use <strong>WebRTC end-to-end encryption</strong>. We do not record, store,
        or review your conversations. An AI moderation system monitors for policy violations in real-time.
        Every user can report or block any partner instantly.
      </p>
      <p>
        Read our full <Link to="/safety">Safety Guide</Link> and{' '}
        <Link to="/privacy">Privacy Policy</Link> for complete details.
      </p>
    </section>

    <section className="about-section">
      <h2>Links &amp; Resources</h2>
      <div className="about-links">
        <Link to="/safety" className="about-link-card">Safety Guide →</Link>
        <Link to="/privacy" className="about-link-card">Privacy Policy →</Link>
        <Link to="/terms" className="about-link-card">Terms of Service →</Link>
        <Link to="/blog" className="about-link-card">Blog &amp; Guides →</Link>
        <Link to="/contact" className="about-link-card">Contact Us →</Link>
        <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer" className="about-link-card">GitHub →</a>
      </div>
    </section>

    <div className="about-developer">
      <p>Developed with ❤️ by <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">abhijithmr226</a></p>
      <p>
        <a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer">LinkedIn</a>
        {' · '}
        <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">GitHub</a>
      </p>
    </div>

    <style>{`
      .about-page { max-width: 820px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
      .about-header { margin-bottom: 2.5rem; }
      .about-header h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
      .about-subtitle { font-size: 1.15rem; color: var(--text-secondary); line-height: 1.6; }
      .about-section { margin-bottom: 2.5rem; }
      .about-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
      .about-section p { line-height: 1.75; color: var(--text-secondary); font-size: 1.02rem; margin-bottom: 1rem; }
      .about-section p strong { color: var(--text-primary); }
      .about-section a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
      .about-section a:hover { text-decoration: underline; }
      .about-steps { display: flex; flex-direction: column; gap: 1rem; }
      .about-step { display: flex; gap: 1rem; align-items: flex-start; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; }
      .step-number { width: 2rem; height: 2rem; min-width: 2rem; background: var(--brand-blue); color: #fff; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; }
      .about-step strong { display: block; margin-bottom: 0.25rem; color: var(--text-primary); }
      .about-step p { margin: 0; font-size: 0.92rem; color: var(--text-muted); }
      .about-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
      .about-feature { display: flex; gap: 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; transition: border-color 0.2s; }
      .about-feature:hover { border-color: var(--brand-blue); }
      .about-feature svg { flex-shrink: 0; color: var(--brand-blue); margin-top: 0.1rem; }
      .about-feature strong { display: block; margin-bottom: 0.25rem; font-size: 0.95rem; }
      .about-feature p { margin: 0; font-size: 0.88rem; color: var(--text-muted); line-height: 1.55; }
      .about-list { padding-left: 1.5rem; }
      .about-list li { margin-bottom: 0.6rem; color: var(--text-secondary); line-height: 1.6; }
      .about-list li strong { color: var(--text-primary); }
      .about-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
      .about-link-card { display: block; padding: 0.9rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); text-decoration: none; font-weight: 600; font-size: 0.9rem; color: var(--brand-blue); text-align: center; transition: all 0.2s; }
      .about-link-card:hover { border-color: var(--brand-blue); background: var(--brand-blue-light); text-decoration: none; }
      .about-developer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); text-align: center; color: var(--text-muted); font-size: 0.9rem; }
      .about-developer a { color: var(--brand-blue); text-decoration: none; }
      .about-developer a:hover { text-decoration: underline; }
      @media (max-width: 640px) {
        .about-header h1 { font-size: 1.75rem; }
        .about-features { grid-template-columns: 1fr; }
        .about-links { grid-template-columns: repeat(2, 1fr); }
      }
    `}</style>
  </div>
);
