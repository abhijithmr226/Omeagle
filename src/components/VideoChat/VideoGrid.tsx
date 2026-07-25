import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, UserCircle2, CameraOff, Maximize2, Minimize2, Flag, RotateCcw, Expand, Shrink, Sparkles, ChevronLeft } from 'lucide-react';
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
  onNext?: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream, remoteStream, connectionStatus, isMuted, isVideoOff,
  onFlipCamera, onReportStranger, onNext,
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFitMode, setObjectFitMode] = useState<'contain' | 'cover'>('contain');
  const [pipCorner, setPipCorner] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');
  const [activeFilter, setActiveFilter] = useState<'normal' | 'beauty' | 'vibrant' | 'cyber' | 'vintage'>('normal');

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
      wrapperRef.current?.requestFullscreen?.().catch(() => { });
    } else {
      document.exitFullscreen?.().catch(() => { });
    }
  };

  const toggleObjectFit = () => {
    setObjectFitMode(prev => prev === 'cover' ? 'contain' : 'cover');
  };

  const cycleFilter = () => {
    const filters: Array<'normal' | 'beauty' | 'vibrant' | 'cyber' | 'vintage'> = ['normal', 'beauty', 'vibrant', 'cyber', 'vintage'];
    const nextIdx = (filters.indexOf(activeFilter) + 1) % filters.length;
    setActiveFilter(filters[nextIdx]);
  };

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.action-pill')) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    if (deltaX < 0) {
      setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    if (swipeOffset < -60 && onNext) {
      onNext();
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div className="omegle-vg-wrapper" ref={wrapperRef}>
      {/* ── Stranger Panel (Classic 4:3 Omegle Video Box) ─────── */}
      <div
        className="omegle-panel stranger-panel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined }}
      >
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className={`omegle-video ${remoteStream ? 'video-on' : ''} fit-${objectFitMode} filter-${activeFilter} ${isSearching ? 'video-blur' : ''}`}
        />

        {!remoteStream && (
          <div className="omegle-placeholder">
            {isSearching ? (
              <RefreshCw size={38} className="spin-icon blue-spin" />
            ) : (
              <UserCircle2 size={48} className="idle-icon" />
            )}
            <p className="placeholder-text">
              {isSearching ? 'Looking for a stranger…' : 'Waiting for a stranger'}
            </p>
          </div>
        )}

        {/* Top Overlay Badge & Actions */}
        <div className="panel-overlay-top">
          <div className="status-badge">
            <span className={`dot ${isConnected ? 'dot-live' : 'dot-idle'}`} />
            <span>Stranger</span>
          </div>

          <div className="action-buttons">
            <button className="action-pill" onClick={cycleFilter} title={`Filter: ${activeFilter}`}>
              <Sparkles size={13} className={activeFilter !== 'normal' ? 'sparkle-active' : ''} />
              <span className="capitalize">{activeFilter}</span>
            </button>
            <button className="action-pill" onClick={toggleObjectFit} title={objectFitMode === 'cover' ? 'Fit' : 'Fill'}>
              {objectFitMode === 'cover' ? <Shrink size={13} /> : <Expand size={13} />}
              <span>{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
            </button>
            {isConnected && onReportStranger && (
              <button className="action-pill report-btn" onClick={onReportStranger} title="Report">
                <Flag size={13} /><span>Report</span>
              </button>
            )}
            <button className="action-pill icon-only" onClick={toggleFullscreen} title="Fullscreen">
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── You Panel (Classic 4:3 Omegle Video Box) ────────── */}
      <div className="omegle-panel you-panel">
        <video
          ref={localVideoRef}
          autoPlay playsInline muted
          className={`omegle-video video-mirror ${localStream && !isVideoOff ? 'video-on' : ''} fit-${objectFitMode} filter-${activeFilter}`}
        />

        {(!localStream || isVideoOff) && (
          <div className="omegle-placeholder">
            <CameraOff size={32} className="idle-icon" />
            <p className="placeholder-text">{isVideoOff ? 'Camera is off' : 'Starting camera…'}</p>
          </div>
        )}

        <div className="panel-overlay-top">
          <div className="status-badgeyou">
            <span className="dot dot-you" />
            <span>You</span>
          </div>

          {onFlipCamera && localStream && (
            <button className="action-pill" onClick={onFlipCamera} title="Flip Camera">
              <RotateCcw size={13} /><span>Flip</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        /* ── Classic Omegle Dual 4:3 Video Layout ──────────────── */
        .omegle-vg-wrapper {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          user-select: none;
        }

        .omegle-panel {
          position: relative;
          width: 100%;
          height: 265px;
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-md, 12px);
          overflow: hidden;
          background: var(--bg-video-frame, #0f172a);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease-out;
        }

        .omegle-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #090d14;
          opacity: 0;
          transition: opacity 0.3s ease, filter 0.3s ease;
          display: block;
        }
        .fit-contain { object-fit: contain !important; }
        .fit-cover   { object-fit: cover !important; }
        .video-on    { opacity: 1; }
        .video-mirror { transform: scaleX(-1); }
        .video-blur  { filter: blur(16px) brightness(0.6); }

        /* AI Filters */
        .filter-beauty  { filter: contrast(1.08) brightness(1.05) saturate(1.1) blur(0.2px); }
        .filter-vibrant { filter: sepia(0.18) saturate(1.4) contrast(1.1); }
        .filter-cyber   { filter: hue-rotate(170deg) saturate(1.5) contrast(1.2); }
        .filter-vintage { filter: grayscale(1) contrast(1.2); }
        .sparkle-active { color: #f59e0b; }
        .capitalize { text-transform: capitalize; }

        /* Placeholder */
        .omegle-placeholder {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 1rem;
          text-align: center;
          pointer-events: none;
        }
        .idle-icon { color: var(--text-muted, #64748b); }
        .blue-spin { color: var(--brand-blue, #3b82f6); animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .placeholder-text { font-size: 0.88rem; font-weight: 600; color: var(--text-secondary, #94a3b8); }

        /* Overlay Header */
        .panel-overlay-top {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        .status-badge, .status-badgeyou {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          pointer-events: auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .dot { width: 7px; height: 7px; border-radius: 50%; }
        .dot-live { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.9); }
        .dot-idle { background: #64748b; }
        .dot-you  { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.9); }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 5px;
          pointer-events: auto;
        }

        .action-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .action-pill:hover { background: rgba(255,255,255,0.2); }
        .icon-only { padding: 4px 7px; }
        .report-btn { color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }

        /* ── Mobile Responsive Stacked Adjustment ───────────── */
        @media (max-width: 768px) {
          .omegle-panel {
            height: 220px;
            aspect-ratio: auto;
          }
        }
      `}</style>
    </div>
  );
};
