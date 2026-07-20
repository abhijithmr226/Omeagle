import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, UserCircle2, CameraOff, Maximize2, Minimize2, Flag, RotateCcw } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';

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
  localStream, remoteStream, connectionStatus, isMuted, isVideoOff,
  onFlipCamera, onReportStranger,
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const wrapperRef     = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const isConnected  = connectionStatus === 'connected';
  const isSearching  = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div className="vg-root" ref={wrapperRef}>

      {/* ── Stranger panel (top / larger) ─────────────────────── */}
      <div className="vg-panel vg-panel-stranger">
        {/* label */}
        <div className="vg-label">
          <span className={`vg-dot ${isConnected ? 'dot-live' : 'dot-idle'}`} />
          Stranger
        </div>

        {/* video / placeholder */}
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className={`vg-video ${remoteStream ? 'vg-video-visible' : ''}`}
        />

        {!remoteStream && (
          <div className="vg-placeholder">
            {isSearching
              ? <RefreshCw size={40} className="vg-spin-icon" />
              : <UserCircle2 size={48} className="vg-idle-icon" />}
            <p className="vg-placeholder-text">
              {isSearching ? 'Finding someone…' : 'Waiting for a stranger'}
            </p>
          </div>
        )}

        {/* top-right actions */}
        <div className="vg-actions-tr">
          {onReportStranger && isConnected && (
            <button className="vg-action-btn" onClick={onReportStranger} title="Report">
              <Flag size={15} />
              <span>Report</span>
            </button>
          )}
          <button className="vg-action-btn vg-action-icon-only" onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* connected badge */}
        {isConnected && (
          <div className="vg-connected-badge">
            <span className="vg-dot dot-live" />
            Connected
          </div>
        )}
      </div>

      {/* ── You panel (bottom / smaller) ───────────────────────── */}
      <div className="vg-panel vg-panel-you">
        {/* label */}
        <div className="vg-label">
          <span className="vg-dot dot-you" />
          You
        </div>

        <video
          ref={localVideoRef}
          autoPlay playsInline muted
          className={`vg-video vg-video-mirror ${localStream && !isVideoOff ? 'vg-video-visible' : ''}`}
        />

        {(!localStream || isVideoOff) && (
          <div className="vg-placeholder">
            <CameraOff size={32} className="vg-idle-icon" />
            <p className="vg-placeholder-text">
              {isVideoOff ? 'Camera off' : 'Starting camera…'}
            </p>
          </div>
        )}

        {/* flip camera */}
        {onFlipCamera && localStream && (
          <div className="vg-actions-tr">
            <button className="vg-action-btn vg-action-icon-only" onClick={onFlipCamera} title="Flip camera">
              <RotateCcw size={15} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ─── Root ─────────────────────────────────────────── */
        .vg-root {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        /* ─── Panel shared ─────────────────────────────────── */
        .vg-panel {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 12px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 24px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Stranger: taller — 16:10 ratio feel */
        .vg-panel-stranger { height: 300px; }
        .vg-panel-you      { height: 196px; }

        /* Grow panels on taller viewports */
        @media (min-height: 800px) {
          .vg-panel-stranger { height: 340px; }
          .vg-panel-you      { height: 224px; }
        }
        @media (min-height: 900px) {
          .vg-panel-stranger { height: 380px; }
          .vg-panel-you      { height: 252px; }
        }

        /* ─── Video ────────────────────────────────────────── */
        .vg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .vg-video-visible { opacity: 1; }
        .vg-video-mirror  { transform: scaleX(-1); }

        /* ─── Placeholder ──────────────────────────────────── */
        .vg-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #475569;
          padding: 1.5rem;
          text-align: center;
          z-index: 1;
        }
        .vg-idle-icon  { color: #1e293b; }
        .vg-spin-icon  { color: #2563eb; animation: vg-spin 1.4s linear infinite; }
        .vg-placeholder-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #475569;
          letter-spacing: 0.01em;
        }
        @keyframes vg-spin { to { transform: rotate(360deg); } }

        /* ─── Label (top-left) ─────────────────────────────── */
        .vg-label {
          position: absolute;
          top: 10px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 4px 10px 4px 8px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.02em;
          pointer-events: none;
          text-transform: uppercase;
        }

        .vg-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-live { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.8); }
        .dot-idle { background: #475569; }
        .dot-you  { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.7); }

        /* ─── Top-right action buttons ─────────────────────── */
        .vg-actions-tr {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .vg-action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #e2e8f0;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          white-space: nowrap;
        }
        .vg-action-btn:hover  { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.25); }
        .vg-action-btn:active { transform: scale(0.95); }
        .vg-action-icon-only  { padding: 5px 8px; }

        /* ─── Connected badge (bottom-left of stranger panel) ── */
        .vg-connected-badge {
          position: absolute;
          bottom: 10px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 20px;
          padding: 4px 10px 4px 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #86efac;
          letter-spacing: 0.02em;
          pointer-events: none;
          animation: vg-fadein 0.4s ease;
        }
        @keyframes vg-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* ─── Fullscreen tweaks ────────────────────────────── */
        :fullscreen .vg-root { background: #000; gap: 0; border-radius: 0; }
        :fullscreen .vg-panel { border-radius: 0; border: none; }
      `}</style>
    </div>
  );
};
