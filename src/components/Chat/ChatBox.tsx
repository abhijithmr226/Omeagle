import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Smile, Tag, Heart, 
  Flag, Zap
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
  const [stopState, setStopState] = useState<'stop' | 'really' | 'new'>('stop');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingSentRef = useRef(false);

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';
  const isDisconnected = connectionStatus === 'disconnected' || connectionStatus === 'timed-out' || connectionStatus === 'idle';

  // Synchronize stop button state with connection status
  useEffect(() => {
    if (isConnected) {
      setStopState('stop');
    } else {
      setStopState('new');
    }
  }, [isConnected, connectionStatus]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  // Escape key shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showReportModal) {
          setShowReportModal(false);
          return;
        }

        if (isConnected) {
          if (stopState === 'stop') {
            setStopState('really');
          } else {
            setStopState('new');
            onNext();
          }
        } else if (isDisconnected) {
          onStart();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isConnected, isDisconnected, stopState, showReportModal, onNext, onStart]);

  // Auto-focus input when connected
  useEffect(() => {
    if (isConnected) {
      inputRef.current?.focus();
    }
  }, [isConnected]);

  // Multi-state button click handler
  const handleSkipBtnClick = () => {
    if (isConnected) {
      if (stopState === 'stop') {
        setStopState('really');
      } else {
        setStopState('new');
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

  const handleSaveLog = () => {
    const transcript = messages
      .map(m => `${m.sender === 'you' ? 'You' : 'Stranger'}: ${m.text}`)
      .join('\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omegle-chat-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`ow-exact-chat-card ${isOverlay ? 'is-overlay' : ''}`}>
      {/* Messages Scroll Area */}
      <div className="ow-chat-transcript-body" role="log" aria-live="polite">
        <div className="ow-site-subtext">omegleweb.io: Talk to strangers!</div>

        {/* Searching Status */}
        {isSearching && (
          <div className="ow-status-line searching">
            Looking for someone you can chat with...
          </div>
        )}

        {/* Welcome Notice */}
        {isConnected && (
          <div className="ow-status-line welcome">
            You're now talking to a random stranger
            {partnerProfile?.country ? ` from ${getFlag(partnerProfile.country)} ${partnerProfile.country}` : ''}.
          </div>
        )}

        {/* Shared Interests Highlight */}
        {partnerProfile?.interests && partnerProfile.interests.length > 0 && (
          <div className="ow-shared-interests-line">
            You both like <strong>{partnerProfile.interests.join(', ')}</strong>.
          </div>
        )}

        {/* Transcript Messages List */}
        {messages.map((msg) => (
          <div key={msg.id} className="ow-transcript-row">
            <strong className={msg.sender === 'you' ? 'ow-tag-you' : 'ow-tag-stranger'}>
              {msg.sender === 'you' ? 'You:' : 'Stranger:'}
            </strong>
            <span className="ow-transcript-text"> {msg.text}</span>
          </div>
        ))}

        {/* Typing indicator */}
        {isStrangerTyping && (
          <div className="ow-typing-status-line">
            Stranger is typing...
          </div>
        )}

        {/* Disconnected Notice & Post-Chat Actions */}
        {connectionStatus === 'disconnected' && (
          <div className="ow-disconnected-area">
            <div className="ow-disconnected-title">Stranger has disconnected.</div>
            
            <div className="ow-post-chat-actions">
              <button type="button" className="ow-post-btn" onClick={onStart}>
                New Stranger
              </button>
              
              <button type="button" className="ow-post-btn" onClick={handleSaveLog}>
                Save Chat Log
              </button>

              <span className="ow-post-text">or <a href="#video" onClick={(e) => { e.preventDefault(); onStart(); }}>turn on video</a> or <a href="#safety">unmoderated section</a></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Controls Dock */}
      <div className="ow-exact-bottom-bar">
        {/* The Exact Blue Skip / Really? / New Button */}
        <button
          type="button"
          className={`ow-bottom-action-btn ${
            stopState === 'really' ? 'is-really' : stopState === 'new' ? 'is-new' : 'is-skip'
          }`}
          onClick={handleSkipBtnClick}
          title="Press Esc to Skip / Find New Stranger"
          aria-label={stopState === 'really' ? 'Really Disconnect?' : isConnected ? 'Skip Stranger' : 'New Stranger'}
        >
          <span className="ow-btn-main-label">
            {stopState === 'really' ? 'Really?' : isConnected ? 'Skip' : 'New'}
          </span>
          <span className="ow-btn-key-hint">Esc</span>
        </button>

        {/* Real Text Input */}
        <form onSubmit={handleSend} className="ow-bottom-input-form">
          <input
            ref={inputRef}
            type="text"
            className="ow-bottom-input-field"
            placeholder={
              isConnected 
                ? "Type a message..." 
                : isSearching 
                ? "Searching..." 
                : "Type a message..."
            }
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            maxLength={MAX_MSG}
            aria-label="Type message input"
          />
        </form>

        {/* The Exact Blue Send Button */}
        <button 
          type="button"
          className="ow-bottom-action-btn ow-send-action-btn"
          onClick={handleSend}
          disabled={!isConnected || !inputText.trim()}
          title="Press Enter to Send"
          aria-label="Send message"
        >
          <span className="ow-btn-main-label">Send</span>
          <span className="ow-btn-key-hint">Enter</span>
        </button>
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="ow-report-backdrop" onClick={() => !reportSubmitted && setShowReportModal(false)}>
          <div className="ow-report-modal-box" onClick={e => e.stopPropagation()}>
            {reportSubmitted ? (
              <div className="ow-report-success-view">
                <Flag size={36} color="#DC2626" />
                <h3>User Reported</h3>
                <p>Thank you for helping keep OmegleWeb clean and safe.</p>
              </div>
            ) : (
              <>
                <h3>Report User</h3>
                <p>Select a reason for reporting:</p>
                <div className="ow-report-choices">
                  {['Explicit / Inappropriate content', 'Harassment or hate speech', 'Spam / Automated bot', 'Underage user', 'Other violation'].map(reason => (
                    <button 
                      key={reason}
                      className="ow-report-choice-btn"
                      onClick={() => {
                        setReportSubmitted(true);
                        setTimeout(() => {
                          setShowReportModal(false);
                          setReportSubmitted(false);
                          onNext();
                        }, 1200);
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <button className="ow-report-close-btn" onClick={() => setShowReportModal(false)}>
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
