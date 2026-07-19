import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPage }) => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-disclaimer">
          By using Omeagle, you agree to our{' '}
          <Link to="/terms">Terms of Service</Link>.
          Please be 18+ to use this site.
        </div>
        <div className="footer-links-group">
          <div className="text-links">
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-developer">
          Developed by{' '}
          <a href="https://github.com/abhijithmr226" target="_blank" rel="noreferrer">abhijithmr226</a>
          {' | '}
          <a href="https://linkedin.com/in/abhijithmr226" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
      <style>{`
        .site-footer { border-top: 1px solid var(--border-color); background-color: var(--bg-surface); padding: 1.25rem 1rem; margin-top: auto; font-size: 0.85rem; color: var(--text-secondary); transition: background-color 0.2s ease, border-color 0.2s ease; }
        .footer-container { max-width: 1440px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-disclaimer a { color: var(--brand-blue); text-decoration: none; font-weight: 500; }
        .footer-links-group { display: flex; align-items: center; gap: 1.5rem; }
        .text-links { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .text-links a { color: var(--text-secondary); text-decoration: none; font-weight: 500; }
        .text-links a:hover { color: var(--brand-blue); }
        .footer-developer { font-size: 0.82rem; color: var(--text-muted); }
        .footer-developer a { color: var(--brand-blue); text-decoration: none; font-weight: 600; }
        .footer-developer a:hover { text-decoration: underline; }
        @media (max-width: 768px) { .footer-container { flex-direction: column; text-align: center; } .text-links { justify-content: center; } }
      `}</style>
    </footer>
  );
};
