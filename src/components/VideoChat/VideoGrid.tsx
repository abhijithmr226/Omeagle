import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, UserCheck, CameraOff, Maximize2, Minimize2, Flag, Shield, ChevronRight } from 'lucide-react';
import { ConnectionStatus } from '../../types/chat';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  onFlipCamera?: () => void;
  onReportStranger?: () => void;
  onOpenSafety?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream, remoteStream, connectionStatus, isMuted, isVideoOff, onFlipCamera, onReportStranger, onOpenSafety
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching';

  return (
    <div className="vg-wrapper" ref={containerRef}>
      {/* Mobile Stacked 2-Card Layout (reference design) */}
      <div className="vg-mobile-stack">
        {/* Top Card: Stranger Video */}
        <div className="vg-card vg-card-stranger">
          <div className="vg-card-header-overlay">
            <div className="vg-badge badge-stranger">
              <span className="dot-blue" />
              <span>Stranger</span>
            </div>
            <button className="vg-icon-btn" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="vg-feed-video" />
          ) : (
            <div className="vg-placeholder">
              {isSearching ? <RefreshCw size={44} className="spin-icon" /> :
               isConnected ? <UserCheck size={44} /> :
               <CameraOff size={44} />}
              <p>{isSearching ? 'Looking for someone to chat with...' : isConnected ? 'Connected' : 'Start video chat'}</p>
            </div>
          )}

          <div className="vg-card-footer-overlay">
            <div className="vg-footer-left">
              {onReportStranger && (
                <button className="vg-pill-btn" onClick={onReportStranger}>
                  <Flag size={14} /> <span>Report</span>
                </button>
              )}
              {onOpenSafety && (
                <button className="vg-pill-btn" onClick={onOpenSafety}>
                  <Shield size={14} /> <span>Safety</span>
                </button>
              )}
            </div>
            {onFlipCamera && (
              <button className="vg-pill-btn vg-flip-btn" onClick={onFlipCamera}>
                <RefreshCw size={14} /> <span>Flip</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Card: You Video */}
        <div className="vg-card vg-card-you">
          <div className="vg-card-header-overlay">
            <div className="vg-badge badge-you">
              <span className="dot-green" />
              <span>You</span>
            </div>
            <button className="vg-icon-btn" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {localStream && !isVideoOff ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="vg-feed-video vg-self-video" />
          ) : (
            <div className="vg-placeholder">
              <CameraOff size={36} />
              <p>{isVideoOff ? 'Camera turns off' : 'Connecting camera...'}</p>
            </div>
          )}

          <div className="vg-card-notice-overlay">
            <div className="vg-notice-pill">
              <Shield size={14} className="shield-icon" />
              <span>Be respectful and keep it friendly.</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Standard View */}
      <div className="vg-desktop-view">
        <div className="vg-remote-wrap">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="vg-remote-video" />
          ) : (
            <div className="vg-placeholder">
              {isSearching ? <RefreshCw size={48} className="spin-icon" /> :
               isConnected ? <UserCheck size={48} /> :
               <CameraOff size={48} />}
              <p>{isSearching ? 'Looking for someone to chat with...' : isConnected ? 'Connected' : 'Start video chat'}</p>
            </div>
          )}
          {isConnected && (
            <div className="vg-status-bar">
              <span className="pulse-dot-green"></span>
              <span>Connected with a Stranger</span>
            </div>
          )}
        </div>
        {localStream && (
          <div className="vg-pip-wrap">
            <video ref={localVideoRef} autoPlay playsInline muted className="vg-pip-video vg-self-video" />
          </div>
        )}
      </div>

      <style>{`
        .vg-wrapper { width: 100%; position: relative; }

        /* Desktop Layout */
        .vg-desktop-view { display: flex; position: relative; width: 100%; border-radius: var(--radius-lg); overflow: hidden; background: #0c0f14; aspect-ratio: 16/9; animation: scaleIn 0.3s ease; border: 1px solid rgba(255,255,255,0.1); }
        .vg-remote-wrap { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; background: #0c0f14; }
        .vg-remote-video { width: 100%; height: 100%; object-fit: contain; }
        .vg-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; gap: 0.75rem; text-align: center; padding: 1rem; }
        .vg-placeholder p { font-size: 0.95rem; font-weight: 500; }
        .spin-icon { animation: spin 1.5s linear infinite; color: var(--brand-blue); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vg-status-bar { position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 0.5rem; background: rgba(12,15,20,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #fff; padding: 0.45rem 0.9rem; border-radius: var(--radius-full); font-size: 0.82rem; font-weight: 600; z-index: 2; border: 1px solid rgba(255,255,255,0.12); }
        .vg-pip-wrap { position: absolute; bottom: 16px; right: 16px; width: 220px; height: 165px; border-radius: var(--radius-lg); overflow: hidden; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 8px 32px rgba(0,0,0,0.6); z-index: 3; animation: scaleIn 0.3s ease; }
        .vg-pip-video { width: 100%; height: 100%; object-fit: cover; }
        .vg-self-video { transform: scaleX(-1); }

        /* Mobile Stacked View (matches reference design) */
        .vg-mobile-stack { display: none; flex-direction: column; gap: 0.75rem; width: 100%; }
        .vg-card { position: relative; width: 100%; height: 260px; min-height: 220px; background: #12161f; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .vg-feed-video { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
        
        .vg-card-header-overlay { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; align-items: center; justify-content: space-between; z-index: 5; pointer-events: none; }
        .vg-card-header-overlay * { pointer-events: auto; }
        .vg-badge { display: flex; align-items: center; gap: 0.4rem; background: rgba(18,22,31,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; color: #fff; border: 1px solid rgba(255,255,255,0.12); }
        .dot-blue { width: 8px; height: 8px; border-radius: 50%; background-color: #3b82f6; display: inline-block; box-shadow: 0 0 8px rgba(59,130,246,0.8); }
        .dot-green { width: 8px; height: 8px; border-radius: 50%; background-color: #10b981; display: inline-block; box-shadow: 0 0 8px rgba(16,185,129,0.8); }

        .vg-icon-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: rgba(18,22,31,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #fff; border: 1px solid rgba(255,255,255,0.12); transition: background 0.2s ease; }
        .vg-icon-btn:active { background: rgba(255,255,255,0.25); }

        .vg-card-footer-overlay { position: absolute; bottom: 12px; left: 12px; right: 12px; display: flex; align-items: center; justify-content: space-between; z-index: 5; pointer-events: none; }
        .vg-card-footer-overlay * { pointer-events: auto; }
        .vg-footer-left { display: flex; align-items: center; gap: 0.5rem; }

        .vg-pill-btn { display: flex; align-items: center; gap: 0.4rem; background: rgba(18,22,31,0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 0.4rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; transition: all 0.2s ease; }
        .vg-pill-btn:active { background: rgba(255,255,255,0.25); transform: scale(0.96); }

        .vg-card-notice-overlay { position: absolute; bottom: 12px; left: 0; right: 0; display: flex; justify-content: center; z-index: 5; pointer-events: none; padding: 0 12px; }
        .vg-notice-pill { pointer-events: auto; display: flex; align-items: center; gap: 0.45rem; background: rgba(18,22,31,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.12); padding: 0.45rem 0.9rem; border-radius: 24px; font-size: 0.78rem; font-weight: 500; text-align: center; max-width: 100%; box-shadow: 0 4px 16px rgba(0,0,0,0.3); }
        .shield-icon { color: #94a3b8; flex-shrink: 0; }

        @media (max-width: 1024px) {
          .vg-desktop-view { display: none; }
          .vg-mobile-stack { display: flex; }
        }

        @media (max-width: 480px) {
          .vg-card { height: calc((100dvh - 270px) / 2); min-height: 200px; max-height: 280px; }
        }
      `}</style>
    </div>
  );
};
