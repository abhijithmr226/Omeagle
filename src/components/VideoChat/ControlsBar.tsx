import React from 'react';
import { Video, Square, Mic, MicOff, Settings, RefreshCw, Camera, CameraOff, SkipForward, MessageCircle, Phone, PhoneOff } from 'lucide-react';
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

      {/* Mobile - App-like bottom bar */}
      <div className="mobile-controls">
        <button className={`mobile-ctrl ${isMuted ? 'muted' : ''}`} onClick={onToggleMute} title="Mute">
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="mobile-ctrl-lbl">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>
        <button className={`mobile-ctrl ${isVideoOff ? 'muted' : ''}`} onClick={onToggleVideo} title="Toggle Camera">
          {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
          <span className="mobile-ctrl-lbl">{isVideoOff ? 'Off' : 'Cam'}</span>
        </button>
        {isConnected ? (
          <button className="mobile-ctrl primary-ctrl next-ctrl" onClick={onNext} title="Next">
            <SkipForward size={24} />
            <span className="mobile-ctrl-lbl">Next</span>
          </button>
        ) : (
          <button className="mobile-ctrl primary-ctrl start-ctrl" onClick={onStart} title="Start">
            <Video size={24} />
            <span className="mobile-ctrl-lbl">{isSearching ? '...' : 'Start'}</span>
          </button>
        )}
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
        .btn-start { background-color: var(--status-green-light); color: var(--status-green); border-color: var(--status-green-light); }
        .btn-start:hover:not(.disabled) { background-color: var(--status-green); color: #fff; }
        .btn-stop { background-color: var(--status-red-light); color: var(--status-red); border-color: var(--status-red-light); }
        .btn-stop:hover:not(.disabled) { background-color: var(--status-red); color: #fff; }
        .btn-utility { background-color: var(--bg-surface); color: var(--text-primary); border-color: var(--border-color); }
        .btn-utility:hover { background-color: var(--bg-surface-secondary); border-color: var(--border-color-hover); }
        .active-utility { background-color: var(--status-red-light); border-color: #fca5a5; }
        .red-icon { color: var(--status-red); }
        .disabled { opacity: 0.4; cursor: not-allowed; }

        /* Mobile controls - App-like bottom bar */
        .mobile-controls { display: none; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; width: 100%; padding: 0.6rem 0.5rem; padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px)); background: var(--bg-surface); border-top: 1px solid var(--border-color); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        [data-theme='dark'] .mobile-controls { background: rgba(21,28,40,0.9); }
        .mobile-ctrl { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem; background: transparent; color: var(--text-secondary); padding: 0.4rem 0.15rem; border-radius: var(--radius-md); min-height: 56px; -webkit-tap-highlight-color: transparent; transition: all 0.15s ease; touch-action: manipulation; position: relative; overflow: hidden; }
        .mobile-ctrl:active { background: var(--bg-surface-secondary); transform: scale(0.92); }
        .mobile-ctrl-lbl { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; }
        .mobile-ctrl.muted { color: var(--status-red); }
        .mobile-ctrl.muted::after { content: ''; position: absolute; top: 4px; right: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--status-red); }
        .mobile-ctrl.chat-active { background: var(--brand-blue); color: #fff; border-radius: var(--radius-md); }
        .primary-ctrl { min-height: 60px; border-radius: var(--radius-full); margin-top: -8px; }
        .start-ctrl { background: var(--status-green) !important; color: #fff !important; box-shadow: 0 4px 16px rgba(16,185,129,0.4); }
        .start-ctrl:active { background: #059669 !important; transform: scale(0.93) !important; }
        .next-ctrl { background: var(--brand-blue) !important; color: #fff !important; box-shadow: 0 4px 16px rgba(0,102,255,0.4); }
        .next-ctrl:active { background: var(--brand-blue-hover) !important; transform: scale(0.93) !important; }

        @media (max-width: 1024px) {
          .desktop-controls { display: none; }
          .mobile-controls { display: grid; }
        }

        @media (max-width: 380px) {
          .mobile-ctrl { min-height: 50px; }
          .mobile-ctrl svg { width: 18px; height: 18px; }
          .primary-ctrl { min-height: 54px; }
          .primary-ctrl svg { width: 22px; height: 22px; }
        }
      `}</style>
    </div>
  );
};
