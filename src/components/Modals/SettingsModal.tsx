import React, { useState, useEffect, useRef } from 'react';
import { X, Video, Mic, Volume2, Globe, Users, Sparkles, VolumeX } from 'lucide-react';
import { UserSettings } from '../../types/chat';
import { getMediaDevices } from '../../services/webrtc';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (s: UserSettings) => void;
}

const GENDER_OPTIONS = [
  { id: 'all', label: 'Everyone', icon: '🌐' },
  { id: 'male', label: 'Male', icon: '👨' },
  { id: 'female', label: 'Female', icon: '👩' },
  { id: 'couples', label: 'Couples', icon: '👫' },
];

const REGION_OPTIONS = [
  { id: 'global', label: 'Global', flag: '🌍' },
  { id: 'na', label: 'North America', flag: '🇺🇸' },
  { id: 'eu', label: 'Europe', flag: '🇪🇺' },
  { id: 'asia', label: 'Asia', flag: '🌏' },
  { id: 'latam', label: 'Latin America', flag: '🇧🇷' },
];

const POPULAR_INTERESTS = ['Gaming', 'Music', 'Anime', 'Chat', 'Languages', 'Movies', 'Tech', 'Coding'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDeviceId, setVideoDeviceId] = useState(settings.videoDeviceId || '');
  const [audioDeviceId, setAudioDeviceId] = useState(settings.audioDeviceId || '');
  const [preferredGender, setPreferredGender] = useState(settings.preferredGender || 'all');
  const [country, setCountry] = useState(settings.country || 'global');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(settings.interests || ['Gaming', 'Music']);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled !== false);
  const [audioLevel, setAudioLevel] = useState(0);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      getMediaDevices().then(setDevices);
      setVideoDeviceId(settings.videoDeviceId || '');
      setAudioDeviceId(settings.audioDeviceId || '');
      setPreferredGender(settings.preferredGender || 'all');
      setCountry(settings.country || 'global');
      setSelectedInterests(settings.interests || ['Gaming', 'Music']);
      setSoundEnabled(settings.soundEnabled !== false);
    }
  }, [isOpen, settings]);

  // Start live test stream preview
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const constraints: MediaStreamConstraints = {
      video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        previewStreamRef.current = stream;
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }

        // Setup audio level meter
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          } catch {
            // Audio meter optional fallback
          }
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => { });
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(t => t.stop());
        previewStreamRef.current = null;
      }
    };
  }, [isOpen, videoDeviceId, audioDeviceId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  const audioDevices = devices.filter(d => d.kind === 'audioinput');

  const toggleInterest = (topic: string) => {
    setSelectedInterests(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      videoDeviceId: videoDeviceId || undefined,
      audioDeviceId: audioDeviceId || undefined,
      preferredGender,
      country,
      interests: selectedInterests,
      soundEnabled
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Match Filters & Device Settings</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* 1. Gender Filter Section */}
          <div className="setting-group">
            <label><Users size={16} /> Gender Preference</label>
            <div className="pill-grid">
              {GENDER_OPTIONS.map(g => (
                <button
                  key={g.id}
                  type="button"
                  className={`setting-pill ${preferredGender === g.id ? 'selected' : ''}`}
                  onClick={() => setPreferredGender(g.id)}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Region / Location Filter Section */}
          <div className="setting-group">
            <label><Globe size={16} /> Match Region</label>
            <div className="pill-grid">
              {REGION_OPTIONS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  className={`setting-pill ${country === r.id ? 'selected' : ''}`}
                  onClick={() => setCountry(r.id)}
                >
                  <span>{r.flag}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interest Tags Filter Section */}
          <div className="setting-group">
            <label><Sparkles size={16} /> Common Interests</label>
            <div className="tags-flex">
              {POPULAR_INTERESTS.map(topic => (
                <button
                  key={topic}
                  type="button"
                  className={`tag-pill ${selectedInterests.includes(topic) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(topic)}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Web Audio FX Chimes Toggle */}
          <div className="setting-group">
            <div className="toggle-row">
              <label><Volume2 size={16} /> Match Chimes & Audio FX</label>
              <button
                type="button"
                className={`toggle-switch ${soundEnabled ? 'active' : ''}`}
                onClick={() => setSoundEnabled(prev => !prev)}
                aria-label="Toggle Sound Effects"
              >
                <div className="toggle-thumb">
                  {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </div>
              </button>
            </div>
          </div>

          {/* 5. Video Preview Card */}
          <div className="preview-container">
            <video ref={previewVideoRef} autoPlay playsInline muted className="preview-video" />
            <div className="preview-label">Camera & Mic Test Preview</div>
          </div>

          {/* Camera Selection */}
          <div className="setting-group">
            <label><Video size={16} /> Camera Device</label>
            <select value={videoDeviceId} onChange={e => setVideoDeviceId(e.target.value)}>
              <option value="">Default Camera</option>
              {videoDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 4)}`}</option>)}
            </select>
          </div>

          {/* Microphone Selection */}
          <div className="setting-group">
            <label><Mic size={16} /> Microphone Device</label>
            <select value={audioDeviceId} onChange={e => setAudioDeviceId(e.target.value)}>
              <option value="">Default Microphone</option>
              {audioDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 4)}`}</option>)}
            </select>

            {/* Mic Meter Level */}
            <div className="mic-meter-container">
              <Volume2 size={15} className="mic-icon" />
              <div className="mic-meter-track">
                <div className="mic-meter-fill" style={{ width: `${audioLevel}%` }} />
              </div>
              <span className="mic-level-text">{audioLevel}%</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-primary" onClick={handleSave}>Save & Apply Filters</button>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-card { background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255,255,255,0.18); border-radius: 24px; width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; box-shadow: 0 25px 60px rgba(0,0,0,0.8); color: #f8fafc; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.12); position: sticky; top: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); z-index: 2; }
        .modal-header h3 { font-size: 1.15rem; font-weight: 800; color: #fff; }
        .modal-close-btn { color: #94a3b8; padding: 0.5rem; border-radius: 50%; background: none; border: none; cursor: pointer; transition: all 0.15s ease; }
        .modal-close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

        .pill-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 8px; }
        .setting-pill { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #cbd5e1; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.18s ease; }
        .setting-pill:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .setting-pill.selected { background: linear-gradient(135deg, #2563eb, #7c3aed); border-color: rgba(255,255,255,0.3); color: #fff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5); }

        .tags-flex { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag-pill { padding: 5px 12px; border-radius: 100px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
        .tag-pill:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .tag-pill.selected { background: rgba(59, 130, 246, 0.25); border-color: #3b82f6; color: #60a5fa; }

        .toggle-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .toggle-switch { width: 44px; height: 24px; border-radius: 100px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); position: relative; cursor: pointer; transition: all 0.2s ease; padding: 2px; }
        .toggle-switch.active { background: #2563eb; border-color: #3b82f6; }
        .toggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; color: #0f172a; transition: transform 0.2s ease; transform: translateX(0); }
        .toggle-switch.active .toggle-thumb { transform: translateX(20px); }

        .preview-container { position: relative; width: 100%; height: 160px; border-radius: 16px; overflow: hidden; background: #000; border: 1px solid rgba(255,255,255,0.16); display: flex; align-items: center; justify-content: center; }
        .preview-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .preview-label { position: absolute; bottom: 8px; left: 10px; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }

        .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .setting-group label { display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.88rem; color: #f1f5f9; }
        .setting-group select { padding: 0.75rem 1rem; border: 1px solid rgba(255,255,255,0.14); border-radius: 12px; font-size: 0.88rem; background: rgba(15, 23, 42, 0.8); color: #fff; width: 100%; outline: none; }

        .mic-meter-container { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .mic-icon { color: #60a5fa; }
        .mic-meter-track { flex: 1; height: 8px; background: rgba(255,255,255,0.1); border-radius: 100px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); }
        .mic-meter-fill { height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); transition: width 0.05s ease; border-radius: 100px; }
        .mic-level-text { font-size: 0.75rem; font-weight: 600; color: #94a3b8; width: 32px; text-align: right; }

        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); }
        .modal-btn-primary { background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; font-weight: 800; padding: 0.8rem 1.5rem; border-radius: 100px; font-size: 0.95rem; width: 100%; border: none; cursor: pointer; transition: all 0.18s ease; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.5); }
        .modal-btn-primary:active { transform: scale(0.98); }

        @media (max-width: 480px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-card { border-radius: 24px 24px 0 0; max-height: 85vh; }
        }
      `}</style>
    </div>
  );
};
