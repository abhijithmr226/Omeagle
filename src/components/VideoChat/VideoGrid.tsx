import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, UserCircle2, CameraOff, Maximize2, Minimize2, Flag, RotateCcw, Expand, Shrink } from 'lucide-react';
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
  const [objectFitMode, setObjectFitMode] = useState<'contain' | 'cover'>('contain');

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

  const toggleObjectFit = () => {
    setObjectFitMode(prev => prev === 'cover' ? 'contain' : 'cover');
  };

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div className="vg-root" ref={wrapperRef}>

      {/* ── Stranger panel (Classic 4:3 Omegle ratio) ──────────── */}
      <div className="vg-panel vg-stranger">
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className={`vg-video ${remoteStream ? 'vg-video-on' : ''} vg-fit-${objectFitMode}`}
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
          <button
            className="vg-btn vg-btn-icon"
            onClick={toggleObjectFit}
            title={objectFitMode === 'cover' ? 'Switch to Fit (Show Letterbox)' : 'Switch to Cover (Fill Box)'}
          >
            {objectFitMode === 'cover' ? <Shrink size={14} /> : <Expand size={14} />}
            <span className="vg-btn-text-mobile">{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {isConnected && onReportStranger && (
            <button className="vg-btn" onClick={onReportStranger}>
              <Flag size={13} /><span>Report</span>
            </button>
          )}
          <button className="vg-btn vg-btn-icon" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {isConnected && (
          <div className="vg-live-badge">
            <span className="vg-dot vg-dot-live" />Connected
          </div>
        )}
      </div>

      {/* ── You panel (Classic 4:3 Omegle ratio) ───────────── */}
      <div className="vg-panel vg-you">
        <video
          ref={localVideoRef}
          autoPlay playsInline muted
          className={`vg-video vg-mirror ${localStream && !isVideoOff ? 'vg-video-on' : ''} vg-fit-${objectFitMode}`}
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
            <button className="vg-btn vg-btn-icon" onClick={onFlipCamera} title="Flip Camera">
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* ── Classic Omegle 4:3 Video Layout ─────────────────── */
        .vg-root {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Panels (Standard 4:3 Omegle aspect ratio) ───────── */
        .vg-panel {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          border-radius: 10px;
          background: #000000;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        /* ── Video element (default contain = 100% full uncropped video) ── */
        .vg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain !important;
          object-position: center center;
          background: #000;
          opacity: 0;
          transition: opacity 0.3s ease;
          display: block;
        }
        .vg-fit-contain { object-fit: contain !important; }
        .vg-fit-cover   { object-fit: cover !important; }

        .vg-video-on { opacity: 1; }
        /* Local feed: mirror transform */
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
        .vg-idle-icon { color: #334155; }
        .vg-spin {
          color: var(--brand-blue);
          animation: vg-spin 1.2s linear infinite;
        }
        @keyframes vg-spin { to { transform: rotate(360deg); } }
        .vg-ph-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        /* ── Label (top-left overlay) ──────────────────────── */
        .vg-label {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          pointer-events: none;
        }

        /* ── Dots ──────────────────────────────────────────── */
        .vg-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .vg-dot-live { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.9); }
        .vg-dot-idle { background: #64748b; }
        .vg-dot-you  { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.9); }

        /* ── Top-right action buttons ──────────────────────── */
        .vg-tr-actions {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .vg-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #f1f5f9;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .vg-btn:hover  { background: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.25); }
        .vg-btn:active { transform: scale(0.95); }
        .vg-btn-icon   { padding: 4px 8px; }
        .vg-btn-text-mobile { font-size: 0.72rem; }

        /* ── Connected badge (bottom-left of stranger) ─────── */
        .vg-live-badge {
          position: absolute;
          bottom: 10px;
          left: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(34,197,94,0.4);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 0.74rem;
          font-weight: 700;
          color: #4ade80;
          pointer-events: none;
          animation: vg-pop 0.3s ease;
        }
        @keyframes vg-pop {
          from { opacity: 0; transform: translateY(4px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Mobile Responsive Override ─────────────────────── */
        @media (max-width: 1024px) {
          .vg-panel { aspect-ratio: auto; flex: 1; }
        }

        /* ── Fullscreen ────────────────────────────────────── */
        :fullscreen .vg-root { gap: 0; }
        :fullscreen .vg-panel { border-radius: 0; border: none; aspect-ratio: auto; flex: 1; }
      `}</style>
    </div>
  );
};
