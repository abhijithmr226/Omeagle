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
      {/* Desktop */}
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

      {/* Mobile */}
      <div className="mobile-controls">
        <button className={`mobile-ctrl ${isMuted ? 'muted' : ''}`} onClick={onToggleMute} title="Mute">
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="mobile-ctrl-lbl">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button className="mobile-ctrl" onClick={onToggleVideo} title="Toggle Camera">
          {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
          <span className="mobile-ctrl-lbl">{isVideoOff ? 'Off' : 'Cam'}</span>
        </button>
        <button className="mobile-ctrl primary-ctrl" onClick={isConnected ? onNext : onStart} title={isConnected ? 'Next' : 'Start'}>
          {isConnected ? <SkipForward size={24} /> : <Video size={24} />}
          <span className="mobile-ctrl-lbl">{isConnected ? 'Next' : 'Start'}</span>
        </button>
        {onFlipCamera && (
          <button className="mobile-ctrl" onClick={onFlipCamera} title="Flip Camera">
            <RefreshCw size={20} />
            <span className="mobile-ctrl-lbl">Flip</span>
          </button>
        )}
        {onToggleChat && (
          <button className={`mobile-ctrl ${mobileChatOpen ? 'chat-active' : ''}`} onClick={onToggleChat} title="Text Chat">
            <MessageCircle size={20} />
            <span className="mobile-ctrl-lbl">Chat</span>
          </button>
        )}
      </div>

      <style>{`
        .controls-bar { flex-shrink: 0; }
        .desktop-controls { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; width: 100%; margin-top: 0.5rem; }
        .ctrl-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 0.85rem; font-weight: 700; font-size: 0.95rem; border-radius: var(--radius-md); border: 1px solid transparent; transition: all 0.2s ease; }
        .btn-start { background-color: #d1fae5; color: #059669; border-color: #a7f3d0; }
        .btn-start:hover:not(.disabled) { background-color: #a7f3d0; }
        .btn-stop { background-color: #fee2e2; color: #dc2626; border-color: #fca5a5; }
        .btn-stop:hover:not(.disabled) { background-color: #fca5a5; }
        .btn-utility { background-color: var(--bg-surface); color: var(--text-primary); border-color: var(--border-color); }
        .btn-utility:hover { background-color: var(--bg-surface-secondary); border-color: var(--border-color-hover); }
        .active-utility { background-color: var(--status-red-light); border-color: #fca5a5; }
        .red-icon { color: var(--status-red); }
        .disabled { opacity: 0.4; cursor: not-allowed; }

        /* Mobile controls */
        .mobile-controls { display: none; grid-template-columns: repeat(5, 1fr); gap: 0.3rem; width: 100%; padding: 0.4rem 0; background: var(--bg-surface); border-top: 1px solid var(--border-color); }
        .mobile-ctrl { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem; background: var(--bg-surface); color: var(--text-primary); padding: 0.5rem 0.2rem; border-radius: var(--radius-md); min-height: 52px; -webkit-tap-highlight-color: transparent; transition: background 0.15s; }
        .mobile-ctrl:active { background: var(--bg-surface-secondary); }
        .mobile-ctrl-lbl { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.02em; }
        .mobile-ctrl.muted { background: var(--status-red-light); color: var(--status-red); }
        .mobile-ctrl.chat-active { background: var(--brand-blue); color: #fff; }
        .primary-ctrl { background: var(--status-green) !important; color: #fff !important; }
        .primary-ctrl:active { background: #059669 !important; }

        @media (max-width: 868px) {
          .desktop-controls { display: none; }
          .mobile-controls { display: grid; }
        }
      `}</style>
    </div>
  );
};
