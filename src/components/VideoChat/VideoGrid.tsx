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
  MoreVertical,
  Zap,
  Globe2
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

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
}

const COUNTRY_QUEUE = [
  { name: 'Tokyo, Japan', flag: '🇯🇵' },
  { name: 'Kerala, India', flag: '🇮🇳' },
  { name: 'New York, USA', flag: '🇺🇸' },
  { name: 'London, UK', flag: '🇬🇧' },
  { name: 'Paris, France', flag: '🇫🇷' },
  { name: 'Seoul, S. Korea', flag: '🇰🇷' },
  { name: 'São Paulo, Brazil', flag: '🇧🇷' }
];

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
  const [showPipMenu, setShowPipMenu] = useState(false);

  // Matchmaking & Reaction States
  const [countryIndex, setCountryIndex] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [videoFadeIn, setVideoFadeIn] = useState(false);

  // Double Tap & Long Press Timers for PiP
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe Gesture States
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ultra-Smooth Dragging Refs
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; pipX: number; pipY: number }>({ x: 0, y: 0, pipX: 0, pipY: 0 });
  const rafIdRef = useRef<number | null>(null);
  const pipPosRef = useRef<{ x: number; y: number } | null>(null);

  // Live Timer Effect for Connected Call
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (connectionStatus === 'connected') {
      setMatchTime(0);
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    } else {
      setMatchTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  // Global Country Cycling during Matchmaking Search
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (connectionStatus === 'searching' || connectionStatus === 'connecting') {
      interval = setInterval(() => {
        setCountryIndex(prev => (prev + 1) % COUNTRY_QUEUE.length);
      }, 1400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  // Update PiP Position in DOM
  const updatePipPosDOM = useCallback((x: number, y: number) => {
    if (pipRef.current) {
      pipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, []);

  // Handlers
  const toggleFullscreen = useCallback(() => {
    const fsElem = document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (!fsElem) {
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
    if (hasDraggedRef.current) return;
    if (pipRef.current) {
      pipRef.current.style.transform = '';
      pipPosRef.current = null;
    }
    const corners: PipCorner[] = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    setPipCorner(prev => corners[(corners.indexOf(prev) + 1) % corners.length]);
  }, []);

  // Trigger Floating Emoji Reaction Animation
  const triggerReaction = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.random() * 60 + 20
    };
    setFloatingEmojis(prev => [...prev.slice(-10), newEmoji]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 2200);
  };

  // Stream bindings
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
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
      if (!target.closest('.otv-dropdown-wrap') && !target.closest('.otv-pip')) {
        setShowFilterMenu(false);
        setShowMobileMenu(false);
        setShowPipMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Desktop Keyboard Shortcuts (F, N, C)
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
      } else if (key === 'c') {
        e.preventDefault();
        if (onFlipCamera) onFlipCamera();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen, onNext, onFlipCamera]);

  // Fullscreen Listener
  useEffect(() => {
    const handleFsChange = () => {
      const fsElem = document.fullscreenElement || (document as any).webkitFullscreenElement;
      setIsFullscreen(!!fsElem);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Window Resize / Orientation Change Handler for Reclamping PiP
  useEffect(() => {
    const handleResize = () => {
      if (!pipPosRef.current || !containerRef.current || !pipRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const pipWidth = pipRef.current.offsetWidth;
      const pipHeight = pipRef.current.offsetHeight;

      const maxX = Math.max(12, containerRect.width - pipWidth - 12);
      const maxY = Math.max(12, containerRect.height - pipHeight - 12);

      const clampedX = Math.max(12, Math.min(maxX, pipPosRef.current.x));
      const clampedY = Math.max(12, Math.min(maxY, pipPosRef.current.y));

      pipPosRef.current = { x: clampedX, y: clampedY };
      updatePipPosDOM(clampedX, clampedY);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updatePipPosDOM]);

  // Mobile Touch Swipe Gesture
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

  // PiP Double Tap & Long Press Touch Handlers
  const handlePipTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    handlePipMouseDown(e);
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double Tap ➔ Flip Camera
      if (onFlipCamera) onFlipCamera();
    }
    lastTapRef.current = now;

    longPressTimerRef.current = setTimeout(() => {
      setShowPipMenu(true);
    }, 550);
  };

  const handlePipTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  // Ultra-Smooth Dragging
  const handlePipMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    hasDraggedRef.current = false;
    const isTouch = 'touches' in e;
    const clientX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (pipRef.current && containerRef.current) {
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
      if (isTouch && e.cancelable) {
        e.preventDefault();
      }

      const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;

      if (Math.hypot(deltaX, deltaY) > 5) {
        hasDraggedRef.current = true;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }

      const unconstrainedX = dragStartRef.current.pipX + deltaX;
      const unconstrainedY = dragStartRef.current.pipY + deltaY;

      const containerRect = containerRef.current.getBoundingClientRect();
      const pipWidth = pipRef.current.offsetWidth;
      const pipHeight = pipRef.current.offsetHeight;

      const maxX = Math.max(12, containerRect.width - pipWidth - 12);
      const maxY = Math.max(12, containerRect.height - pipHeight - 12);

      const clampedX = Math.max(12, Math.min(maxX, unconstrainedX));
      const clampedY = Math.max(12, Math.min(maxY, unconstrainedY));

      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        pipPosRef.current = { x: clampedX, y: clampedY };
        updatePipPosDOM(clampedX, clampedY);
      });
    };

    const handleEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      pipRef.current?.classList.remove('otv-pip-dragging');
      requestAnimationFrame(() => {
        hasDraggedRef.current = false;
      });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove, { passive: false } as any);
      window.removeEventListener('touchend', handleEnd);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [updatePipPosDOM]);

  // Derived States
  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  // Format Timer string
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const filterCssClass = useMemo(() => {
    switch (activeFilter) {
      case 'beauty': return 'otv-filter-beauty';
      case 'vibrant': return 'otv-filter-vibrant';
      case 'cyber': return 'otv-filter-cyber';
      case 'vintage': return 'otv-filter-vintage';
      default: return '';
    }
  }, [activeFilter]);

  const currentCountry = COUNTRY_QUEUE[countryIndex];

  return (
    <div
      ref={containerRef}
      className={`otv-stage ${isFullscreen ? 'otv-fullscreen' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Video Chat View"
    >
      {/* ── Floating Reaction Emoji Overlay ──────────────────── */}
      <div className="otv-reactions-overlay">
        {floatingEmojis.map(item => (
          <div key={item.id} className="otv-floating-emoji" style={{ left: `${item.left}%` }}>
            {item.emoji}
          </div>
        ))}
      </div>

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
          onLoadedMetadata={() => setVideoFadeIn(true)}
          onPlaying={() => setVideoFadeIn(true)}
          className={`otv-remote-video ${remoteStream && videoFadeIn ? 'otv-active' : ''} ${objectFitMode === 'contain' ? 'otv-contain' : 'otv-cover'} ${filterCssClass} ${isSearching ? 'otv-blur' : ''}`}
          aria-label="Remote Stranger Video Feed"
        />

        {/* Searching Ambient Aurora Blobs Background */}
        {isSearching && (
          <div className="otv-ambient-bg">
            <div className="otv-blob otv-blob-1" />
            <div className="otv-blob otv-blob-2" />
            <div className="otv-blob otv-blob-3" />
          </div>
        )}

        {/* Remote Placeholders & Matchmaking Global Queue */}
        {!remoteStream && (
          <div className="otv-placeholder">
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

            {isSearching && (
              <div className="otv-country-pill">
                <span>{currentCountry.flag}</span>
                <span>Connecting to {currentCountry.name}</span>
              </div>
            )}

            <div className="otv-placeholder-meta">
              <h3 className="otv-ph-title">
                {isSearching ? 'Matching with live stranger…' : 'Ready to Meet New People'}
              </h3>
              <p className="otv-ph-sub">
                {isSearching
                  ? 'Searching global live matching queue'
                  : 'Press Start (or N) or Swipe Left to connect'}
              </p>
              {isSearching && (
                <div className="otv-online-badge">
                  <Globe2 size={13} />
                  <span>14,892 users online live</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stranger Info & Location Card Overlay */}
        {isConnected && (
          <div className="otv-stranger-overlay">
            <div className="otv-overlay-pill">
              <span>🇮🇳 India</span>
              <span>• 18+</span>
            </div>
            <div className="otv-overlay-pill otv-hd-tag">
              <span>HD</span>
            </div>
            <div className="otv-overlay-pill">
              <Zap size={11} className="text-yellow-400" />
              <span>42ms</span>
            </div>
          </div>
        )}

        {/* Interactive Floating Reaction Emoji Dock */}
        {isConnected && (
          <div className="otv-reaction-bar">
            {['👍', '❤️', '😂', '🔥', '⚡'].map(emoji => (
              <button key={emoji} className="otv-reaction-btn" onClick={() => triggerReaction(emoji)}>
                {emoji}
              </button>
            ))}
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
        {/* Status Indicator & Live Timer */}
        <div className="otv-status-pill" role="status" aria-live="polite">
          <span className={`otv-status-dot ${isConnected ? 'otv-dot-live' : isSearching ? 'otv-dot-search' : 'otv-dot-idle'}`} />
          <span>{isConnected ? 'LIVE' : isSearching ? 'Searching…' : 'Idle'}</span>
          {isConnected && <span className="otv-timer">{formatTimer(matchTime)}</span>}
        </div>

        {/* Quick Action Badges */}
        <div className="otv-top-actions">
          {/* Desktop Filter Toggle */}
          <div className="otv-dropdown-wrap otv-desktop-only">
            <button
              className={`otv-action-btn ${activeFilter !== 'normal' ? 'otv-active-pill' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterMenu(prev => !prev);
              }}
              title="Video Filters"
              aria-label="Toggle AI Video Filters Menu"
              aria-expanded={showFilterMenu}
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
            aria-pressed={objectFitMode === 'contain'}
          >
            {objectFitMode === 'cover' ? <Shrink size={15} /> : <Expand size={15} />}
            <span>{objectFitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {/* Safety Guidelines */}
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
              aria-expanded={showMobileMenu}
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

          {/* Fullscreen Toggle with Kbd Badge */}
          <button
            className="otv-action-btn otv-icon-only"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
            aria-label="Toggle Fullscreen Mode"
            aria-pressed={isFullscreen}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span className="otv-kbd-badge otv-desktop-only">F</span>
          </button>
        </div>
      </div>

      {/* ── Picture-in-Picture (PiP) Self Camera ────────── */}
      <div
        ref={pipRef}
        className={`otv-pip otv-pip-${pipCorner} ${isConnected ? 'pip-live' : ''} ${isMuted ? 'pip-muted' : ''}`}
        onMouseDown={handlePipTouchStart}
        onTouchStart={handlePipTouchStart}
        onTouchEnd={handlePipTouchEnd}
        onClick={cyclePipCorner}
        title="Double-tap to flip camera, drag to reposition, or click to snap corner"
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

        {/* Long Press Quick Action Menu */}
        {showPipMenu && (
          <div className="otv-pip-menu" onClick={e => e.stopPropagation()}>
            {onFlipCamera && (
              <button className="otv-pip-menu-btn" onClick={() => { onFlipCamera(); setShowPipMenu(false); }}>
                <RotateCcw size={12} /><span>Flip</span>
              </button>
            )}
            <button className="otv-pip-menu-btn" onClick={() => { cyclePipCorner(); setShowPipMenu(false); }}>
              <span>Snap Corner</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

VideoGrid.displayName = 'VideoGrid';
