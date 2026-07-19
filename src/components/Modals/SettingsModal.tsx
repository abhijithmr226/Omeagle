import React, { useState, useEffect } from 'react';
import { X, Video, Mic } from 'lucide-react';
import { UserSettings } from '../../types/chat';
import { getMediaDevices } from '../../services/webrtc';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (s: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState(settings.videoDeviceId || '');
  const [audioDeviceId, setAudioDeviceId] = useState(settings.audioDeviceId || '');

  useEffect(() => {
    if (isOpen) {
      getMediaDevices().then(setDevices);
      setVideoDeviceId(settings.videoDeviceId || '');
      setAudioDeviceId(settings.audioDeviceId || '');
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const audioDevices = devices.filter(d => d.kind === 'audioinput');

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      videoDeviceId: videoDeviceId || undefined,
      audioDeviceId: audioDeviceId || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Settings</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="setting-group">
            <label><Video size={16} /> Camera</label>
            <select value={videoDeviceId} onChange={e => setVideoDeviceId(e.target.value)}>
              <option value="">Default</option>
              {videoDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,4)}`}</option>)}
            </select>
          </div>
          <div className="setting-group">
            <label><Mic size={16} /> Microphone</label>
            <select value={audioDeviceId} onChange={e => setAudioDeviceId(e.target.value)}>
              <option value="">Default</option>
              {audioDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,4)}`}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-primary" onClick={handleSave}>Save</button>
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
        .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .setting-group label { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; }
        .setting-group select { padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 16px; background: var(--bg-surface); color: var(--text-primary); width: 100%; -webkit-appearance: none; appearance: none; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: var(--bg-surface); }
        .modal-btn-primary { background: var(--brand-blue); color: #fff; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: var(--radius-md); min-height: 44px; font-size: 1rem; width: 100%; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .modal-btn-primary:active { background: var(--brand-blue-hover); }

        @media (max-width: 480px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-card { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-height: 80vh; padding-bottom: env(safe-area-inset-bottom, 0px); }
          .modal-footer { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>
    </div>
  );
};
