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

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div className="vg-root" ref={wrapperRef}>

      {/* ── Stranger panel ──────────────────────────────────── */}
      <div className="vg-panel vg-stranger">
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className={`vg-video ${remoteStream ? 'vg-video-on' : ''}`}
        />

        {!remoteStream && (
          <div className="vg-placeholder">
            {isSearching
              ? <RefreshCw size={36} className="vg-spin" />
              : <UserCircle2 size={44} className="vg-idle-icon" />}
            <p className="vg-ph-text">
              {isSearching ? 'Finding someone…' : 'Waiting for a stranger'}
            </p>
          </div>
        )}

        <div className="vg-label">
          <span className={`vg-dot ${isConnected ? 'vg-dot-live' : 'vg-dot-idle'}`} />
          Stranger
        </div>

        <div className="vg-tr-actions">
          {isConnected && onReportStranger && (
            <button className="vg-btn" onClick={onReportStranger}>
              <Flag size={13} /><span>Report</span>
            </button>
          )}
          <button className="vg-btn vg-btn-icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {isConnected && (
          <div className="vg-live-badge">
            <span className="vg-dot vg-dot-live" />Connected
          </div>
        )}
      </div>

      {/* ── You panel ───────────────────────────────────────── */}
      <div className="vg-panel vg-you">
        <video
          ref={localVideoRef}
          autoPlay playsInline muted
          className={`vg-video vg-mirror ${localStream && !isVideoOff ? 'vg-video-on' : ''}`}
        />

        {(!localStream || isVideoOff) && (
          <div className="vg-placeholder">
            <CameraOff size={28} className="vg-idle-icon" />
            <p className="vg-ph-text">
              {isVideoOff ? 'Camera off' : 'Starting camera…'}
            </p>
          </div>
        )}

        <div className="vg-label">
          <span className="vg-dot vg-dot-you" />
          You
        </div>

        {onFlipCamera && localStream && (
          <div className="vg-tr-actions">
            <button className="vg-btn vg-btn-icon" onClick={onFlipCamera} title="Flip">
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ── Root fills parent flex column ─────────────────── */
        .vg-root {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Panels ────────────────────────────────────────── */
        .vg-panel {
          position: relative;
          width: 100%;
          min-height: 0;
          overflow: hidden;
          border-radius: 10px;
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vg-stranger { flex: 3; }   /* ~60 % of available height */
        .vg-you      { flex: 2; }   /* ~40 % */

        /* ── Video element ─────────────────────────────────── */
        .vg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.35s ease;
          display: block;
        }
        .vg-video-on { opacity: 1; }
        .vg-mirror   { transform: scaleX(-1); }

        /* ── Placeholder ───────────────────────────────────── */
        .vg-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 1.25rem;
          text-align: center;
          z-index: 1;
          pointer-events: none;
        }
        .vg-idle-icon { color: #1e293b; }
        .vg-spin {
          color: #2563eb;
          animation: vg-spin 1.35s linear infinite;
        }
        @keyframes vg-spin { to { transform: rotate(360deg); } }
        .vg-ph-text {
          font-size: 0.82rem;
          font-weight: 500;
          color: #334155;
          letter-spacing: 0.01em;
        }

        /* ── Label (top-left overlay) ──────────────────────── */
        .vg-label {
          position: absolute;
          top: 9px;
          left: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.52);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 100px;
          padding: 3px 9px 3px 7px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          pointer-events: none;
        }

        /* ── Dots ──────────────────────────────────────────── */
        .vg-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .vg-dot-live { background: #22c55e; box-shadow: 0 0 5px rgba(34,197,94,0.9); }
        .vg-dot-idle { background: #334155; }
        .vg-dot-you  { background: #3b82f6; box-shadow: 0 0 5px rgba(59,130,246,0.8); }

        /* ── Top-right action buttons ──────────────────────── */
        .vg-tr-actions {
          position: absolute;
          top: 9px;
          right: 9px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .vg-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0,0,0,0.52);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 100px;
          padding: 4px 9px;
          font-size: 0.74rem;
          font-weight: 600;
          color: #cbd5e1;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .vg-btn:hover  { background: rgba(255,255,255,0.14); }
        .vg-btn:active { transform: scale(0.94); }
        .vg-btn-icon   { padding: 4px 7px; }

        /* ── Connected badge (bottom-left of stranger) ─────── */
        .vg-live-badge {
          position: absolute;
          bottom: 9px;
          left: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.52);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(34,197,94,0.28);
          border-radius: 100px;
          padding: 3px 9px 3px 7px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #86efac;
          pointer-events: none;
          animation: vg-pop 0.3s ease;
        }
        @keyframes vg-pop {
          from { opacity: 0; transform: translateY(4px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Fullscreen ────────────────────────────────────── */
        :fullscreen .vg-root { gap: 0; }
        :fullscreen .vg-panel { border-radius: 0; border: none; }
      `}</style>
    </div>
  );
};
