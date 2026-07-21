import React, { useState } from 'react';
import { Flag, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string, details?: string) => void;
}

const REPORT_REASONS = [
  { id: 'nsfw', label: 'Explicit or Inappropriate Content (NSFW)' },
  { id: 'harassment', label: 'Harassment, Bullying, or Hate Speech' },
  { id: 'spam', label: 'Spam, Automated Bot, or Commercial Advertising' },
  { id: 'underage', label: 'User Appears to Be Under 18 Years Old' },
  { id: 'other', label: 'Other Violation of Community Guidelines' },
];

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmitReport }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmitReport(selectedReason, details);
      setSubmitted(false);
      setSelectedReason('');
      setDetails('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Flag size={20} className="report-flag-icon" />
            <h2>Report Stranger</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="report-form">
            <p className="report-desc">
              Your report is completely anonymous. Submitting a report will automatically block this user and connect you to a new partner.
            </p>

            <div className="report-reasons-list">
              {REPORT_REASONS.map(reason => (
                <label key={reason.id} className={`report-reason-item ${selectedReason === reason.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReason === reason.id}
                    onChange={() => setSelectedReason(reason.id)}
                    required
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'other' && (
              <textarea
                placeholder="Describe the issue (optional)..."
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="report-textarea"
                rows={3}
                maxLength={300}
              />
            )}

            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-modal-danger" disabled={!selectedReason}>
                Submit &amp; Next Partner
              </button>
            </div>
          </form>
        ) : (
          <div className="report-success-state">
            <CheckCircle2 size={44} className="success-icon" />
            <h3>Report Submitted</h3>
            <p>Thank you for keeping Omeagle safe. User blocked. Finding a new match...</p>
          </div>
        )}
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
          z-index: 999; padding: 1rem; animation: fadeIn 0.2s ease-out;
        }
        .report-modal {
          background: var(--bg-surface); border: 1px solid var(--border-color);
          border-radius: var(--radius-lg); width: 100%; max-width: 480px; padding: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3); color: var(--text-primary);
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);
        }
        .modal-title-row { display: flex; align-items: center; gap: 0.5rem; }
        .modal-title-row h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }
        .report-flag-icon { color: var(--status-red); }
        .modal-close-btn {
          width: 32px; height: 32px; border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); background: var(--bg-surface-secondary);
        }
        .modal-close-btn:hover { color: var(--text-primary); background: var(--border-color); }
        .report-desc { font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem; }
        .report-reasons-list { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .report-reason-item {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 0.9rem;
          background: var(--bg-surface-secondary); border: 1px solid var(--border-color);
          border-radius: var(--radius-md); font-size: 0.9rem; cursor: pointer; transition: all 0.15s;
        }
        .report-reason-item:hover { border-color: var(--brand-blue); }
        .report-reason-item.selected {
          border-color: var(--status-red); background: var(--status-red-light); color: var(--status-red); font-weight: 600;
        }
        .report-textarea {
          width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md);
          background: var(--bg-surface-secondary); color: var(--text-primary); font-size: 0.9rem;
          resize: vertical; margin-bottom: 1rem; outline: none;
        }
        .report-textarea:focus { border-color: var(--brand-blue); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
        .btn-modal-cancel {
          padding: 0.65rem 1.25rem; border-radius: var(--radius-md); background: var(--bg-surface-secondary);
          color: var(--text-primary); font-weight: 600; font-size: 0.9rem;
        }
        .btn-modal-cancel:hover { background: var(--border-color); }
        .btn-modal-danger {
          padding: 0.65rem 1.25rem; border-radius: var(--radius-md); background: var(--status-red);
          color: #fff; font-weight: 700; font-size: 0.9rem; transition: background 0.15s;
        }
        .btn-modal-danger:hover:not(:disabled) { background: #dc2626; }
        .btn-modal-danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .report-success-state {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 2rem 1rem; gap: 0.75rem;
        }
        .success-icon { color: var(--status-green); }
        .report-success-state h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }
        .report-success-state p { font-size: 0.9rem; color: var(--text-muted); margin: 0; }
      `}</style>
    </div>
  );
};
