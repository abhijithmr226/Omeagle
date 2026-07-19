import React, { useState, useEffect } from 'react';
import { Settings, X, Camera, Mic, Tag, ToggleLeft, ToggleRight, Shield, Globe, MapPin, Ban, Eye, EyeOff } from 'lucide-react';
import { getMediaDevices } from '../../services/webrtc';
import { UserSettings } from '../../types/chat';
import { COUNTRIES } from '../../services/location';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, settings, onSaveSettings
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState(settings.videoDeviceId || '');
  const [selectedAudio, setSelectedAudio] = useState(settings.audioDeviceId || '');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>(settings.userInterests || []);
  const [autoNext, setAutoNext] = useState(settings.autoNextOnSkip);
  const [filterInterest, setFilterInterest] = useState(settings.filterByInterest);
  // New settings
  const [unmonitored, setUnmonitored] = useState(settings.unmonitoredMode);
  const [faceCheckOn, setFaceCheckOn] = useState(settings.faceCheck);
  const [keywordFilterOn, setKeywordFilterOn] = useState(settings.keywordFilter);
  const [blockedKwInput, setBlockedKwInput] = useState('');
  const [blockedKws, setBlockedKws] = useState<string[]>(settings.blockedKeywords || []);
  const [locationOn, setLocationOn] = useState(settings.locationSharing);
  const [countryFilter, setCountryFilter] = useState(settings.countryFilter || '');

  useEffect(() => {
    if (isOpen) getMediaDevices().then(setDevices);
  }, [isOpen]);

  useEffect(() => {
    setSelectedVideo(settings.videoDeviceId || '');
    setSelectedAudio(settings.audioDeviceId || '');
    setInterests(settings.userInterests || []);
    setAutoNext(settings.autoNextOnSkip);
    setFilterInterest(settings.filterByInterest);
    setUnmonitored(settings.unmonitoredMode);
    setFaceCheckOn(settings.faceCheck);
    setKeywordFilterOn(settings.keywordFilter);
    setBlockedKws(settings.blockedKeywords || []);
    setLocationOn(settings.locationSharing);
    setCountryFilter(settings.countryFilter || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const audioDevices = devices.filter(d => d.kind === 'audioinput');

  const addInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (interestInput.trim() && !interests.includes(interestInput.trim().toLowerCase())) {
      setInterests([...interests, interestInput.trim().toLowerCase()]);
      setInterestInput('');
    }
  };

  const addBlockedKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockedKwInput.trim() && !blockedKws.includes(blockedKwInput.trim())) {
      setBlockedKws([...blockedKws, blockedKwInput.trim()]);
      setBlockedKwInput('');
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      videoDeviceId: selectedVideo,
      audioDeviceId: selectedAudio,
      userInterests: interests,
      autoNextOnSkip: autoNext,
      filterByInterest: filterInterest,
      unmonitoredMode: unmonitored,
      faceCheck: faceCheckOn,
      keywordFilter: keywordFilterOn,
      blockedKeywords: blockedKws,
      locationSharing: locationOn,
      countryFilter: countryFilter,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Settings size={22} />
            <h3>Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Devices */}
          <div className="settings-section">
            <h4 className="settings-section-title">
              <Camera size={16} />
              <span>Devices</span>
            </h4>
            <div className="setting-row">
              <label className="setting-label">Camera</label>
              <select className="setting-select" value={selectedVideo} onChange={e => setSelectedVideo(e.target.value)}>
                <option value="">Default</option>
                {videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
            <div className="setting-row">
              <label className="setting-label">Microphone</label>
              <select className="setting-select" value={selectedAudio} onChange={e => setSelectedAudio(e.target.value)}>
                <option value="">Default</option>
                {audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <h4 className="settings-section-title">
              <ToggleLeft size={16} />
              <span>Preferences</span>
            </h4>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label">Auto skip on disconnect</div>
                <div className="toggle-desc">Automatically find next stranger</div>
              </div>
              <button className="toggle-btn" onClick={() => setAutoNext(!autoNext)}>
                {autoNext ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
              </button>
            </div>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label">Match by interests</div>
                <div className="toggle-desc">Only match with shared interests</div>
              </div>
              <button className="toggle-btn" onClick={() => setFilterInterest(!filterInterest)}>
                {filterInterest ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
              </button>
            </div>
          </div>

          {/* Interests */}
          <div className="settings-section">
            <h4 className="settings-section-title">
              <Tag size={16} />
              <span>Interests</span>
            </h4>
            <form onSubmit={addInterest} className="interest-form">
              <input type="text" className="setting-input" placeholder="Add interest..."
                value={interestInput} onChange={e => setInterestInput(e.target.value)} />
              <button type="submit" className="btn-add-tag">Add</button>
            </form>
            <div className="tags-container">
              {interests.map(tag => (
                <span key={tag} className="interest-tag">
                  #{tag}
                  <button type="button" onClick={() => setInterests(interests.filter(i => i !== tag))}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          {/* Safety & Moderation */}
          <div className="settings-section">
            <h4 className="settings-section-title">
              <Shield size={16} />
              <span>Safety & Moderation</span>
            </h4>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label">Face check</div>
                <div className="toggle-desc">Verify camera shows a face before connecting</div>
              </div>
              <button className="toggle-btn" onClick={() => setFaceCheckOn(!faceCheckOn)}>
                {faceCheckOn ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
              </button>
            </div>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label">Keyword filter</div>
                <div className="toggle-desc">Block messages with inappropriate words</div>
              </div>
              <button className="toggle-btn" onClick={() => setKeywordFilterOn(!keywordFilterOn)}>
                {keywordFilterOn ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
              </button>
            </div>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label flex-row">Unmonitored mode <span className="unmonitored-badge">18+</span></div>
                <div className="toggle-desc">Disable all moderation checks</div>
              </div>
              <button className="toggle-btn" onClick={() => setUnmonitored(!unmonitored)}>
                {unmonitored ? <ToggleRight size={32} className="toggle-on-danger" /> : <ToggleLeft size={32} />}
              </button>
            </div>
          </div>

          {/* Blocked Keywords */}
          {keywordFilterOn && (
            <div className="settings-section">
              <h4 className="settings-section-title">
                <Ban size={16} />
                <span>Blocked Keywords</span>
              </h4>
              <form onSubmit={addBlockedKeyword} className="interest-form">
                <input type="text" className="setting-input" placeholder="Add word to block..."
                  value={blockedKwInput} onChange={e => setBlockedKwInput(e.target.value)} />
                <button type="submit" className="btn-add-tag">Add</button>
              </form>
              <div className="tags-container">
                {blockedKws.map(kw => (
                  <span key={kw} className="blocked-tag">
                    {kw}
                    <button type="button" onClick={() => setBlockedKws(blockedKws.filter(k => k !== kw))}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="settings-section">
            <h4 className="settings-section-title">
              <MapPin size={16} />
              <span>Location</span>
            </h4>
            <div className="setting-row toggle-row">
              <div>
                <div className="toggle-label">Share location</div>
                <div className="toggle-desc">Show your country to strangers</div>
              </div>
              <button className="toggle-btn" onClick={() => setLocationOn(!locationOn)}>
                {locationOn ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
              </button>
            </div>
            <div className="setting-row">
              <label className="setting-label">Country filter</label>
              <select className="setting-select" value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>

      <style>{`
        .settings-modal { max-height: 85vh; overflow-y: auto; }
        .settings-section {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .settings-section:last-child { border-bottom: none; }
        .settings-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem 0;
        }
        .toggle-row { padding: 0.6rem 0; }
        .setting-label {
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
        }
        .setting-select {
          flex: 1;
          max-width: 280px;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }
        .setting-select:focus { border-color: var(--brand-blue); }
        .toggle-label { font-weight: 600; font-size: 0.95rem; }
        .toggle-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem; }
        .toggle-btn { color: var(--text-muted); flex-shrink: 0; }
        .toggle-on { color: var(--brand-blue); }
        .toggle-on-danger { color: var(--status-red); }
        .flex-row { display: flex; align-items: center; gap: 0.5rem; }
        .unmonitored-badge {
          background: var(--status-red);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: var(--radius-full);
        }
        .setting-input {
          flex: 1;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
        }
        .setting-input:focus { border-color: var(--brand-blue); }
        .interest-form { display: flex; gap: 0.5rem; }
        .btn-add-tag {
          background-color: var(--brand-blue);
          color: #fff;
          font-weight: 600;
          padding: 0 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
        }
        .tags-container { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
        .interest-tag {
          background-color: var(--brand-blue-light);
          color: var(--brand-blue);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .interest-tag button { font-size: 1rem; line-height: 1; color: var(--brand-blue); opacity: 0.6; }
        .interest-tag button:hover { opacity: 1; }
        .blocked-tag {
          background-color: var(--status-red-light);
          color: var(--status-red);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .blocked-tag button { font-size: 1rem; line-height: 1; color: var(--status-red); opacity: 0.6; }
        .blocked-tag button:hover { opacity: 1; }
        .btn-cancel {
          padding: 0.6rem 1.2rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-weight: 600;
          color: var(--text-primary);
        }
        .btn-save {
          background-color: var(--brand-blue);
          color: #fff;
          font-weight: 700;
          padding: 0.6rem 1.5rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};
