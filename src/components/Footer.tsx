import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-col">
            <h4>Omeagle</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/safety">Safety Center</Link>
            <Link to="/blog">Blog & Guides</Link>
            <Link to="/contact">Contact Support</Link>
          </div>

          <div className="footer-col">
            <h4>Omegle Alternatives</h4>
            <Link to="/omegle-alternative-no-login">Omegle Alternative No Login</Link>
            <Link to="/ometv-alternative">Free OmeTV Alternative</Link>
            <Link to="/emerald-chat-alternative">Emerald Chat Alternative</Link>
            <Link to="/joingy-alternative">Joingy Alternative</Link>
            <Link to="/chatroulette-alternative">Chatroulette Alternative</Link>
            <Link to="/monkey-app-alternative">Monkey App Web Alternative</Link>
          </div>

          <div className="footer-col">
            <h4>Popular Chat Features</h4>
            <Link to="/random-video-chat-no-signup">Random Video Chat No Signup</Link>
            <Link to="/talk-to-strangers-free">Talk to Strangers Free</Link>
            <Link to="/anonymous-video-chat-no-signup">Anonymous Video Chat No Sign Up</Link>
            <Link to="/gender-filter-video-chat">Gender Filter Video Chat</Link>
            <Link to="/mobile-video-chat">Mobile Stranger Video Chat</Link>
            <Link to="/ai-video-chat">AI Video Chat Platform</Link>
          </div>

          <div className="footer-col">
            <h4>Regional Chat Rooms</h4>
            <Link to="/chat/india">India Random Video Chat</Link>
            <Link to="/chat-usa">USA Stranger Video Chat</Link>
            <Link to="/chat-uk">UK Video Chat Online</Link>
            <Link to="/chat-canada">Canada Video Chat</Link>
            <Link to="/chat-australia">Australia Cam Chat</Link>
          </div>

          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/safety">Community Guidelines</Link>
            <a href="https://github.com/abhijithmr226/Omeagle/issues" target="_blank" rel="noopener noreferrer">Report a Bug</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-disclaimer">
            By using Omeagle, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
            Please be 18+ to use this platform.
          </div>
          <div className="footer-developer">
            Developed by{' '}
            <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">abhijithmr226</a>
            {' | '}
            <a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <style>{`
        .site-footer { border-top: 1px solid var(--border-color); background-color: var(--bg-surface); padding: 2.5rem 1rem 1.5rem; margin-top: auto; font-size: 0.85rem; color: var(--text-secondary); transition: background-color 0.2s ease, border-color 0.2s ease; }
        .footer-container { max-width: 1440px; margin: 0 auto; }
        .footer-columns { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .footer-col h4 { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.85rem; }
        .footer-col a { display: block; color: var(--text-secondary); text-decoration: none; font-size: 0.82rem; margin-bottom: 0.5rem; transition: color 0.2s; }
        .footer-col a:hover { color: var(--brand-blue); text-decoration: underline; }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); }
        .footer-disclaimer a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
        .footer-developer { font-size: 0.82rem; color: var(--text-muted); }
        .footer-developer a { color: var(--brand-blue); text-decoration: none; font-weight: 600; }
        .footer-developer a:hover { text-decoration: underline; }
        @media (max-width: 1200px) {
          .footer-columns { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .footer-columns { grid-template-columns: repeat(2, 1fr); }
          .footer-bottom { flex-direction: column; text-align: center; }
        }
        @media (max-width: 480px) {
          .footer-columns { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
};
