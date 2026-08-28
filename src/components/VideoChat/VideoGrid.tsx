import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  CameraOff,
  Mic,
  MicOff,
  Flag,
  Globe
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

export const VideoGrid: React.FC<VideoGridProps> = React.memo(({
  localStream,
  remoteStream,
  connectionStatus,
  isMuted,
  isVideoOff,
  onFlipCamera,
  onReportStranger,
  onNext
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  // Remote Stream Attachment
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream]);

  // Local Stream Attachment
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Fullscreen Handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div className="ow-videos-stack" ref={containerRef}>
      {/* ── 1. Top Box: Stranger's Video ──────────────────── */}
      <div className="ow-video-box ow-stranger-video-box">
        {/* Active Remote Video Stream */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`ow-video-element ${remoteStream && isConnected ? 'active' : ''}`}
          aria-label="Stranger Video Feed"
        />

        {/* Searching / Connecting State Spinner */}
        {!isConnected && (
          <div className="ow-video-placeholder">
            {isSearching ? (
              <div className="ow-spinner-ring" />
            ) : (
              <div className="ow-idle-notice">
                <span>Looking for someone...</span>
              </div>
            )}
          </div>
        )}

        {/* Omegle Brand Watermark */}
        <div className="ow-video-watermark">
          omegleweb.io
        </div>

        {/* Fullscreen Overlay Button */}
        <button 
          type="button" 
          className="ow-video-fs-btn" 
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ── 2. Bottom Box: You (Local Camera Feed) ────────── */}
      <div className="ow-video-box ow-local-video-box">
        {/* Active Local Video Stream */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`ow-video-element ${localStream && !isVideoOff ? 'active' : ''} is-mirrored`}
          aria-label="Your Camera Feed"
        />

        {/* Camera Off Placeholder */}
        {(!localStream || isVideoOff) && (
          <div className="ow-video-placeholder">
            <CameraOff size={28} color="#94A3B8" />
            <span className="ow-cam-off-label">Camera is off</span>
          </div>
        )}

        {/* Flip Camera Button (Bottom Right) */}
        {onFlipCamera && (
          <button
            type="button"
            className="ow-video-flip-btn"
            onClick={onFlipCamera}
            title="Flip Camera (Front / Back)"
            aria-label="Flip Camera"
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* Muted Indicator Tag */}
        {isMuted && (
          <div className="ow-video-muted-pill">
            <MicOff size={12} />
            <span>Muted</span>
          </div>
        )}
      </div>
    </div>
  );
});

VideoGrid.displayName = 'VideoGrid';
