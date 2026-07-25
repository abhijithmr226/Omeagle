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
  Check,
  MoreVertical
} from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';
import './VideoGrid.css';

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
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Smooth Remote Video Transition Fade State
  const [videoFadeIn, setVideoFadeIn] = useState(false);

  // Touch Swipe Gesture State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ultra-Smooth Dragging Refs using requestAnimationFrame
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; pipX: number; pipY: number }>({ x: 0, y: 0, pipX: 0, pipY: 0 });
  const rafIdRef = useRef<number | null>(null);
  const pipPosRef = useRef<{ x: number; y: number } | null>(null);

  // Stream bindings with Smooth Fade Transition
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        setVideoFadeIn(true);
      } else {
        setVideoFadeIn(false);
        const timer = setTimeout(() => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Click-Outside Listener for Menus
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.otv-dropdown-wrap')) {
        setShowFilterMenu(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 'n') {
        e.preventDefault();
        if (onNext) onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

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

  const cycleFilter = useCallback(() => {
    const filters: FilterMode[] = ['normal', 'beauty', 'vibrant', 'cyber', 'vintage'];
    setActiveFilter(prev => {
      const idx = filters.indexOf(prev);
      return filters[(idx + 1) % filters.length];
    });
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

  const cyclePipCorner = useCallback(() => {
    if (pipRef.current) {
      pipRef.current.style.transform = '';
      pipPosRef.current = null;
    }
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

  // Ultra-Smooth RequestAnimationFrame PiP Dragging
  const updatePipPosDOM = (x: number, y: number) => {
    if (pipRef.current) {
      pipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const handlePipMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (pipRef.current && containerRef.current) {
      const pipRect = pipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      let currentX = pipPosRef.current ? pipPosRef.current.x : 0;
      let currentY = pipPosRef.current ? pipPosRef.current.y : 0;

      dragStartRef.current = {
        x: clientX,
        y: clientY,
        pipX: currentX,
        pipY: currentY
      };
      isDraggingRef.current = true;
      if (pipRef.current) pipRef.current.classList.add('otv-pip-dragging');
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !containerRef.current || !pipRef.current) return;
      const isTouch = 'touches' in e;
      const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      const nextX = dragStartRef.current.pipX + deltaX;
      const nextY = dragStartRef.current.pipY + deltaY;

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        pipPosRef.current = { x: nextX, y: nextY };
        updatePipPosDOM(nextX, nextY);
      });
    };

    const handleEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (pipRef.current) pipRef.current.classList.remove('otv-pip-dragging');
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Derived Connection Status Details
  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  const statusBadgeInfo = useMemo(() => {
    switch (connectionStatus) {
      case 'connected':
        return { label: 'Live Match', dotClass: 'otv-dot-live' };
      case 'searching':
      case 'connecting':
        return { label: 'Searching…', dotClass: 'otv-dot-search' };
      case 'disconnected':
        return { label: 'Disconnected', dotClass: 'otv-dot-idle' };
      default:
        return { label: 'Idle', dotClass: 'otv-dot-idle' };
    }
  }, [connectionStatus]);

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
          className={`otv-remote-video ${remoteStream && videoFadeIn ? 'otv-active' : ''} ${objectFitMode === 'contain' ? 'otv-contain' : 'otv-cover'} ${filterCssClass} ${isSearching ? 'otv-blur' : ''}`}
          aria-label="Remote Stranger Video Feed"
        />

        {/* Remote Placeholders with Shimmer Loading Skeleton */}
        {!remoteStream && (
          <div className="otv-placeholder">
            {isSearching && <div className="otv-shimmer-bg" />}

            {isSearching ? (
              <div className="otv-radar-wrap">
                <div className="otv-radar-pulse-ring" />
                <div className="otv-radar-pulse-ring delay-1" />
                <div className="otv-radar-pulse-ring delay-2" />
                <div className="otv-radar-center">
                  <RefreshCw className="otv-spin-icon" size={38} />
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
                  : 'Press Start (or N) or Swipe Left to connect'}
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
          <span className={`otv-status-dot ${statusBadgeInfo.dotClass}`} />
          <span className="otv-status-text">{statusBadgeInfo.label}</span>
        </div>

        {/* Quick Action Badges */}
        <div className="otv-top-actions">
          {/* Desktop Controls */}
          <div className="otv-dropdown-wrap otv-desktop-only">
            <button
              className={`otv-action-btn ${activeFilter !== 'normal' ? 'otv-active-pill' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterMenu(prev => !prev);
              }}
              title="Video Filters"
              aria-label="Toggle AI Video Filters Menu"
            >
              <Sparkles size={15} />
              <span className="capitalize">{activeFilter}</span>
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

          {/* Fit / Cover Toggle (Desktop) */}
          <button
            className="otv-action-btn otv-desktop-only"
            onClick={toggleObjectFit}
            title={objectFitMode === 'cover' ? 'Fit Video to Screen' : 'Fill Screen'}
            aria-label="Toggle Aspect Ratio Fit Mode"
          >
            {objectFitMode === 'cover' ? <Shrink size={15} /> : <Expand size={15} />}
            <span>{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {/* Safety Center */}
          {onOpenSafety && (
            <button
              className="otv-action-btn otv-desktop-only"
              onClick={onOpenSafety}
              title="Safety Guidelines"
              aria-label="Open Safety Guidelines"
            >
              <ShieldAlert size={15} />
              <span>Safety</span>
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
              <span className="otv-desktop-only">Report</span>
            </button>
          )}

          {/* Mobile Popover Toggle (⋮) */}
          <div className="otv-dropdown-wrap">
            <button
              className="otv-action-btn otv-icon-only"
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileMenu(prev => !prev);
              }}
              title="More Actions"
              aria-label="More Video Options"
            >
              <MoreVertical size={16} />
            </button>

            {showMobileMenu && (
              <div className="otv-mobile-menu" onClick={e => e.stopPropagation()}>
                <button className="otv-mobile-menu-item" onClick={cycleFilter}>
                  <Sparkles size={15} />
                  <span>Filter: {activeFilter}</span>
                </button>
                <button className="otv-mobile-menu-item" onClick={toggleObjectFit}>
                  {objectFitMode === 'cover' ? <Shrink size={15} /> : <Expand size={15} />}
                  <span>{objectFitMode === 'cover' ? 'Fit' : 'Fill'} Video</span>
                </button>
                {onOpenSafety && (
                  <button className="otv-mobile-menu-item" onClick={onOpenSafety}>
                    <ShieldAlert size={15} />
                    <span>Safety Guide</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            className="otv-action-btn otv-icon-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
            aria-label="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ── Picture-in-Picture (PiP) Self Camera ────────── */}
      <div
        ref={pipRef}
        className={`otv-pip otv-pip-${pipCorner}`}
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
    </div>
  );
});

VideoGrid.displayName = 'VideoGrid';
