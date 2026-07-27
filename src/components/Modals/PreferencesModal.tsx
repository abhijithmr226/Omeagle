import React, { useState, useEffect } from 'react';
import { X, Globe, User, Heart, Tag, SlidersHorizontal } from 'lucide-react';
import { InterestTagInput } from '../InterestTagInput';
import type { UserSettings } from '../../types/chat';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const COUNTRIES = [
  { code: '', label: 'Any Country' },
  { code: 'US', label: '🇺🇸 United States' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'CA', label: '🇨🇦 Canada' },
  { code: 'AU', label: '🇦🇺 Australia' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'JP', label: '🇯🇵 Japan' },
  { code: 'KR', label: '🇰🇷 South Korea' },
  { code: 'IN', label: '🇮🇳 India' },
  { code: 'BR', label: '🇧🇷 Brazil' },
  { code: 'MX', label: '🇲🇽 Mexico' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'IT', label: '🇮🇹 Italy' },
  { code: 'NL', label: '🇳🇱 Netherlands' },
  { code: 'SE', label: '🇸🇪 Sweden' },
  { code: 'NO', label: '🇳🇴 Norway' },
  { code: 'DK', label: '🇩🇰 Denmark' },
  { code: 'FI', label: '🇫🇮 Finland' },
  { code: 'PL', label: '🇵🇱 Poland' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'RU', label: '🇷🇺 Russia' },
  { code: 'TR', label: '🇹🇷 Turkey' },
  { code: 'SA', label: '🇸🇦 Saudi Arabia' },
  { code: 'AE', label: '🇦🇪 United Arab Emirates' },
  { code: 'PH', label: '🇵🇭 Philippines' },
  { code: 'TH', label: '🇹🇭 Thailand' },
  { code: 'VN', label: '🇻🇳 Vietnam' },
  { code: 'ID', label: '🇮🇩 Indonesia' },
  { code: 'MY', label: '🇲🇾 Malaysia' },
  { code: 'SG', label: '🇸🇬 Singapore' },
  { code: 'NG', label: '🇳🇬 Nigeria' },
  { code: 'ZA', label: '🇿🇦 South Africa' },
  { code: 'EG', label: '🇪🇬 Egypt' },
  { code: 'KE', label: '🇰🇪 Kenya' },
  { code: 'GH', label: '🇬🇭 Ghana' },
  { code: 'AR', label: '🇦🇷 Argentina' },
  { code: 'CO', label: '🇨🇴 Colombia' },
  { code: 'CL', label: '🇨🇱 Chile' },
  { code: 'PE', label: '🇵🇪 Peru' },
  { code: 'PK', label: '🇵🇰 Pakistan' },
  { code: 'BD', label: '🇧🇩 Bangladesh' },
  { code: 'LK', label: '🇱🇰 Sri Lanka' },
  { code: 'NP', label: '🇳🇵 Nepal' },
  { code: 'NZ', label: '🇳🇿 New Zealand' },
  { code: 'IE', label: '🇮🇪 Ireland' },
  { code: 'AT', label: '🇦🇹 Austria' },
  { code: 'CH', label: '🇨🇭 Switzerland' },
  { code: 'BE', label: '🇧🇪 Belgium' },
  { code: 'CZ', label: '🇨🇿 Czech Republic' },
  { code: 'UA', label: '🇺🇦 Ukraine' },
  { code: 'RO', label: '🇷🇴 Romania' },
  { code: 'GR', label: '🇬🇷 Greece' },
  { code: 'IL', label: '🇮🇱 Israel' },
];

const GENDERS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PREFERRED_GENDERS = [
  { value: '', label: 'Any Gender' },
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
          <div className="modal-title-group">
            <SlidersHorizontal size={20} className="modal-header-icon" />
            <h3>Matching Filters</h3>
          </div>
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
            <label><Heart size={16} /> Filter by Gender</label>
            <select value={preferredGender} onChange={e => setPreferredGender(e.target.value)}>
              {PREFERRED_GENDERS.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <span className="field-hint">Match with male, female, or any gender</span>
          </div>

          <div className="setting-group">
            <label><Tag size={16} /> Interest Tags</label>
            <InterestTagInput
              tags={interests}
              onChange={setInterests}
              maxTags={10}
              placeholder="gaming, music, movies..."
            />
            <span className="field-hint">Add up to 10 interests to find like-minded strangers</span>
          </div>

          <div className="setting-group">
            <label><Globe size={16} /> Preferred Countries</label>
            <InterestTagInput
              tags={preferredCountries}
              onChange={setPreferredCountries}
              maxTags={20}
              placeholder="Add countries..."
            />
            <span className="field-hint">Leave empty to match with people worldwide</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn-primary" onClick={handleSave}>Save Filters</button>
        </div>
      </div>
      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; -webkit-overflow-scrolling: touch; }
        .modal-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); width: 100%; max-width: 480px; max-height: 88vh; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.3); overflow: hidden; -webkit-overflow-scrolling: touch; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); background: var(--bg-surface-secondary); z-index: 1; flex-shrink: 0; }
        .modal-title-group { display: flex; align-items: center; gap: 0.6rem; color: var(--brand-blue); }
        .modal-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin: 0; }
        .modal-close-btn { color: var(--text-secondary); width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-full); transition: background 0.2s; border: none; background: transparent; cursor: pointer; }
        .modal-close-btn:hover { background: var(--border-color); color: var(--text-primary); }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.75rem; background: var(--bg-surface-secondary); flex-shrink: 0; }
        .setting-group { display: flex; flex-direction: column; gap: 0.45rem; }
        .setting-group label { display: flex; align-items: center; gap: 0.45rem; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
        .setting-group select {
          padding: 0.75rem 2.25rem 0.75rem 0.85rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 15px;
          background-color: var(--bg-surface);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.85rem center;
          background-size: 1rem;
          color: var(--text-primary);
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .setting-group select:focus {
          outline: none;
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.15);
        }
        .setting-group select option {
          background-color: var(--bg-surface);
          color: var(--text-primary);
          padding: 0.5rem;
        }
        .modal-btn-primary { background: var(--brand-blue); color: #fff; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); min-height: 44px; font-size: 0.95rem; border: none; cursor: pointer; transition: background 0.2s; -webkit-tap-highlight-color: transparent; }
        .modal-btn-primary:hover { background: var(--brand-blue-hover, #0052cc); }
        .modal-btn-secondary { background: var(--bg-surface); color: var(--text-primary); font-weight: 600; padding: 0.75rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); min-height: 44px; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; -webkit-tap-highlight-color: transparent; }
        .modal-btn-secondary:hover { background: var(--border-color); }
        .field-hint { font-size: 0.78rem; color: var(--text-muted); margin-top: -0.15rem; }

        @media (max-width: 640px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-card { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-height: 88vh; }
          .modal-footer { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); flex-direction: column-reverse; }
          .modal-btn-primary, .modal-btn-secondary { width: 100%; flex: none; }
        }
      `}</style>
    </div>
  );
};
