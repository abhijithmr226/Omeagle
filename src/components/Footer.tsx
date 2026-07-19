import React from 'react';

interface FooterProps {
  onOpenPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPage }) => {
  return (
    <footer className="site-footer">
      {/* 728x90 Banner — desktop only, above footer links */}
      <div className="footer-ad-wrapper">
        <script>
          {`if(!window._adLoaded){window._adLoaded=true;window.atOptions={key:'8bdddf8feba87229589bd6c56db45ecd',format:'iframe',height:90,width:728,params:{}};var s=document.createElement('script');s.src='https://www.highperformanceformat.com/8bdddf8feba87229589bd6c56db45ecd/invoke.js';s.async=true;document.head.appendChild(s);}`}
        </script>
      </div>

      <div className="footer-container">
        <div className="footer-disclaimer">
          By using Omeagle, you agree to our{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onOpenPage?.('terms'); }}>Terms of Service</a>.
          Please be 18+ to use this site.
        </div>

        <div className="footer-links-group">
          <div className="text-links">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenPage?.('about'); }}>About</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenPage?.('privacy'); }}>Privacy Policy</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenPage?.('terms'); }}>Terms of Service</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenPage?.('contact'); }}>Contact</a>
            <a href="https://www.effectivecpmnetwork.com/pjupecfk3?key=068e35e2084ac983648f9b4a872e3b38" target="_blank" rel="noreferrer sponsored">Sponsored</a>
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
        .site-footer {
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          padding: 1.25rem 1rem;
          margin-top: auto;
          font-size: 0.85rem;
          color: var(--text-secondary);
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .footer-container {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .footer-disclaimer a {
          color: var(--brand-blue);
          text-decoration: none;
          font-weight: 500;
        }
        .footer-links-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .text-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .text-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
        }
        .text-links a:hover {
          color: var(--brand-blue);
        }
        .footer-developer {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .footer-developer a {
          color: var(--brand-blue);
          text-decoration: none;
          font-weight: 600;
        }
        .footer-developer a:hover {
          text-decoration: underline;
        }
        .footer-ad-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          min-height: 90px;
        }
        @media (max-width: 768px) {
          .footer-ad-wrapper {
            display: none;
          }
          .footer-container {
            flex-direction: column;
            text-align: center;
          }
          .text-links {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};
