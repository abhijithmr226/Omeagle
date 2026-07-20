import React from 'react';
import { Video, Square, Mic, MicOff, Settings, RefreshCw, Camera, CameraOff, SkipForward, MessageCircle } from 'lucide-react';
import { ConnectionStatus } from '../../types/chat';

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
  const isSearching = connectionStatus === 'searching';

  return (
    <div className="controls-bar">
      {/* Desktop Controls */}
      <div className="desktop-controls">
        <button className={`ctrl-btn btn-start ${isSearching ? 'disabled' : ''}`} onClick={isConnected ? onNext : onStart}>
          {isConnected ? <SkipForward size={18} /> : <Video size={18} />}
          <span>{isConnected ? 'Next' : 'Start'}</span>
        </button>
        <button className={`ctrl-btn btn-stop ${!isConnected && !isSearching ? 'disabled' : ''}`} onClick={onStop}>
          <Square size={16} fill="currentColor" />
          <span>Stop</span>
        </button>
        <button className={`ctrl-btn btn-utility ${isMuted ? 'active-utility' : ''}`} onClick={onToggleMute}>
          {isMuted ? <MicOff size={18} className="red-icon" /> : <Mic size={18} />}
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button className="ctrl-btn btn-utility" onClick={onOpenSettings}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Mobile Reference UI Action Row (5 Circular Buttons) */}
      <div className="mobile-controls">
        {/* 1. Flip */}
        <button className="mobile-action-item" onClick={onFlipCamera} title="Flip Camera">
          <div className="mobile-circle-btn">
            <Camera size={20} />
          </div>
          <span className="mobile-action-label">Flip</span>
        </button>

        {/* 2. Mute */}
        <button className={`mobile-action-item ${isMuted ? 'active-muted' : ''}`} onClick={onToggleMute} title="Mute">
          <div className="mobile-circle-btn">
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </div>
          <span className="mobile-action-label">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* 3. Stop / Start */}
        <button className="mobile-action-item" onClick={isConnected || isSearching ? onStop : onStart} title={isConnected || isSearching ? 'Stop' : 'Start'}>
          <div className={`mobile-circle-btn ${isConnected || isSearching ? 'circle-red-stop' : 'circle-green-start'}`}>
            {isConnected || isSearching ? <Square size={16} fill="#fff" color="#fff" /> : <Video size={20} color="#fff" />}
          </div>
          <span className="mobile-action-label">{isConnected || isSearching ? 'Stop' : 'Start'}</span>
        </button>

        {/* 4. Chat */}
        <button className={`mobile-action-item ${mobileChatOpen ? 'active-chat' : ''}`} onClick={onToggleChat} title="Text Chat">
          <div className="mobile-circle-btn">
            <MessageCircle size={20} />
          </div>
          <span className="mobile-action-label">Chat</span>
        </button>

        {/* 5. Settings */}
        <button className="mobile-action-item" onClick={onOpenSettings} title="Settings">
          <div className="mobile-circle-btn">
            <Settings size={20} />
          </div>
          <span className="mobile-action-label">Settings</span>
        </button>
      </div>

      <style>{`
        .controls-bar { flex-shrink: 0; width: 100%; }
        .desktop-controls { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; width: 100%; margin-top: 0.5rem; }
        .ctrl-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 0.85rem; font-weight: 700; font-size: 0.95rem; border-radius: var(--radius-md); border: 1px solid transparent; transition: all 0.2s ease; }
        .btn-start { background-color: var(--status-green-light); color: var(--status-green); border-color: var(--status-green-light); }
        .btn-start:hover:not(.disabled) { background-color: var(--status-green); color: #fff; }
        .btn-stop { background-color: var(--status-red-light); color: var(--status-red); border-color: var(--status-red-light); }
        .btn-stop:hover:not(.disabled) { background-color: var(--status-red); color: #fff; }
        .btn-utility { background-color: var(--bg-surface); color: var(--text-primary); border-color: var(--border-color); }
        .btn-utility:hover { background-color: var(--bg-surface-secondary); border-color: var(--border-color-hover); }
        .active-utility { background-color: var(--status-red-light); border-color: #fca5a5; }
        .red-icon { color: var(--status-red); }
        .disabled { opacity: 0.4; cursor: not-allowed; }

        /* Mobile Action Row (5 Circular Buttons matching reference) */
        .mobile-controls { display: none; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; width: 100%; padding: 0.85rem 0.5rem; background: transparent; justify-items: center; align-items: center; }
        .mobile-action-item { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; border: none; background: none; color: #94a3b8; cursor: pointer; transition: all 0.2s ease; width: 100%; }
        .mobile-action-item:active { transform: scale(0.92); }

        .mobile-circle-btn { width: 48px; height: 48px; border-radius: 50%; background: #1e293b; color: #f8fafc; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: all 0.2s ease; }
        .mobile-action-item.active-muted .mobile-circle-btn { background: #7f1d1d; color: #fca5a5; border-color: #ef4444; }
        .mobile-action-item.active-chat .mobile-circle-btn { background: #1e3a8a; color: #93c5fd; border-color: #3b82f6; }

        .circle-red-stop { background: #ef4444 !important; border-color: #f87171 !important; box-shadow: 0 4px 16px rgba(239,68,68,0.4) !important; }
        .circle-green-start { background: #10b981 !important; border-color: #34d399 !important; box-shadow: 0 4px 16px rgba(16,185,129,0.4) !important; }

        .mobile-action-label { font-size: 0.75rem; font-weight: 500; color: #94a3b8; }
        .mobile-action-item:hover .mobile-action-label, .mobile-action-item:active .mobile-action-label { color: #f8fafc; }

        @media (max-width: 1024px) {
          .desktop-controls { display: none; }
          .mobile-controls { display: grid; }
        }
      `}</style>
    </div>
  );
};
