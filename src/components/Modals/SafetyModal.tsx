import React from 'react';
import { ShieldCheck, X, AlertTriangle, EyeOff, Lock, UserCheck } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <ShieldCheck size={24} className="safety-icon" />
            <h3>Omeagle Safety & Guidelines</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="safety-tip-item">
            <div className="tip-icon-box blue-bg">
              <EyeOff size={20} />
            </div>
            <div>
              <h4>Keep Personal Details Private</h4>
              <p>Never share your real name, address, phone number, social media handles, or financial info with strangers.</p>
            </div>
          </div>

          <div className="safety-tip-item">
            <div className="tip-icon-box orange-bg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4>Report Inappropriate Behavior</h4>
              <p>If anyone makes you uncomfortable or violates community guidelines, click the Red Report button immediately.</p>
            </div>
          </div>

          <div className="safety-tip-item">
            <div className="tip-icon-box green-bg">
              <UserCheck size={20} />
            </div>
            <div>
              <h4>Be Respectful & Kind</h4>
              <p>Omeagle is a global community. Treat everyone with courtesy and kindness. Hate speech is strictly prohibited.</p>
            </div>
          </div>

          <div className="safety-tip-item">
            <div className="tip-icon-box purple-bg">
              <Lock size={20} />
            </div>
            <div>
              <h4>100% Encrypted & Anonymous</h4>
              <p>No account or registration required. Peer-to-peer audio and video feeds are end-to-end encrypted.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-got-it" onClick={onClose}>
            I Understand & Agree
          </button>
        </div>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }

        .modal-content {
          background-color: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 520px;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          animation: modal-fade 0.2s ease;
        }

        @keyframes modal-fade {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .safety-icon {
          color: var(--status-green);
        }

        .modal-close-btn {
          color: var(--text-secondary);
          padding: 4px;
          border-radius: var(--radius-sm);
        }

        .modal-close-btn:hover {
          background-color: var(--bg-surface-secondary);
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .safety-tip-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .tip-icon-box {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .safety-tip-item h4 {
          font-size: 0.98rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .safety-tip-item p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: flex-end;
        }

        .btn-got-it {
          background-color: var(--brand-blue);
          color: #ffffff;
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          width: 100%;
        }

        .btn-got-it:hover {
          background-color: var(--brand-blue-hover);
        }
      `}</style>
    </div>
  );
};
