import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  UserCircle2,
  CameraOff,
  Maximize2,
  Minimize2,
  Flag,
  RotateCcw,
  Expand,
  Shrink,
  Sparkles,
  ShieldAlert,
  ChevronLeft,
  Sliders,
  Check
} from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';

export interface VideoGridProps {
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

type FilterMode = 'normal' | 'beauty' | 'vibrant' | 'cyber' | 'vintage';
type ObjectFitMode = 'cover' | 'contain';
type PipCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export const VideoGrid: React.FC<VideoGridProps> = React.memo(({
  localStream,
  remoteStream,
  connectionStatus,
  isMuted,
  isVideoOff,
  onFlipCamera,
  onReportStranger,
  onOpenSafety,
  onNext
}) => {
  // DOM References
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);

  // States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [objectFitMode, setObjectFitMode] = useState<ObjectFitMode>('cover');
  const [activeFilter, setActiveFilter] = useState<FilterMode>('normal');
  const [pipCorner, setPipCorner] = useState<PipCorner>('top-right');
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [pipCustomPos, setPipCustomPos] = useState<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; pipX: number; pipY: number }>({ x: 0, y: 0, pipX: 0, pipY: 0 });

  // Stream bindings
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Handlers
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const elem = containerRef.current as any;
      if (elem?.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem?.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  const toggleObjectFit = useCallback(() => {
    setObjectFitMode(prev => (prev === 'cover' ? 'contain' : 'cover'));
  }, []);

  const cycleFilter = useCallback(() => {
    const filters: FilterMode[] = ['normal', 'beauty', 'vibrant', 'cyber', 'vintage'];
    setActiveFilter(prev => {
      const idx = filters.indexOf(prev);
      return filters[(idx + 1) % filters.length];
    });
  }, []);

  const cyclePipCorner = useCallback(() => {
    setPipCustomPos(null);
    const corners: PipCorner[] = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    setPipCorner(prev => corners[(corners.indexOf(prev) + 1) % corners.length]);
  }, []);

  // Mobile Swipe Gesture to Skip Stranger
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.otv-interactive') || target.closest('.otv-pip')) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    if (deltaX < 0 && deltaY < 80) {
      setSwipeOffset(deltaX);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    if (swipeOffset < -70 && onNext) {
      onNext();
    }
    setSwipeOffset(0);
    setIsSwiping(false);
  }, [isSwiping, swipeOffset, onNext]);

  // PiP Drag & Snap to Nearest Corner
  const handlePipMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (pipRef.current && containerRef.current) {
      const pipRect = pipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        pipX: pipRect.left - containerRect.left,
        pipY: pipRect.top - containerRect.top
      };
      setIsDraggingPip(true);
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingPip || !containerRef.current || !pipRef.current) return;
      const isTouch = 'touches' in e;
      const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const containerRect = containerRef.current.getBoundingClientRect();
      const pipRect = pipRef.current.getBoundingClientRect();

      let newX = dragStartRef.current.pipX + deltaX;
      let newY = dragStartRef.current.pipY + deltaY;

      // Constrain within bounds
      newX = Math.max(12, Math.min(containerRect.width - pipRect.width - 12, newX));
      newY = Math.max(12, Math.min(containerRect.height - pipRect.height - 12, newY));

      setPipCustomPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (!isDraggingPip || !containerRef.current || !pipRef.current) return;
      setIsDraggingPip(false);

      // Snap to nearest corner
      const containerRect = containerRef.current.getBoundingClientRect();
      const pipRect = pipRef.current.getBoundingClientRect();
      const currentX = pipRect.left - containerRect.left;
      const currentY = pipRect.top - containerRect.top;

      const isRight = currentX + pipRect.width / 2 > containerRect.width / 2;
      const isBottom = currentY + pipRect.height / 2 > containerRect.height / 2;

      setPipCustomPos(null);
      if (isRight && !isBottom) setPipCorner('top-right');
      else if (isRight && isBottom) setPipCorner('bottom-right');
      else if (!isRight && isBottom) setPipCorner('bottom-left');
      else setPipCorner('top-left');
    };

    if (isDraggingPip) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingPip]);

  // Derived States
  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  const filterCssClass = useMemo(() => {
    switch (activeFilter) {
      case 'beauty': return 'otv-filter-beauty';
      case 'vibrant': return 'otv-filter-vibrant';
      case 'cyber': return 'otv-filter-cyber';
      case 'vintage': return 'otv-filter-vintage';
      default: return '';
    }
  }, [activeFilter]);

  return (
    <div
      ref={containerRef}
      className={`otv-stage ${isFullscreen ? 'otv-fullscreen' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Video Chat View"
    >
      {/* ── Main Remote Video Panel (Stranger) ──────────────── */}
      <div
        className="otv-remote-layer"
        style={{
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset}px)` : undefined,
          transition: isSwiping ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`otv-remote-video ${remoteStream ? 'otv-active' : ''} ${objectFitMode === 'contain' ? 'otv-contain' : 'otv-cover'} ${filterCssClass} ${isSearching ? 'otv-blur' : ''}`}
          aria-label="Remote Stranger Video Feed"
        />

        {/* Remote Placeholders */}
        {!remoteStream && (
          <div className="otv-placeholder">
            {isSearching ? (
              <div className="otv-radar-wrap">
                <div className="otv-radar-pulse-ring" />
                <div className="otv-radar-pulse-ring delay-1" />
                <div className="otv-radar-pulse-ring delay-2" />
                <div className="otv-radar-center">
                  <RefreshCw className="otv-spin-icon" size={36} />
                </div>
              </div>
            ) : (
              <div className="otv-avatar-wrap">
                <UserCircle2 size={72} className="otv-avatar-icon" />
              </div>
            )}

            <div className="otv-placeholder-meta">
              <h3 className="otv-ph-title">
                {isSearching ? 'Connecting with a Stranger…' : 'Ready to Meet New People'}
              </h3>
              <p className="otv-ph-sub">
                {isSearching
                  ? 'Searching global live matching queue'
                  : 'Tap Start or Swipe Left to connect instantly'}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Swipe Left Hint Bar */}
        {isConnected && (
          <div className="otv-swipe-indicator">
            <ChevronLeft size={16} className="otv-arrow-animated" />
            <span>Swipe left to skip</span>
          </div>
        )}
      </div>

      {/* ── Top Bar Control Pills ───────────────────────────── */}
      <div className="otv-header-bar">
        {/* Status Indicator */}
        <div className="otv-status-pill" role="status" aria-live="polite">
          <span className={`otv-status-dot ${isConnected ? 'otv-dot-live' : isSearching ? 'otv-dot-search' : 'otv-dot-idle'}`} />
          <span className="otv-status-text">
            {isConnected ? 'Live Match' : isSearching ? 'Searching…' : 'Idle'}
          </span>
        </div>

        {/* Quick Action Badges */}
        <div className="otv-top-actions">
          {/* Filter Dropdown Toggle */}
          <div className="otv-dropdown-wrap">
            <button
              className={`otv-action-btn ${activeFilter !== 'normal' ? 'otv-active-pill' : ''}`}
              onClick={() => setShowFilterMenu(prev => !prev)}
              title="Video Filters"
              aria-label="Toggle AI Video Filters Menu"
            >
              <Sparkles size={15} />
              <span className="otv-btn-label capitalize">{activeFilter}</span>
            </button>

            {showFilterMenu && (
              <div className="otv-filter-dropdown" onClick={e => e.stopPropagation()}>
                {(['normal', 'beauty', 'vibrant', 'cyber', 'vintage'] as FilterMode[]).map(f => (
                  <button
                    key={f}
                    className={`otv-filter-option ${activeFilter === f ? 'selected' : ''}`}
                    onClick={() => {
                      setActiveFilter(f);
                      setShowFilterMenu(false);
                    }}
                  >
                    <span className="capitalize">{f}</span>
                    {activeFilter === f && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fit / Cover Toggle */}
          <button
            className="otv-action-btn"
            onClick={toggleObjectFit}
            title={objectFitMode === 'cover' ? 'Fit Video to Screen' : 'Fill Screen'}
            aria-label="Toggle Aspect Ratio Fit Mode"
          >
            {objectFitMode === 'cover' ? <Shrink size={15} /> : <Expand size={15} />}
            <span className="otv-btn-label">{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {/* Safety Center */}
          {onOpenSafety && (
            <button
              className="otv-action-btn"
              onClick={onOpenSafety}
              title="Safety Center & Guidelines"
              aria-label="Open Safety Guidelines"
            >
              <ShieldAlert size={15} />
              <span className="otv-btn-label">Safety</span>
            </button>
          )}

          {/* Report Stranger */}
          {isConnected && onReportStranger && (
            <button
              className="otv-action-btn otv-btn-danger"
              onClick={onReportStranger}
              title="Report Inappropriate Behavior"
              aria-label="Report Stranger"
            >
              <Flag size={15} />
              <span className="otv-btn-label">Report</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            className="otv-action-btn otv-icon-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── Draggable Picture-in-Picture Self Camera ────────── */}
      <div
        ref={pipRef}
        className={`otv-pip ${!pipCustomPos ? `otv-pip-${pipCorner}` : ''} ${isDraggingPip ? 'otv-pip-dragging' : ''}`}
        style={pipCustomPos ? { left: `${pipCustomPos.x}px`, top: `${pipCustomPos.y}px`, right: 'auto', bottom: 'auto' } : undefined}
        onMouseDown={handlePipMouseDown}
        onTouchStart={handlePipMouseDown}
        onClick={cyclePipCorner}
        title="Drag to reposition or click to snap corner"
        role="region"
        aria-label="Local Camera Self-View Picture in Picture"
      >
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`otv-pip-video ${localStream && !isVideoOff ? 'otv-active' : ''} ${filterCssClass}`}
          aria-label="Your Camera Feed"
        />

        {(!localStream || isVideoOff) && (
          <div className="otv-pip-placeholder">
            <CameraOff size={22} className="otv-icon-muted" />
          </div>
        )}

        <div className="otv-pip-badge">
          <span>You</span>
          {isMuted && <span className="otv-pip-muted-tag">Muted</span>}
        </div>

        {onFlipCamera && localStream && (
          <button
            className="otv-pip-flip"
            onClick={(e) => {
              e.stopPropagation();
              onFlipCamera();
            }}
            title="Flip Camera"
            aria-label="Flip Camera Front/Back"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* ── Production Ready Scoped CSS Design System ──────── */}
      <style>{`
        /* Root Stage Container */
        .otv-stage {
          position: relative;
          width: 100%;
          height: clamp(380px, 68dvh, 760px);
          max-height: calc(100dvh - 140px);
          aspect-ratio: 16 / 9;
          border-radius: clamp(12px, 2vw, 24px);
          overflow: hidden;
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          user-select: none;
          touch-action: pan-y;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Fullscreen Viewport Override */
        .otv-stage.otv-fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
          border: none;
          z-index: 99999;
          background: #000000;
        }

        /* Remote Layer */
        .otv-remote-layer {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .otv-remote-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: #000;
          opacity: 0;
          transition: opacity 0.35s ease, filter 0.3s ease;
        }
        .otv-remote-video.otv-active {
          opacity: 1;
        }
        .otv-remote-video.otv-cover {
          object-fit: cover !important;
        }
        .otv-remote-video.otv-contain {
          object-fit: contain !important;
        }
        .otv-remote-video.otv-blur {
          filter: blur(24px) brightness(0.5);
          scale: 1.08;
        }

        /* AI Video Filter Styling */
        .otv-filter-beauty  { filter: contrast(1.08) brightness(1.06) saturate(1.1) blur(0.2px); }
        .otv-filter-vibrant { filter: sepia(0.18) saturate(1.45) contrast(1.12); }
        .otv-filter-cyber   { filter: hue-rotate(170deg) saturate(1.5) contrast(1.2); }
        .otv-filter-vintage { filter: grayscale(1) contrast(1.25) brightness(0.95); }

        /* Remote Placeholders & Animations */
        .otv-placeholder {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(12px, 2.5vw, 20px);
          padding: 2rem;
          text-align: center;
          pointer-events: none;
        }

        .otv-radar-wrap {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .otv-radar-center {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          border: 1px solid rgba(59, 130, 246, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(37, 99, 235, 0.4);
          z-index: 2;
        }
        .otv-spin-icon {
          color: #3b82f6;
          animation: otv-spin 1.2s linear infinite;
        }
        .otv-radar-pulse-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          border: 2px solid rgba(59, 130, 246, 0.6);
          animation: otv-pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .otv-radar-pulse-ring.delay-1 { animation-delay: 0.6s; }
        .otv-radar-pulse-ring.delay-2 { animation-delay: 1.2s; }

        @keyframes otv-spin { to { transform: rotate(360deg); } }
        @keyframes otv-pulse-ring {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .otv-avatar-wrap {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .otv-avatar-icon { color: #64748b; }

        .otv-placeholder-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .otv-ph-title {
          font-size: clamp(1rem, 1.6vw, 1.25rem);
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }
        .otv-ph-sub {
          font-size: clamp(0.78rem, 1.1vw, 0.88rem);
          color: #94a3b8;
          margin: 0;
        }

        /* Swipe Left Indicator */
        .otv-swipe-indicator {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #cbd5e1;
          pointer-events: none;
          z-index: 5;
        }
        .otv-arrow-animated {
          color: #3b82f6;
          animation: otv-bounce-left 1.2s infinite;
        }
        @keyframes otv-bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }

        /* Top Header Navigation & Controls */
        .otv-header-bar {
          position: absolute;
          top: clamp(10px, 1.5vw, 16px);
          left: clamp(10px, 1.5vw, 16px);
          right: clamp(10px, 1.5vw, 16px);
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: space-between;
          pointer-events: none;
        }

        .otv-status-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #ffffff;
          pointer-events: auto;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }

        .otv-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .otv-dot-live   { background: #22c55e; box-shadow: 0 0 10px rgba(34, 197, 94, 0.9); }
        .otv-dot-search { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.9); }
        .otv-dot-idle   { background: #64748b; }

        .otv-top-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: auto;
        }

        .otv-dropdown-wrap {
          position: relative;
        }

        .otv-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 100px;
          padding: 6px 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #f1f5f9;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .otv-action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .otv-action-btn:active {
          transform: scale(0.95);
        }

        .otv-active-pill {
          background: rgba(37, 99, 235, 0.35) !important;
          border-color: #3b82f6 !important;
          color: #93c5fd !important;
        }
        .otv-btn-danger {
          color: #fca5a5;
          border-color: rgba(239, 68, 68, 0.4);
        }
        .otv-btn-danger:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #fff;
        }
        .otv-icon-only {
          padding: 6px 9px;
        }

        /* Filter Dropdown Menu */
        .otv-filter-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          padding: 6px;
          min-width: 130px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 30;
          animation: otv-scale-in 0.15s ease;
        }

        .otv-filter-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          background: none;
          border: none;
          color: #cbd5e1;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .otv-filter-option:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .otv-filter-option.selected {
          color: #3b82f6;
        }

        @keyframes otv-scale-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* ── Picture-in-Picture (PiP) Self View ────────────── */
        .otv-pip {
          position: absolute;
          width: clamp(100px, 14vw, 150px);
          height: clamp(130px, 18vw, 195px);
          border-radius: clamp(10px, 1.5vw, 16px);
          overflow: hidden;
          background: #000;
          border: 2px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          z-index: 20;
          cursor: grab;
          transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease;
        }
        .otv-pip:hover {
          transform: scale(1.03);
          border-color: rgba(255, 255, 255, 0.5);
        }
        .otv-pip-dragging {
          cursor: grabbing !important;
          transform: scale(1.05) !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8) !important;
          transition: none !important;
        }

        /* PiP Corner Presets */
        .otv-pip-top-right    { top: clamp(52px, 6vw, 68px); right: clamp(10px, 1.5vw, 16px); }
        .otv-pip-top-left     { top: clamp(52px, 6vw, 68px); left: clamp(10px, 1.5vw, 16px); }
        .otv-pip-bottom-right { bottom: clamp(10px, 1.5vw, 16px); right: clamp(10px, 1.5vw, 16px); }
        .otv-pip-bottom-left  { bottom: clamp(10px, 1.5vw, 16px); left: clamp(10px, 1.5vw, 16px); }

        .otv-pip-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .otv-pip-video.otv-active {
          opacity: 1;
        }

        .otv-pip-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
        }
        .otv-icon-muted { color: #64748b; }

        .otv-pip-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2px 7px;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 700;
          color: #f1f5f9;
          display: flex;
          align-items: center;
          gap: 4px;
          pointer-events: none;
        }
        .otv-pip-muted-tag {
          color: #fca5a5;
        }

        .otv-pip-flip {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .otv-pip-flip:hover {
          background: rgba(37, 99, 235, 0.8);
          transform: scale(1.1);
        }

        /* ── Breakpoints & Responsiveness ──────────────────── */
        @media (max-width: 640px) {
          .otv-stage {
            height: clamp(340px, 75dvh, 540px);
            border-radius: 14px;
          }
          .otv-btn-label {
            display: none;
          }
          .otv-action-btn {
            padding: 6px 9px;
          }
          .otv-pip {
            width: 105px;
            height: 140px;
          }
        }

        @media (max-width: 480px) {
          .otv-stage {
            height: calc(100dvh - 160px);
            min-height: 320px;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          .otv-pip-top-right, .otv-pip-top-left {
            top: 50px;
          }
        }
      `}</style>
    </div>
  );
});

VideoGrid.displayName = 'VideoGrid';
