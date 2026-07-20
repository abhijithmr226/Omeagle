import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPage }) => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-columns">
          <div className="footer-col">
            <h4>Omeagle</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/safety">Safety Center</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div className="footer-col">
            <h4>Features</h4>
            <Link to="/">Video Chat</Link>
            <Link to="/">Text Chat</Link>
            <Link to="/">Country Matching</Link>
            <Link to="/">Interest Matching</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact Us</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="https://github.com/abhijithmr226/Omeagle/issues" target="_blank" rel="noopener noreferrer">Report a Bug</a>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="/blog">Getting Started Guide</Link>
            <Link to="/safety">Community Guidelines</Link>
            <Link to="/blog">Moderation Report</Link>
            <Link to="/blog">FAQ</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-disclaimer">
            By using Omeagle, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link>.
            Please be 18+ to use this site.
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
        .site-footer { border-top: 1px solid var(--border-color); background-color: var(--bg-surface); padding: 2rem 1rem 1.25rem; margin-top: auto; font-size: 0.85rem; color: var(--text-secondary); transition: background-color 0.2s ease, border-color 0.2s ease; }
        .footer-container { max-width: 1440px; margin: 0 auto; }
        .footer-columns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-bottom: 2rem; }
        .footer-col h4 { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
        .footer-col a { display: block; color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; margin-bottom: 0.5rem; transition: color 0.2s; }
        .footer-col a:hover { color: var(--brand-blue); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); }
        .footer-disclaimer a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
        .footer-developer { font-size: 0.82rem; color: var(--text-muted); }
        .footer-developer a { color: var(--brand-blue); text-decoration: none; font-weight: 600; }
        .footer-developer a:hover { text-decoration: underline; }
        @media (max-width: 1024px) {
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
