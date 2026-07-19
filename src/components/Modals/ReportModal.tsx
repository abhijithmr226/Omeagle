import React, { useState } from 'react';
import { Flag, X, AlertOctagon, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReport: (reason: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onConfirmReport
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleReport = () => {
    if (!selectedReason) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onConfirmReport(selectedReason);
      setIsSubmitted(false);
      setSelectedReason('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Flag size={22} className="red-icon" />
            <h3>Report Inappropriate Behavior</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isSubmitted ? (
            <div className="report-success-state">
              <CheckCircle size={56} className="green-icon" />
              <h4>Report Submitted</h4>
              <p>Thank you for keeping Omeagle safe. We will review this user immediately.</p>
            </div>
          ) : (
            <>
              <p className="report-desc">
                Please select the reason for reporting this stranger:
              </p>
              <div className="reasons-list">
                {[
                  'Inappropriate / Nudity content',
                  'Abusive or offensive language',
                  'Spam or advertising bot',
                  'Harassment / Bullying',
                  'Underage user'
                ].map(reason => (
                  <label key={reason} className={`reason-item ${selectedReason === reason ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="report-reason" 
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {!isSubmitted && (
          <div className="modal-footer">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn-submit-report" 
              disabled={!selectedReason}
              onClick={handleReport}
            >
              Submit Report & Disconnect
            </button>
          </div>
        )}
      </div>

      <style>{`
        .report-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
        }

        .reasons-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .reason-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .reason-item.selected {
          border-color: var(--status-red);
          background-color: var(--status-red-light);
          color: var(--status-red);
        }

        .report-success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1rem;
        }

        .green-icon {
          color: var(--status-green);
          margin-bottom: 1rem;
        }

        .report-success-state h4 {
          font-size: 1.2rem;
          margin-bottom: 0.4rem;
        }

        .report-success-state p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .btn-cancel {
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          color: var(--text-secondary);
        }

        .btn-submit-report {
          background-color: var(--status-red);
          color: #ffffff;
          font-weight: 700;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
        }

        .btn-submit-report:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};
