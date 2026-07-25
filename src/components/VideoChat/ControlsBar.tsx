import React from 'react';
import { Video, Square, Mic, MicOff, Settings, Camera, SkipForward, MessageCircle, ChevronRight } from 'lucide-react';
import type { ConnectionStatus } from '../../types/chat';

interface ControlsBarProps {
  connectionStatus: ConnectionStatus;
  isMuted: boolean;
  isVideoOff: boolean;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onOpenSettings: () => void;
  onFlipCamera?: () => void;
  mobileChatOpen?: boolean;
  onToggleChat?: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  connectionStatus, isMuted, isVideoOff,
  onStart, onStop, onNext, onToggleMute, onToggleVideo, onOpenSettings, onFlipCamera,
  mobileChatOpen, onToggleChat
}) => {
  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';

  return (
    <div className="azar-controls-root">
      {/* Floating Glass Pill Bar */}
      <div className="azar-glass-bar">
        {/* 1. Camera Flip */}
        <button className="azar-action-btn" onClick={onFlipCamera} title="Flip Camera">
          <div className="azar-circle-btn">
            <Camera size={19} />
          </div>
          <span className="azar-action-label">Flip</span>
        </button>

        {/* 2. Mic Mute */}
        <button className={`azar-action-btn ${isMuted ? 'active-muted' : ''}`} onClick={onToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
          <div className="azar-circle-btn">
            {isMuted ? <MicOff size={19} className="red-icon" /> : <Mic size={19} />}
          </div>
          <span className="azar-action-label">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* 3. Primary Start / Next (Azar Hero Button) */}
        <button
          className={`azar-hero-next-btn ${isSearching ? 'is-searching' : ''}`}
          onClick={isConnected ? onNext : onStart}
          title={isConnected ? 'Next Match (Swipe Left)' : 'Start Matching'}
        >
          <div className="azar-hero-content">
            {isConnected ? <SkipForward size={22} fill="currentColor" /> : <Video size={22} />}
            <span className="azar-hero-text">{isConnected ? 'NEXT ◄' : 'START'}</span>
          </div>
        </button>

        {/* 4. Chat Drawer Toggle */}
        <button className={`azar-action-btn ${mobileChatOpen ? 'active-chat' : ''}`} onClick={onToggleChat} title="Toggle Chat Overlay">
          <div className="azar-circle-btn">
            <MessageCircle size={19} />
          </div>
          <span className="azar-action-label">Chat</span>
        </button>

        {/* 5. Stop / Settings */}
        <button className="azar-action-btn" onClick={isConnected || isSearching ? onStop : onOpenSettings} title={isConnected || isSearching ? 'Stop Call' : 'Match Preferences'}>
          <div className={`azar-circle-btn ${isConnected || isSearching ? 'circle-stop' : ''}`}>
            {isConnected || isSearching ? <Square size={16} fill="#fff" color="#fff" /> : <Settings size={19} />}
          </div>
          <span className="azar-action-label">{isConnected || isSearching ? 'Stop' : 'Filter'}</span>
        </button>
      </div>

      <style>{`
        .azar-controls-root {
          position: relative;
          width: 100%;
          max-width: 540px;
          margin: 0.5rem auto 0;
          z-index: 30;
        }

        .azar-glass-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 8px 16px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
        }

        .azar-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .azar-action-btn:active { transform: scale(0.92); }

        .azar-circle-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.12);
          transition: all 0.2s ease;
        }
        .azar-action-btn:hover .azar-circle-btn {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .active-muted .azar-circle-btn {
          background: rgba(239, 68, 68, 0.25);
          border-color: #ef4444;
          color: #fca5a5;
        }
        .active-chat .azar-circle-btn {
          background: rgba(59, 130, 246, 0.25);
          border-color: #3b82f6;
          color: #93c5fd;
        }
        .circle-stop {
          background: #ef4444 !important;
          border-color: #f87171 !important;
          box-shadow: 0 0 12px rgba(239,68,68,0.5) !important;
        }

        .azar-action-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
        }

        /* Hero Primary Action Button (Next / Start) */
        .azar-hero-next-btn {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 100px;
          padding: 8px 22px;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255,255,255,0.4);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .azar-hero-next-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(124, 58, 237, 0.6);
        }
        .azar-hero-next-btn:active {
          transform: scale(0.95);
        }
        .azar-hero-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .azar-hero-text {
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .is-searching {
          background: linear-gradient(135deg, #d97706, #dc2626);
          animation: pulse 1.5s infinite;
        }

        .red-icon { color: #f87171; }
      `}</style>
    </div>
  );
};
