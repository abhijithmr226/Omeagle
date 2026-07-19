import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface AgeGateModalProps {
  onConfirm: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({ onConfirm }) => {
  const [denied, setDenied] = useState(false);

  return (
    <div className="age-gate-overlay">
      <div className="age-gate-modal">
        <div className="age-gate-icon">
          <Shield size={48} />
        </div>
        <h2 className="age-gate-title">Age Verification Required</h2>
        <p className="age-gate-text">
          Omeagle is a platform for users <strong>18 years and older</strong>. By entering, you confirm that you are at least 18 years old.
        </p>
        <div className="age-gate-buttons">
          <button className="age-gate-confirm" onClick={onConfirm}>
            I am 18+ — Enter
          </button>
          <button className="age-gate-deny" onClick={() => setDenied(true)}>
            I am under 18
          </button>
        </div>
        {denied && (
          <div className="age-gate-denied">
            <AlertTriangle size={20} />
            <p>You must be 18 or older to use Omeagle. This site is not intended for minors.</p>
          </div>
        )}
        <p className="age-gate-terms">
          By continuing, you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>
      <style>{`
        .age-gate-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .age-gate-modal {
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius-xl); padding: 2.5rem 2rem;
          max-width: 440px; width: 100%; text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
        }
        .age-gate-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px; border-radius: 50%;
          background: var(--brand-blue-light); color: var(--brand-blue);
          margin-bottom: 1.5rem;
        }
        .age-gate-title {
          font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem;
          color: var(--text-primary);
        }
        .age-gate-text {
          font-size: 1rem; color: var(--text-secondary); line-height: 1.6;
          margin-bottom: 1.5rem;
        }
        .age-gate-text strong { color: var(--text-primary); }
        .age-gate-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
        .age-gate-confirm {
          background: var(--brand-blue); color: #fff; border: none;
          padding: 0.9rem 1.5rem; border-radius: var(--radius-md);
          font-size: 1.05rem; font-weight: 700; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .age-gate-confirm:hover { background: var(--brand-blue-hover); transform: translateY(-1px); }
        .age-gate-deny {
          background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color);
          padding: 0.75rem 1.5rem; border-radius: var(--radius-md);
          font-size: 0.95rem; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .age-gate-deny:hover { border-color: #ef4444; color: #ef4444; }
        .age-gate-denied {
          display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
          margin-top: 1.25rem; padding: 1rem; border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }
        .age-gate-denied p { margin: 0; font-size: 0.9rem; font-weight: 600; }
        .age-gate-terms {
          margin-top: 1.25rem; font-size: 0.8rem; color: var(--text-muted);
        }
        .age-gate-terms a { color: var(--brand-blue); text-decoration: underline; }
      `}</style>
    </div>
  );
};
