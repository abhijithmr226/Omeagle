import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Smile, Search, Globe, Tag, Heart, 
  Flag, Sparkles, Zap, Star, ShieldCheck, ArrowUpRight, SkipForward, Power
} from 'lucide-react';
import { ChatMessage, ConnectionStatus, PartnerProfile } from '../../types/chat';
import { trackSendMessage } from '../../services/gtm';
import './ChatBox.css';

function getFlag(code: string): string {
  if (!code) return '';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
}

interface ChatBoxProps {
  messages: ChatMessage[];
  connectionStatus: ConnectionStatus;
  onSendMessage: (text: string) => void;
  onNext: () => void;
  onStart: () => void;
  mode: 'video' | 'text';
  isOverlay?: boolean;
  isStrangerTyping?: boolean;
  onTyping?: () => void;
  partnerProfile?: PartnerProfile | null;
  onOpenPreferences?: () => void;
}

const MAX_MSG = 2000;

const AI_ICEBREAKERS = [
  "What is your dream travel destination?",
  "What hobby do you enjoy most?",
  "Chai or Coffee?",
  "What's your favorite movie or series?",
  "Where are you from?"
];

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  connectionStatus,
  onSendMessage,
  onNext,
  onStart,
  mode,
  isOverlay = false,
  isStrangerTyping = false,
  onTyping,
  partnerProfile,
  onOpenPreferences
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [stopConfirmState, setStopConfirmState] = useState(false); // true when clicked "Stop" once -> "Really?"
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingSentRef = useRef(false);

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';
  const isDisconnected = connectionStatus === 'disconnected' || connectionStatus === 'timed-out' || connectionStatus === 'idle';

  // Reset confirmation state when connection changes
  useEffect(() => {
    setStopConfirmState(false);
  }, [connectionStatus]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  // Escape Key Handler for the iconic Omegle "Stop -> Really? -> New" cycle
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
          return;
        }
        if (showReportModal) {
          setShowReportModal(false);
          return;
        }

        if (isConnected) {
          if (!stopConfirmState) {
            setStopConfirmState(true);
          } else {
            setStopConfirmState(false);
            onNext();
          }
        } else if (isDisconnected) {
          onStart();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isConnected, isDisconnected, stopConfirmState, showEmojiPicker, showReportModal, onNext, onStart]);

  // Auto-focus input when connected
  useEffect(() => {
    if (isConnected) {
      inputRef.current?.focus();
    }
  }, [isConnected]);

  // Multi-state button click handler
  const handleStopBtnClick = () => {
    if (isConnected) {
      if (!stopConfirmState) {
        setStopConfirmState(true);
      } else {
        setStopConfirmState(false);
        onNext();
      }
    } else if (isDisconnected) {
      onStart();
    } else if (isSearching) {
      onNext();
    }
  };

  const handleSend = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText);
    trackSendMessage(mode);
    setInputText('');
    setShowEmojiPicker(false);
    typingSentRef.current = false;
  }, [inputText, isConnected, onSendMessage, mode]);

  const handleInputChange = useCallback((value: string) => {
    if (value.length > MAX_MSG) return;
    setInputText(value);
    if (onTyping && isConnected && !typingSentRef.current) {
      typingSentRef.current = true;
      onTyping();
    }
  }, [onTyping, isConnected]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleReport = useCallback(() => {
    setShowReportModal(true);
    setReportSubmitted(false);
  }, []);

  const submitReport = useCallback(() => {
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
    }, 1800);
  }, []);

  return (
    <div className={`ow-chat-container ${isOverlay ? 'ow-overlay-mode' : ''}`}>
      {/* 1. Header Bar: Status & Interests */}
      <div className="ow-chat-header">
        <div className="ow-chat-partner-meta">
          <span className={`ow-status-dot ${isConnected ? 'live' : isSearching ? 'searching' : 'idle'}`} />
          <div className="ow-chat-title-wrap">
            <span className="ow-chat-title">
              {partnerProfile?.country ? `${getFlag(partnerProfile.country)} Stranger from ${partnerProfile.country}` : 'Stranger'}
            </span>
            <span className="ow-chat-subtitle">
              {isConnected ? 'Connected • P2P WebRTC' : isSearching ? 'Looking for someone...' : 'Ready to start'}
            </span>
          </div>
        </div>

        {isConnected && onOpenPreferences && (
          <button 
            type="button" 
            className="ow-chat-report-btn" 
            onClick={handleReport}
            title="Report inappropriate behavior"
          >
            <Flag size={13} />
            <span>Report</span>
          </button>
        )}
      </div>

      {/* Shared Interests Banner (if matched) */}
      {partnerProfile?.interests && partnerProfile.interests.length > 0 && (
        <div className="ow-shared-interests-banner">
          <Tag size={13} className="ow-tag-icon" />
          <span>You both like: <strong>{partnerProfile.interests.join(', ')}</strong></span>
        </div>
      )}

      {/* 2. Messages Log (Omegle Transcript Format) */}
      <div className="ow-chat-log-wrapper">
        <div className="ow-chat-log" role="log" aria-live="polite">
          {/* Searching Notice */}
          {isSearching && (
            <div className="ow-system-notice searching">
              <Search size={14} className="spin-icon" />
              <span>Looking for someone you can chat with...</span>
            </div>
          )}

          {/* Connection Established Welcome Notice */}
          {isConnected && messages.length === 0 && (
            <div className="ow-system-notice welcome">
              <span>You're now chatting with a random stranger. Say hi!</span>
            </div>
          )}

          {/* Disconnected Notice */}
          {connectionStatus === 'disconnected' && (
            <div className="ow-system-notice disconnected">
              <span>Stranger has disconnected.</span>
              <button className="ow-quick-next-btn" onClick={onStart}>
                Start a new chat (Esc)
              </button>
            </div>
          )}

          {/* Message List in Classic Omegle Style */}
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`ow-message-line ${msg.sender === 'you' ? 'ow-msg-you-line' : 'ow-msg-stranger-line'}`}
            >
              <span className={`ow-msg-sender ${msg.sender === 'you' ? 'ow-sender-you' : 'ow-sender-stranger'}`}>
                {msg.sender === 'you' ? 'You:' : 'Stranger:'}
              </span>
              <span className="ow-msg-content">{msg.text}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isStrangerTyping && (
            <div className="ow-typing-line">
              <span className="ow-typing-text">Stranger is typing</span>
              <div className="ow-typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* AI Icebreaker Quick Chips Shelf */}
        {isConnected && (
          <div className="ow-icebreakers-shelf">
            <span className="ow-shelf-tag">💡 Icebreaker:</span>
            <div className="ow-shelf-pills">
              {AI_ICEBREAKERS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="ow-icebreaker-chip"
                  onClick={() => {
                    onSendMessage(prompt);
                    trackSendMessage(mode);
                  }}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji Picker Popover */}
        {showEmojiPicker && (
          <div className="ow-emoji-popover" role="listbox">
            {['👋', '😊', '😂', '❤️', '👍', '🔥', '🎉', '🤔', '😍', '💯', '🙈', '😎', '🙌', '✨', '💬', '🎶'].map(emoji => (
              <button 
                key={emoji} 
                className="ow-emoji-item" 
                role="option" 
                aria-label={emoji}
                onClick={() => setInputText(prev => prev + emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Bottom Action Bar: Iconic Stop/Really/New Button + Input + Send */}
      <div className="ow-chat-bottom-bar">
        {/* The Famous Multi-State Esc Button */}
        <button
          type="button"
          className={`ow-stop-cycle-btn ${
            isConnected
              ? stopConfirmState
                ? 'state-really'
                : 'state-stop'
              : 'state-new'
          }`}
          onClick={handleStopBtnClick}
          title="Press Esc to Stop / Skip / Start New Chat"
          aria-label={isConnected ? (stopConfirmState ? 'Really Disconnect?' : 'Stop Chat') : 'Start New Chat'}
        >
          {isConnected ? (
            stopConfirmState ? (
              <>
                <span className="ow-btn-primary-text">Really?</span>
                <span className="ow-btn-esc-hint">Esc</span>
              </>
            ) : (
              <>
                <span className="ow-btn-primary-text">Stop</span>
                <span className="ow-btn-esc-hint">Esc</span>
              </>
            )
          ) : (
            <>
              <span className="ow-btn-primary-text">New</span>
              <span className="ow-btn-esc-hint">Esc</span>
            </>
          )}
        </button>

        {/* Input Form */}
        <form onSubmit={handleSend} className="ow-chat-form">
          <input
            ref={inputRef}
            type="text"
            className="ow-chat-input"
            placeholder={
              isConnected 
                ? "Type your message and press Enter..." 
                : isSearching 
                ? "Searching for a stranger..." 
                : "Press 'New' to start chatting..."
            }
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            maxLength={MAX_MSG}
            aria-label="Chat message input"
          />

          <button 
            type="button" 
            className="ow-emoji-btn" 
            aria-label="Emoji picker"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            disabled={!isConnected}
          >
            <Smile size={19} />
          </button>

          <button 
            type="submit" 
            className="ow-send-btn"
            disabled={!isConnected || !inputText.trim()} 
            aria-label="Send message"
          >
            <Send size={16} />
            <span className="ow-send-label">Send</span>
          </button>
        </form>
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="ow-modal-backdrop" onClick={() => !reportSubmitted && setShowReportModal(false)}>
          <div className="ow-report-card" onClick={e => e.stopPropagation()}>
            {reportSubmitted ? (
              <div className="ow-report-success">
                <Flag size={36} className="text-red" />
                <h3>User Reported</h3>
                <p>Thank you for keeping our community safe. Skipping to the next user...</p>
              </div>
            ) : (
              <>
                <h3>Report User</h3>
                <p>Select the reason for reporting this user:</p>
                <div className="ow-report-reasons">
                  {['Inappropriate or explicit content', 'Harassment or hate speech', 'Spam / Automated bot', 'Underage user', 'Other violation'].map(reason => (
                    <button 
                      key={reason} 
                      className="ow-report-reason-btn" 
                      onClick={() => {
                        submitReport();
                        onNext();
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button className="ow-report-cancel-btn" onClick={() => setShowReportModal(false)}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
