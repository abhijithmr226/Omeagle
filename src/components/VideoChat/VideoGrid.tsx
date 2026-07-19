import React, { useRef, useEffect } from 'react';
import { RefreshCw, UserCheck, CameraOff } from 'lucide-react';
import { ConnectionStatus } from '../../types/chat';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  onFlipCamera?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream, remoteStream, connectionStatus, isMuted, isVideoOff, onFlipCamera
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching';

  return (
    <div className="vg-container">
      <div className="vg-remote-wrap">
        {remoteStream ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="vg-remote-video" />
        ) : (
          <div className="vg-placeholder">
            {isSearching ? <RefreshCw size={48} className="spin-icon" /> :
             isConnected ? <UserCheck size={48} /> :
             <CameraOff size={48} />}
            <p>{isSearching ? 'Looking for someone...' : isConnected ? 'Connected' : 'Start a chat'}</p>
          </div>
        )}
        {isConnected && <div className="vg-status-bar"><span className="pulse-dot-green"></span> Connected</div>}
      </div>
      {localStream && (
        <div className="vg-pip-wrap">
          <video ref={localVideoRef} autoPlay playsInline muted className="vg-pip-video" />
        </div>
      )}
      <style>{`
        .vg-container { position: relative; width: 100%; border-radius: var(--radius-lg); overflow: hidden; background: #000; aspect-ratio: 16/9; }
        .vg-remote-wrap { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; background: #000; }
        .vg-remote-video { width: 100%; height: 100%; object-fit: contain; }
        .vg-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #888; gap: 1rem; }
        .vg-placeholder p { font-size: 0.95rem; }
        .spin-icon { animation: spin 1.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vg-status-bar { position: absolute; top: 12px; left: 12px; display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.6); color: #fff; padding: 0.4rem 0.8rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; z-index: 2; }
        .vg-pip-wrap { position: absolute; bottom: 16px; right: 16px; width: 220px; height: 165px; border-radius: var(--radius-lg); overflow: hidden; border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 3; cursor: grab; }
        .vg-pip-video { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 1024px) {
          .vg-container { border-radius: var(--radius-md); aspect-ratio: auto; flex: 1; height: calc(100dvh - 220px); min-height: 260px; max-height: calc(100dvh - 140px); }
          .vg-pip-wrap { width: 130px; height: 97px; bottom: 12px; right: 12px; }
          .vg-status-bar { top: 8px; left: 8px; font-size: 0.75rem; padding: 0.3rem 0.6rem; }
        }

        @media (max-width: 480px) {
          .vg-container { border-radius: var(--radius-sm); height: calc(100dvh - 200px); min-height: 220px; }
          .vg-pip-wrap { width: 100px; height: 75px; bottom: 8px; right: 8px; border-radius: var(--radius-sm); border-width: 1.5px; }
          .vg-placeholder svg { width: 36px; height: 36px; }
          .vg-placeholder p { font-size: 0.85rem; }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .vg-container { height: calc(100dvh - 100px); min-height: 180px; }
          .vg-pip-wrap { width: 90px; height: 67px; bottom: 6px; right: 6px; }
        }
      `}</style>
    </div>
  );
};
