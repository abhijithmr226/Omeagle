import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, ArrowRight, Users, Search, Globe, Tag, Heart, Flag } from 'lucide-react';
import { ChatMessage, ConnectionStatus, PartnerProfile } from '../../types/chat';

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
  isStrangerTyping?: boolean;
  onTyping?: () => void;
  partnerProfile?: PartnerProfile | null;
}

const MAX_MSG = 2000;

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages, connectionStatus, onSendMessage, onNext, onStart, mode,
  isStrangerTyping = false, onTyping, partnerProfile,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingSentRef = useRef(false);

  const isConnected = connectionStatus === 'connected';
  const isSearching = connectionStatus === 'searching' || connectionStatus === 'connecting';
  const canStart = connectionStatus === 'idle' || connectionStatus === 'disconnected' || connectionStatus === 'timed-out';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStrangerTyping]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmojiPicker(false);
    };
    if (showEmojiPicker) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [showEmojiPicker]);

  useEffect(() => {
    if (isConnected) inputRef.current?.focus();
  }, [isConnected]);

  const handleSend = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    typingSentRef.current = false;
  }, [inputText, isConnected, onSendMessage]);

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
    }, 2000);
  }, []);

  const msgCount = inputText.length;

  return (
    <div className="chat-column-container">
      <div className="chat-feed-card">
        <div className="system-banner">
          <p className="sys-headline">You're now chatting with a random stranger.</p>
        </div>

        {partnerProfile && isConnected && (
          <div className="partner-info-bar">
            {partnerProfile.country && (
              <span className="partner-chip"><Globe size={13} /> {getFlag(partnerProfile.country)} {partnerProfile.country}</span>
            )}
            {partnerProfile.gender && (
              <span className="partner-chip"><Heart size={13} /> {partnerProfile.gender}</span>
            )}
            {partnerProfile.interests && partnerProfile.interests.length > 0 && (
              <span className="partner-chip interests-chip"><Tag size={13} /> {partnerProfile.interests.slice(0, 4).join(', ')}</span>
            )}
          </div>
        )}

        <div className="messages-list" role="log" aria-live="polite">
          {isSearching && (
            <div className="message-row system">
              <div className="bubble-system">
                <Search size={16} className="spin-icon" /> Looking for someone to chat with...
              </div>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isStrangerTyping && (
            <div className="message-row stranger">
              <div className="message-bubble bubble-stranger typing-indicator">
                <span className="sender-label">Stranger</span>
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-popover" role="listbox">
            {['👋', '😊', '😂', '❤️', '👍', '🔥', '🎉', '🤔', '😍', '💯'].map(emoji => (
              <button key={emoji} className="emoji-btn" role="option" aria-label={emoji}
                onClick={() => setInputText(prev => prev + emoji)}>{emoji}</button>
            ))}
          </div>
        )}

        {canStart ? (
          <div className="chat-start-area">
            <button className="chat-start-btn" onClick={onStart} aria-label="Start chat">
              <Users size={20} />
              <span>Start Chat</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              ref={inputRef}
              type="text"
              className="chat-input-field"
              placeholder={isConnected ? "Type your message..." : isSearching ? "Searching..." : "Waiting..."}
              value={inputText}
              onChange={e => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isConnected}
              maxLength={MAX_MSG}
              aria-label="Message input"
            />
            <button type="button" className="emoji-toggle-btn" aria-label="Emoji picker"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={!isConnected}>
              <Smile size={20} />
            </button>
            <button type="submit" className="send-message-btn"
              disabled={!isConnected || !inputText.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
            {isConnected && msgCount > 0 && (
              <span className={`msg-counter ${msgCount > MAX_MSG * 0.9 ? 'near-limit' : ''}`}>
                {msgCount}/{MAX_MSG}
              </span>
            )}
          </form>
        )}
      </div>

      <div className="action-cards-grid">
        <div className="action-card" onClick={onNext} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onNext()}>
          <div className="action-card-icon blue-bg"><Users size={20} /></div>
          <div className="action-card-text"><h5>Next</h5><p>Find next stranger</p></div>
          <ArrowRight size={18} className="card-arrow" />
        </div>
        {isConnected && (
          <div className="action-card report-card" onClick={handleReport} role="button" tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleReport()}>
            <div className="action-card-icon red-bg"><Flag size={20} /></div>
            <div className="action-card-text"><h5>Report</h5><p>Flag inappropriate behavior</p></div>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => !reportSubmitted && setShowReportModal(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            {reportSubmitted ? (
              <div className="report-success">
                <Flag size={32} />
                <h3>Report Submitted</h3>
                <p>Thank you for helping keep Omeagle safe. We will review this report.</p>
              </div>
            ) : (
              <>
                <h3>Report User</h3>
                <p>Why are you reporting this user?</p>
                <div className="report-options">
                  {['Inappropriate content', 'Harassment or bullying', 'Spam or bots', 'Underage user', 'Other'].map(reason => (
                    <button key={reason} className="report-option" onClick={submitReport}>{reason}</button>
                  ))}
                </div>
                <button className="report-cancel" onClick={() => setShowReportModal(false)}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .chat-column-container { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
        .chat-feed-card { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); display: flex; flex-direction: column; height: 480px; position: relative; overflow: hidden; }
        .system-banner { background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 1rem 1.25rem; }
        .sys-headline { font-weight: 700; color: var(--text-primary); font-size: 0.9rem; }
        .partner-info-bar { display: flex; flex-wrap: wrap; gap: 0.35rem; padding: 0.5rem 1.25rem; background: var(--brand-blue-light); border-bottom: 1px solid var(--border-color); }
        .partner-chip { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0.5rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; color: var(--brand-blue); white-space: nowrap; }
        .interests-chip { color: var(--text-primary); background: var(--bg-surface-secondary); }
        .messages-list { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .message-row { display: flex; width: 100%; }
        .message-row.you { justify-content: flex-end; }
        .message-row.stranger { justify-content: flex-start; }
        .message-row.system { justify-content: center; }
        .message-bubble { max-width: 75%; padding: 0.75rem 1rem; border-radius: var(--radius-lg); }
        .bubble-you { background-color: var(--brand-blue); color: #ffffff; border-bottom-right-radius: 4px; }
        .bubble-stranger { background-color: var(--bg-surface-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
        .bubble-system { background: none; color: var(--text-muted); font-size: 0.82rem; font-style: italic; text-align: center; max-width: 100%; display: flex; align-items: center; gap: 0.4rem; justify-content: center; }
        .bubble-header { display: flex; justify-content: space-between; gap: 1.5rem; font-size: 0.75rem; margin-bottom: 0.25rem; opacity: 0.85; }
        .sender-label { font-weight: 700; }
        .bubble-text { font-size: 0.95rem; line-height: 1.4; word-break: break-word; }
        .typing-indicator { padding: 0.5rem 1rem; }
        .typing-dots { display: flex; gap: 4px; padding: 4px 0; }
        .typing-dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); animation: typingBounce 1.4s infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-6px); opacity: 1; } }
        .spin-icon { animation: spin 1.5s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .emoji-picker-popover { position: absolute; bottom: 70px; right: 90px; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.3rem; box-shadow: var(--shadow-lg); z-index: 50; }
        .emoji-btn { font-size: 1.4rem; padding: 0.3rem; border-radius: var(--radius-sm); }
        .emoji-btn:hover { background-color: var(--bg-surface-secondary); }
        .chat-start-area { display: flex; align-items: center; justify-content: center; padding: 2rem; border-top: 1px solid var(--border-color); background-color: var(--bg-surface); }
        .chat-start-btn { display: flex; align-items: center; gap: 0.6rem; background-color: var(--status-green); color: #fff; font-weight: 700; font-size: 1rem; padding: 0.85rem 2rem; border-radius: var(--radius-md); }
        .chat-start-btn:hover { background-color: #059669; }
        .chat-input-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-top: 1px solid var(--border-color); background-color: var(--bg-surface); }
        .chat-input-field { flex: 1; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.65rem 1rem; font-size: 0.95rem; outline: none; background-color: var(--bg-surface); color: var(--text-primary); }
        .chat-input-field:focus { border-color: var(--brand-blue); }
        .emoji-toggle-btn { color: var(--text-secondary); padding: 0.5rem; border-radius: var(--radius-md); }
        .emoji-toggle-btn:hover { color: var(--brand-blue); background-color: var(--bg-surface-secondary); }
        .send-message-btn { display: flex; align-items: center; justify-content: center; background-color: var(--brand-blue); color: #ffffff; padding: 0.65rem 1rem; border-radius: var(--radius-md); }
        .send-message-btn:hover:not(:disabled) { background-color: var(--brand-blue-hover); }
        .send-message-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .msg-counter { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
        .msg-counter.near-limit { color: var(--status-red); font-weight: 600; }
        .action-cards-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
        .action-card { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s ease; }
        .action-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-color-hover); }
        .action-card-icon { width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; }
        .blue-bg { background: var(--brand-blue-light); color: var(--brand-blue); }
        .red-bg { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .report-card:hover { border-color: #ef4444; }
        .action-card-text { flex: 1; }
        .action-card-text h5 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.1rem; }
        .action-card-text p { font-size: 0.78rem; color: var(--text-secondary); }
        .card-arrow { color: var(--text-muted); }
        @media (max-width: 768px) { .chat-feed-card { height: 380px; } }
        .report-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; -webkit-overflow-scrolling: touch; }
        .report-modal { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 2rem 1.5rem; max-width: 400px; width: 100%; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.4); max-height: 85vh; overflow-y: auto; }
        .report-modal h3 { font-size: 1.3rem; margin-bottom: 0.5rem; color: var(--text-primary); }
        .report-modal p { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.25rem; }
        .report-options { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .report-option { padding: 0.85rem 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); color: var(--text-primary); font-size: 0.95rem; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.2s; min-height: 48px; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .report-option:active { border-color: #ef4444; background: rgba(239,68,68,0.05); }
        .report-option:hover { border-color: #ef4444; background: rgba(239,68,68,0.05); color: #ef4444; }
        .report-cancel { padding: 0.7rem 1rem; background: transparent; border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.9rem; cursor: pointer; min-height: 44px; width: 100%; }
        .report-cancel:active { border-color: var(--text-secondary); }
        .report-success { padding: 1rem 0; }
        .report-success svg { color: #22c55e; margin-bottom: 0.75rem; }
        .report-success h3 { color: #22c55e; margin-bottom: 0.5rem; }

        @media (max-width: 480px) {
          .report-modal-overlay { align-items: flex-end; padding: 0; }
          .report-modal { border-radius: var(--radius-xl) var(--radius-xl) 0 0; padding: 1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px)); max-height: 75vh; }
          .report-option { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
};

const MessageBubble = React.memo<{ message: ChatMessage }>(({ message }) => (
  <div className={`message-row ${message.sender}`}>
    <div className={`message-bubble bubble-${message.sender}`}>
      {message.sender !== 'system' && (
        <div className="bubble-header">
          <span className="sender-label">{message.sender === 'you' ? 'You' : 'Stranger'}</span>
          <span className="msg-timestamp">{message.timestamp}</span>
        </div>
      )}
      <div className="bubble-text">{message.text}</div>
    </div>
  </div>
));
