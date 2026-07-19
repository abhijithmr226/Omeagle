import React, { useState, useEffect } from 'react';
import { X, Globe, User, Heart, Tag } from 'lucide-react';
import { InterestTagInput } from '../InterestTagInput';
import type { UserSettings } from '../../types/chat';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const COUNTRIES = [
  { code: '', label: 'Any' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'IN', label: 'India' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'PL', label: 'Poland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'RU', label: 'Russia' },
  { code: 'TR', label: 'Turkey' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'PH', label: 'Philippines' },
  { code: 'TH', label: 'Thailand' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'SG', label: 'Singapore' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'EG', label: 'Egypt' },
  { code: 'KE', label: 'Kenya' },
  { code: 'GH', label: 'Ghana' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CL', label: 'Chile' },
  { code: 'PE', label: 'Peru' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'BD', label: 'Bangladesh' },
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'NP', label: 'Nepal' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'IE', label: 'Ireland' },
  { code: 'AT', label: 'Austria' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'BE', label: 'Belgium' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'UA', label: 'Ukraine' },
  { code: 'RO', label: 'Romania' },
  { code: 'GR', label: 'Greece' },
  { code: 'IL', label: 'Israel' },
];

const GENDERS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PREFERRED_GENDERS = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [country, setCountry] = useState(settings.country || '');
  const [gender, setGender] = useState(settings.gender || '');
  const [interests, setInterests] = useState<string[]>(settings.interests || []);
  const [preferredGender, setPreferredGender] = useState(settings.preferredGender || '');
  const [preferredCountries, setPreferredCountries] = useState<string[]>(settings.preferredCountries || []);

  useEffect(() => {
    if (isOpen) {
      setCountry(settings.country || '');
      setGender(settings.gender || '');
      setInterests(settings.interests || []);
      setPreferredGender(settings.preferredGender || '');
      setPreferredCountries(settings.preferredCountries || []);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...settings,
      country: country || undefined,
      gender: gender || undefined,
      interests: interests.length > 0 ? interests : undefined,
      preferredGender: preferredGender || undefined,
      preferredCountries: preferredCountries.length > 0 ? preferredCountries : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card prefs-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Matching Preferences</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="setting-group">
            <label><Globe size={16} /> Your Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)}>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label><User size={16} /> Your Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}>
              {GENDERS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label><Tag size={16} /> Interests</label>
            <InterestTagInput
              tags={interests}
              onChange={setInterests}
              maxTags={10}
              placeholder="gaming, music, movies..."
            />
            <span className="field-hint">Add up to 10 interests to find like-minded people</span>
          </div>
          <div className="setting-group">
            <label><Heart size={16} /> Prefer to talk to</label>
            <select value={preferredGender} onChange={e => setPreferredGender(e.target.value)}>
              {PREFERRED_GENDERS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <label><Globe size={16} /> Preferred Countries</label>
            <InterestTagInput
              tags={preferredCountries}
              onChange={setPreferredCountries}
              maxTags={20}
              placeholder="Add countries..."
            />
            <span className="field-hint">Leave empty to match with anyone</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn-primary" onClick={handleSave}>Save Preferences</button>
        </div>
      </div>
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; -webkit-overflow-scrolling: touch; }
        .modal-card { background: var(--bg-surface); border-radius: var(--radius-lg); width: 100%; max-width: 420px; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-xl); -webkit-overflow-scrolling: touch; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; background: var(--bg-surface); z-index: 1; }
        .modal-header h3 { font-size: 1.1rem; font-weight: 700; }
        .modal-close-btn { color: var(--text-secondary); padding: 0.5rem; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); }
        .modal-close-btn:active { background: var(--bg-surface-secondary); }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.75rem; position: sticky; bottom: 0; background: var(--bg-surface); }
        .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .setting-group label { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; }
        .setting-group select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 16px; background: var(--bg-surface); color: var(--text-primary); width: 100%; -webkit-appearance: none; appearance: none; }
        .modal-btn-primary { background: var(--brand-blue); color: #fff; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); min-height: 44px; font-size: 0.95rem; flex: 1; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .modal-btn-primary:active { background: var(--brand-blue-hover); }
        .modal-btn-secondary { background: var(--bg-surface-secondary); color: var(--text-primary); font-weight: 600; padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); min-height: 44px; font-size: 0.95rem; -webkit-tap-highlight-color: transparent; }
        .modal-btn-secondary:active { background: var(--border-color); }
        .prefs-modal { max-width: 480px; }
        .field-hint { font-size: 0.75rem; color: var(--text-muted); margin-top: -0.25rem; }

        @media (max-width: 480px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-card { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-height: 85vh; padding-bottom: env(safe-area-inset-bottom, 0px); }
          .modal-footer { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); flex-direction: column; }
          .modal-btn-primary, .modal-btn-secondary { width: 100%; flex: none; }
        }
      `}</style>
    </div>
  );
};
