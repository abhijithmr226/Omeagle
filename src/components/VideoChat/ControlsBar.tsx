import React, { useMemo } from 'react';
import {
  Video,
  VideoOff,
  Square,
  Mic,
  MicOff,
  Settings,
  SlidersHorizontal,
  Camera,
  SkipForward,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';
import './ControlsBar.css';

export interface ControlsBarProps {
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onOpenSettings: () => void;
  onOpenPrefs?: () => void;
  onFlipCamera?: () => void;
  mobileChatOpen?: boolean;
  onToggleChat?: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = React.memo(({
  connectionStatus,
  isMuted,
  isVideoOff,
  onStart,
  onStop,
  onNext,
  onToggleMute,
  onToggleVideo,
  onOpenSettings,
  onOpenPrefs,
  onFlipCamera,
  mobileChatOpen,
  onToggleChat
}) => {
  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  // Hero Button Render Info
  const heroButtonInfo = useMemo(() => {
    if (isConnected) {
      return {
        label: 'NEXT ◄',
        icon: <SkipForward size={20} fill="currentColor" />,
        className: 'is-connected'
      };
    } else if (isSearching) {
      return {
        label: 'SEARCHING…',
        icon: <RefreshCw size={20} className="spin-hero-icon" />,
        className: 'is-searching'
      };
    } else {
      return {
        label: 'START',
        icon: <Video size={20} />,
        className: 'is-idle'
      };
    }
  }, [isConnected, isSearching]);

  return (
    <div className="azar-controls-root" role="region" aria-label="Video Call Controls">
      <div className="azar-glass-bar">
        {/* 1. Camera Flip (Front/Back) */}
        <button
          className="azar-action-btn"
          onClick={() => onFlipCamera?.()}
          disabled={!onFlipCamera}
          title="Flip Camera"
          aria-label="Flip Camera Front/Back"
        >
          <div className="azar-circle-btn">
            <Camera size={19} />
          </div>
          <span className="azar-action-label">Flip</span>
        </button>

        {/* 2. Camera Toggle (On/Off) */}
        <button
          className={`azar-action-btn ${isVideoOff ? 'active-video-off' : ''}`}
          onClick={onToggleVideo}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          aria-label="Toggle Camera On or Off"
          aria-pressed={isVideoOff}
        >
          <div className="azar-circle-btn">
            {isVideoOff ? <VideoOff size={19} className="red-icon" /> : <Video size={19} />}
          </div>
          <span className="azar-action-label">{isVideoOff ? 'Camera Off' : 'Camera On'}</span>
        </button>

        {/* 3. Mic Mute / Unmute */}
        <button
          className={`azar-action-btn ${isMuted ? 'active-muted' : ''}`}
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          aria-label="Toggle Microphone Mute State"
          aria-pressed={isMuted}
        >
          <div className="azar-circle-btn">
            {isMuted ? <MicOff size={19} className="red-icon" /> : <Mic size={19} />}
          </div>
          <span className="azar-action-label">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* 4. Hero Action Button (START ➔ SEARCHING... ➔ NEXT ◄) */}
        <button
          className={`azar-hero-next-btn ${heroButtonInfo.className}`}
          onClick={isConnected ? onNext : onStart}
          title={isConnected ? 'Next Match (Swipe Left or press N)' : isSearching ? 'Searching Live Queue' : 'Start Matching'}
          aria-label={heroButtonInfo.label}
        >
          <div className="azar-hero-content">
            {heroButtonInfo.icon}
            <span className="azar-hero-text">{heroButtonInfo.label}</span>
          </div>
        </button>

        {/* 5. Chat Toggle */}
        <button
          className={`azar-action-btn ${mobileChatOpen ? 'active-chat' : ''}`}
          onClick={onToggleChat}
          title="Toggle Text Chat Drawer"
          aria-label="Toggle Text Chat Drawer"
          aria-pressed={!!mobileChatOpen}
        >
          <div className="azar-circle-btn">
            <MessageCircle size={19} />
          </div>
          <span className="azar-action-label">Chat</span>
        </button>

        {/* 6. Dedicated Stop Call */}
        {(isConnected || isSearching) && (
          <button
            className="azar-action-btn"
            onClick={onStop}
            title="Stop Video Chat"
            aria-label="Stop Video Chat"
          >
            <div className="azar-circle-btn circle-stop">
              <Square size={16} fill="#fff" color="#fff" />
            </div>
            <span className="azar-action-label">Stop</span>
          </button>
        )}

        {/* 7. Dedicated Match Filter Preferences */}
        <button
          className="azar-action-btn"
          onClick={() => (onOpenPrefs ? onOpenPrefs() : onOpenSettings())}
          title="Matching Filters (Gender, Country, Interests)"
          aria-label="Matching Filters"
        >
          <div className="azar-circle-btn">
            <SlidersHorizontal size={19} />
          </div>
          <span className="azar-action-label">Filter</span>
        </button>

        {/* 8. AV Settings */}
        <button
          className="azar-action-btn"
          onClick={onOpenSettings}
          title="Camera & Microphone Settings"
          aria-label="Camera and Microphone Settings"
        >
          <div className="azar-circle-btn">
            <Settings size={19} />
          </div>
          <span className="azar-action-label">Settings</span>
        </button>
      </div>
    </div>
  );
});

ControlsBar.displayName = 'ControlsBar';
