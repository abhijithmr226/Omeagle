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
  const [objectFitMode, setObjectFitMode] = useState<'contain' | 'cover'>('cover');
  const [pipCorner, setPipCorner] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const cyclePipCorner = () => {
    const corners: Array<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'> = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    const idx = corners.indexOf(pipCorner);
    setPipCorner(corners[(idx + 1) % corners.length]);
  };

  const [activeFilter, setActiveFilter] = useState<'normal' | 'beauty' | 'vibrant' | 'cyber' | 'vintage'>('normal');

  const cycleFilter = () => {
    const filters: Array<'normal' | 'beauty' | 'vibrant' | 'cyber' | 'vintage'> = ['normal', 'beauty', 'vibrant', 'cyber', 'vintage'];
    const nextIdx = (filters.indexOf(activeFilter) + 1) % filters.length;
    setActiveFilter(filters[nextIdx]);
  };

  // Touch Swipe Gesture (Swipe Left / Swipe Up for Next Stranger like Azar Live)
  const handleTouchStart = (e: React.TouchEvent) => {
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
    if (swipeOffset < -70 && onNext) {
      onNext();
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div
      className="azar-vg-root"
      ref={wrapperRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateX(${swipeOffset}px)` }}
    >
      {/* ── Main Full-Screen Stranger Feed ──────────────────── */}
      <div className="azar-stranger-panel">
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className={`azar-video ${remoteStream ? 'azar-video-on' : ''} azar-fit-${objectFitMode} azar-filter-${activeFilter} ${isSearching ? 'azar-blur' : ''}`}
        />

        {!remoteStream && (
          <div className="azar-placeholder">
            {isSearching ? (
              <div className="azar-radar-circle">
                <RefreshCw size={44} className="azar-spin" />
                <div className="azar-radar-pulse" />
              </div>
            ) : (
              <UserCircle2 size={56} className="azar-idle-icon" />
            )}
            <p className="azar-ph-text">
              {isSearching ? 'Finding someone interesting…' : 'Tap Start or Swipe to connect'}
            </p>
            {isSearching && <span className="azar-ph-sub">Searching global live queue</span>}
          </div>
        )}

        {/* Top-Left Status Pill */}
        <div className="azar-top-badge">
          <span className={`azar-dot ${isConnected ? 'azar-dot-live' : 'azar-dot-idle'}`} />
          <span className="azar-badge-title">{isConnected ? 'Stranger' : 'Connecting'}</span>
        </div>

        {/* Top-Right Action Controls */}
        <div className="azar-top-actions">
          <button className="azar-pill-btn" onClick={cycleFilter} title={`Current filter: ${activeFilter}. Click to cycle`}>
            <Sparkles size={14} className={activeFilter !== 'normal' ? 'sparkle-active' : ''} />
            <span className="capitalize">{activeFilter}</span>
          </button>

          <button
            className="azar-pill-btn"
            onClick={toggleObjectFit}
            title={objectFitMode === 'cover' ? 'Show Letterbox (Fit)' : 'Fill Screen (Cover)'}
          >
            {objectFitMode === 'cover' ? <Shrink size={14} /> : <Expand size={14} />}
            <span>{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {isConnected && onReportStranger && (
            <button className="azar-pill-btn azar-report-btn" onClick={onReportStranger} title="Report Stranger">
              <Flag size={14} /><span>Report</span>
            </button>
          )}

          <button className="azar-pill-btn azar-icon-only" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Swipe Hint overlay on edge */}
        <div className="azar-swipe-hint">
          <ChevronLeft size={16} className="azar-hint-arrow" />
          <span>Swipe left to skip</span>
        </div>
      </div>

      {/* ── Floating Self-View PIP (Picture-in-Picture) ────── */}
      <div
        className={`azar-pip-card azar-pip-${pipCorner}`}
        onClick={cyclePipCorner}
        title="Click to move corner"
      >
        <video
          ref={localVideoRef}
          autoPlay playsInline muted
          className={`azar-pip-video azar-mirror ${localStream && !isVideoOff ? 'azar-video-on' : ''}`}
        />

        {(!localStream || isVideoOff) && (
          <div className="azar-pip-placeholder">
            <CameraOff size={20} className="azar-idle-icon" />
          </div>
        )}

        <div className="azar-pip-label">You</div>

        {onFlipCamera && localStream && (
          <button
            className="azar-pip-flip-btn"
            onClick={(e) => { e.stopPropagation(); onFlipCamera(); }}
            title="Flip Camera"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      <style>{`
        /* ── Azar Live Immersive Full-Screen Layout ─────────────────── */
        .azar-vg-root {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          border-radius: 18px;
          overflow: hidden;
          background: #090d14;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          transition: transform 0.15s ease-out;
          touch-action: pan-y;
          user-select: none;
        }

        .azar-stranger-panel {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Video element: full screen cover mode by default */
        .azar-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-position: center center;
          background: #000;
          opacity: 0;
          transition: opacity 0.3s ease, filter 0.4s ease;
        }
        .azar-fit-cover   { object-fit: cover !important; }
        .azar-fit-contain { object-fit: contain !important; }
        .azar-video-on    { opacity: 1; }
        .azar-blur        { filter: blur(20px) brightness(0.6); scale: 1.05; }
        .azar-mirror      { transform: scaleX(-1); }

        /* AI Video Filters */
        .azar-filter-beauty  { filter: contrast(1.08) brightness(1.06) saturate(1.1) blur(0.2px); }
        .azar-filter-vibrant { filter: sepia(0.18) saturate(1.45) contrast(1.12); }
        .azar-filter-cyber   { filter: hue-rotate(170deg) saturate(1.5) contrast(1.2); }
        .azar-filter-vintage { filter: grayscale(1) contrast(1.25) brightness(0.95); }
        .sparkle-active { color: #f59e0b; }
        .capitalize { text-transform: capitalize; }


        /* Placeholder & Matching Radar */
        .azar-placeholder {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 2rem;
          text-align: center;
          pointer-events: none;
        }
        .azar-idle-icon { color: #475569; }
        .azar-radar-circle {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.15);
        }
        .azar-spin {
          color: #3b82f6;
          animation: azar-spin 1.2s linear infinite;
        }
        .azar-radar-pulse {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.5);
          animation: azar-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes azar-spin { to { transform: rotate(360deg); } }
        @keyframes azar-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .azar-ph-text {
          font-size: 1rem;
          font-weight: 700;
          color: #f8fafc;
          text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        }
        .azar-ph-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Top Bar Badges & Controls */
        .azar-top-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .azar-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .azar-dot-live { background: #22c55e; box-shadow: 0 0 10px rgba(34,197,94,0.9); }
        .azar-dot-idle { background: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.9); }

        .azar-top-actions {
          position: absolute;
          top: 14px;
          right: 130px; /* Leave space for PIP card on top right */
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .azar-pill-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #f1f5f9;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .azar-pill-btn:hover { background: rgba(255,255,255,0.25); }
        .azar-icon-only { padding: 6px 8px; }
        .azar-report-btn { color: #fca5a5; border-color: rgba(239, 68, 68, 0.4); }

        /* Swipe hint indicator on right side */
        .azar-swipe-hint {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 100px;
          color: rgba(255,255,255,0.7);
          font-size: 0.72rem;
          font-weight: 600;
          pointer-events: none;
          animation: azar-swipe-bounce 2s infinite;
        }
        @keyframes azar-swipe-bounce {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(-6px); }
        }
        .azar-hint-arrow { animation: azar-arrow-pulse 1.2s infinite; }
        @keyframes azar-arrow-pulse {
          0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
        }

        /* ── Floating Self View PIP Card ─────────────────────── */
        .azar-pip-card {
          position: absolute;
          z-index: 20;
          width: 100px;
          height: 135px;
          border-radius: 14px;
          overflow: hidden;
          background: #000;
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .azar-pip-card:hover {
          transform: scale(1.05);
          border-color: #3b82f6;
        }
        .azar-pip-top-right    { top: 14px; right: 14px; }
        .azar-pip-top-left     { top: 14px; left: 14px; }
        .azar-pip-bottom-right { bottom: 80px; right: 14px; }
        .azar-pip-bottom-left  { bottom: 80px; left: 14px; }

        .azar-pip-video {
          width: 100%;
          height: 100%;
          object-fit: cover !important;
        }
        .azar-pip-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
        }
        .azar-pip-label {
          position: absolute;
          bottom: 4px;
          left: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #fff;
          background: rgba(0,0,0,0.6);
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .azar-pip-flip-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .azar-top-actions { right: 120px; }
          .azar-pip-card { width: 90px; height: 120px; }
        }
      `}</style>
    </div>
  );
};
