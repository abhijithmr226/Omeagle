import React, { useRef, useEffect } from 'react';
import { Globe, Maximize2, Minimize2, Flag, ShieldCheck, RefreshCw, UserCheck, Camera, CameraOff, X } from 'lucide-react';
import { ConnectionStatus, StrangerProfile } from '../../types/chat';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionStatus: ConnectionStatus;
  strangerProfile: StrangerProfile | null;
  isMuted: boolean;
  isVideoOff: boolean;
  onOpenReport: () => void;
  onOpenSafety: () => void;
  onFlipCamera?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream, remoteStream, connectionStatus, strangerProfile,
  isMuted, isVideoOff, onOpenReport, onOpenSafety, onFlipCamera
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const toggleFullscreen = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if (!document.fullscreenElement) el.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }
  };

  const statusText = connectionStatus === 'connected'
    ? "You're now chatting with a random stranger"
    : connectionStatus === 'searching' ? 'Looking for someone...'
    : 'Click Start to begin';

  return (
    <div className="vg-container">
      {/* Status bar */}
      <div className="vg-status-bar">
        <span className="vg-pulse"></span>
        <span className="vg-status-text">{statusText}</span>
      </div>

      {/* Remote video — fills the space */}
      <div className="vg-remote-wrap" id="remote-video-box">
        {connectionStatus === 'connected' && remoteStream ? (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="vg-remote-video" />
            <div className="vg-badge vg-stranger-badge">
              <span className="vg-dot vg-blue-dot"></span>
              <span>Stranger</span>
            </div>
            {/* Top-right overlay actions */}
            <div className="vg-remote-actions">
              <button className="vg-overlay-btn" onClick={() => toggleFullscreen('remote-video-box')} title="Fullscreen">
                <Maximize2 size={15} />
              </button>
              <button className="vg-overlay-btn" onClick={onOpenReport} title="Report">
                <Flag size={15} />
              </button>
            </div>
          </>
        ) : (
          <div className="vg-waiting-state">
            <div className="vg-globe-wrap">
              <Globe size={48} />
            </div>
            <h3 className="vg-waiting-title">
              {connectionStatus === 'searching' ? 'Finding a stranger...' : 'Ready to start'}
            </h3>
            <p className="vg-waiting-desc">
              {connectionStatus === 'searching' ? 'Please wait while we connect you' : 'Tap Start below to begin'}
            </p>
            {connectionStatus === 'searching' && (
              <div className="vg-dots"><span>.</span><span>.</span><span>.</span></div>
            )}
          </div>
        )}
      </div>

      {/* Local video — floating pip */}
      <div className="vg-pip-wrap" id="local-video-box">
        {localStream && !isVideoOff ? (
          <video ref={localVideoRef} autoPlay playsInline muted className="vg-pip-video" />
        ) : (
          <div className="vg-pip-placeholder">
            {isVideoOff ? <CameraOff size={22} /> : <UserCheck size={22} />}
          </div>
        )}
        <div className="vg-badge vg-you-badge">
          <span className="vg-dot vg-green-dot"></span>
          <span>You</span>
        </div>
        {/* Pip actions */}
        <div className="vg-pip-actions">
          <button className="vg-pip-btn" onClick={() => toggleFullscreen('local-video-box')} title="Fullscreen">
            <Maximize2 size={13} />
          </button>
          {onFlipCamera && (
            <button className="vg-pip-btn" onClick={onFlipCamera} title="Flip Camera">
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .vg-container { display: flex; flex-direction: column; gap: 0; width: 100%; height: 100%; position: relative; }

        /* Status bar */
        .vg-status-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.85rem; background: var(--bg-surface-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 600; color: var(--text-primary); flex-shrink: 0; }
        .vg-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--status-green); animation: vgPulse 2s ease-in-out infinite; flex-shrink: 0; }
        .vg-status-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Remote video — fills space */
        .vg-remote-wrap { position: relative; flex: 1; min-height: 0; background: #000; border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .vg-remote-video { width: 100%; height: 100%; object-fit: cover; }

        /* Waiting state */
        .vg-waiting-state { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; padding: 2rem; text-align: center; width: 100%; height: 100%; }
        .vg-globe-wrap { color: #64748b; margin-bottom: 1rem; animation: vgSpin 4s linear infinite; }
        .vg-waiting-title { font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem; }
        .vg-waiting-desc { font-size: 0.85rem; color: #94a3b8; }
        .vg-dots { font-size: 2rem; line-height: 1; margin-top: 0.5rem; letter-spacing: 4px; color: var(--brand-blue); }

        /* Badges */
        .vg-badge { position: absolute; background: rgba(15,23,42,0.8); backdrop-filter: blur(8px); padding: 4px 10px; border-radius: var(--radius-full); display: flex; align-items: center; gap: 0.3rem; color: #fff; font-size: 0.72rem; font-weight: 600; z-index: 10; }
        .vg-stranger-badge { bottom: 12px; left: 12px; }
        .vg-you-badge { bottom: 6px; left: 6px; font-size: 0.65rem; padding: 2px 7px; }
        .vg-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .vg-green-dot { background: var(--status-green); }
        .vg-blue-dot { background: var(--brand-blue); }

        /* Remote top-right actions */
        .vg-remote-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 0.35rem; z-index: 10; }
        .vg-overlay-btn { background: rgba(15,23,42,0.7); backdrop-filter: blur(6px); color: #fff; padding: 6px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .vg-overlay-btn:hover { background: rgba(15,23,42,0.95); }

        /* Local pip — floating bottom-right */
        .vg-pip-wrap { position: absolute; bottom: 12px; right: 12px; width: 120px; height: 85px; border-radius: var(--radius-md); overflow: hidden; border: 2px solid rgba(255,255,255,0.25); box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 20; background: #1e293b; }
        .vg-pip-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .vg-pip-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #64748b; background: #0f172a; }
        .vg-pip-actions { position: absolute; top: 3px; right: 3px; display: flex; gap: 2px; z-index: 10; }
        .vg-pip-btn { background: rgba(15,23,42,0.75); color: #fff; padding: 3px; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
        .vg-pip-btn:hover { background: rgba(15,23,42,0.95); }

        /* Animations */
        @keyframes vgPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes vgSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Desktop overrides */
        @media (min-width: 869px) {
          .vg-pip-wrap { width: 180px; height: 125px; bottom: 16px; right: 16px; border-radius: var(--radius-lg); }
          .vg-pip-video { transform: scaleX(-1); }
        }

        /* Mobile — full immersive */
        @media (max-width: 868px) {
          .vg-container { gap: 0; }
          .vg-status-bar { border-radius: 0; border-left: none; border-right: none; border-top: none; font-size: 0.75rem; padding: 0.4rem 0.7rem; }
          .vg-remote-wrap { border-radius: 0; min-height: calc(100dvh - 180px); }
          .vg-pip-wrap { width: 100px; height: 70px; bottom: 10px; right: 10px; border-width: 1.5px; }
          .vg-pip-actions { display: none; }
          .vg-stranger-badge { bottom: 8px; left: 8px; }
          .vg-badge { font-size: 0.65rem; padding: 3px 8px; }
          .vg-overlay-btn { padding: 5px; }
        }

        @media (max-width: 480px) {
          .vg-pip-wrap { width: 85px; height: 60px; bottom: 8px; right: 8px; }
          .vg-remote-wrap { min-height: calc(100dvh - 160px); }
        }
      `}</style>
    </div>
  );
};
