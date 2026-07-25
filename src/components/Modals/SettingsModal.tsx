import React, { useState, useEffect, useRef } from 'react';
import { X, Video, Mic, Volume2 } from 'lucide-react';
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
          <h3>Media & Device Settings</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="modal-body">
          {/* Video Preview Card */}
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
          <button className="modal-btn-primary" onClick={handleSave}>Save & Apply</button>
        </div>
      </div>

      <style>{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
        .modal-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); width: 100%; max-width: 440px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-xl); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; background: var(--bg-surface); z-index: 2; }
        .modal-header h3 { font-size: 1.15rem; font-weight: 700; }
        .modal-close-btn { color: var(--text-secondary); padding: 0.5rem; border-radius: var(--radius-md); }
        .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

        .preview-container { position: relative; width: 100%; height: 180px; border-radius: 14px; overflow: hidden; background: #000; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; }
        .preview-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .preview-label { position: absolute; bottom: 8px; left: 10px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; }

        .setting-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .setting-group label { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
        .setting-group select { padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.95rem; background: var(--bg-surface-secondary); color: var(--text-primary); width: 100%; outline: none; }

        .mic-meter-container { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .mic-icon { color: var(--brand-blue); }
        .mic-meter-track { flex: 1; height: 8px; background: var(--bg-surface-secondary); border-radius: 100px; overflow: hidden; border: 1px solid var(--border-color); }
        .mic-meter-fill { height: 100%; background: linear-gradient(90deg, #10b981, #3b82f6); transition: width 0.05s ease; border-radius: 100px; }
        .mic-level-text { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); width: 32px; text-align: right; }

        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: var(--bg-surface); }
        .modal-btn-primary { background: var(--brand-blue); color: #fff; font-weight: 700; padding: 0.8rem 1.5rem; border-radius: var(--radius-md); font-size: 1rem; width: 100%; border: none; cursor: pointer; transition: all 0.15s ease; }
        .modal-btn-primary:active { transform: scale(0.98); background: var(--brand-blue-hover); }

        @media (max-width: 480px) {
          .modal-overlay { align-items: flex-end; padding: 0; }
          .modal-card { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-height: 85vh; }
        }
      `}</style>
    </div>
  );
};
