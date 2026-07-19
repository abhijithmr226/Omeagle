import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Star, Share2, Users, Flag, Shield, ArrowRight, User, StarOff, Languages } from 'lucide-react';
import { ChatMessage, ConnectionStatus, StrangerProfile, Favorite } from '../../types/chat';
import { translateText } from '../../services/translate';

interface ChatBoxProps {
  messages: ChatMessage[];
  connectionStatus: ConnectionStatus;
  strangerProfile: StrangerProfile | null;
  onlineCount: number;
  language: string;
  onSendMessage: (text: string) => void;
  onNext: () => void;
  onStart: () => void;
  onOpenReport: () => void;
  onOpenSafety: () => void;
  mode: 'video' | 'text';
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages, connectionStatus, strangerProfile, onlineCount, language,
  onSendMessage, onNext, onStart, onOpenReport, onOpenSafety, mode
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [translatedMsgs, setTranslatedMsgs] = useState<Record<string, string>>({});
  const translatingRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isConnected = connectionStatus === 'connected';
  const isIdle = connectionStatus === 'idle';
  const isDisconnected = connectionStatus === 'disconnected';
  const canStart = isIdle || isDisconnected;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setIsFavorite(false);
  }, [connectionStatus]);

  // Auto-translate stranger messages — use ref to avoid stale closure
  useEffect(() => {
    if (!language || language === 'en') return;
    messages.forEach((msg) => {
      if (msg.sender === 'stranger' && !translatedMsgs[msg.id] && !translatingRef.current.has(msg.id)) {
        translatingRef.current.add(msg.id);
        translateText(msg.text, language).then((translated) => {
          if (translated !== msg.text) {
            setTranslatedMsgs(prev => ({ ...prev, [msg.id]: translated }));
          }
        });
      }
    });
  }, [messages, language]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const addEmoji = (emoji: string) => setInputText(prev => prev + emoji);

  const handleFavorite = () => {
    if (!isConnected) return;
    const fav: Favorite = { id: Date.now().toString(), timestamp: Date.now(), messages: [...messages] };
    const existing = JSON.parse(localStorage.getItem('omeagle_favorites') || '[]');
    existing.push(fav);
    localStorage.setItem('omeagle_favorites', JSON.stringify(existing));
    setIsFavorite(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Omeagle — Talk to strangers', url: 'https://omeagle.online' }).catch(() => {});
    } else {
      navigator.clipboard.writeText('https://omeagle.online');
    }
  };

  const displayText = (msg: ChatMessage) => {
    if (msg.sender === 'stranger' && translatedMsgs[msg.id]) {
      return translatedMsgs[msg.id];
    }
    return msg.text;
  };

  return (
    <div className="chat-column-container">
      <div className="chat-top-bar">
        <div className="online-user-info">
          <div className="user-icon-circle">
            <User size={20} />
          </div>
          <div>
            <div className="online-val">{onlineCount.toLocaleString()}</div>
            <div className="online-sub">users online</div>
          </div>
        </div>
        <div className="action-btns-group">
          {language && language !== 'en' && (
            <div className="lang-indicator">
              <Languages size={14} />
              <span>Auto-translate: {language.toUpperCase()}</span>
            </div>
          )}
          <button className="top-action-btn" onClick={handleFavorite} disabled={!isConnected} title="Save to Favorites">
            {isFavorite ? <StarOff size={16} /> : <Star size={16} />}
            <span>{isFavorite ? 'Saved' : 'Favorite'}</span>
          </button>
          <button className="top-action-btn" onClick={handleShare} title="Share">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="chat-feed-card">
        <div className="system-banner">
          <p className="sys-headline">You're now chatting with a random stranger.</p>
          {strangerProfile?.interests?.length ? (
            <p className="sys-interests">You both like <span className="highlight-interest">{strangerProfile.interests.slice(0, 3).join(', ')}</span>.</p>
          ) : null}
          {language && language !== 'en' && (
            <p className="sys-translate"><Languages size={12} /> Stranger messages will be auto-translated to your language.</p>
          )}
        </div>

        <div className="messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className={`message-bubble bubble-${msg.sender}`}>
                {msg.sender !== 'system' && (
                  <div className="bubble-header">
                    <span className="sender-label">{msg.sender === 'you' ? 'You' : 'Stranger'}</span>
                    <span className="msg-timestamp">{msg.timestamp}</span>
                  </div>
                )}
                <div className="bubble-text">{displayText(msg)}</div>
                {msg.sender === 'stranger' && translatedMsgs[msg.id] && (
                  <div className="bubble-original">Original: {msg.text}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-popover">
            {['👋', '😊', '😂', '❤️', '👍', '🔥', '🎉', '🤔', '😍', '💯'].map(emoji => (
              <button key={emoji} className="emoji-btn" onClick={() => addEmoji(emoji)}>{emoji}</button>
            ))}
          </div>
        )}

        {canStart ? (
          <div className="chat-start-area">
            <button className="chat-start-btn" onClick={() => onStart()}>
              <Users size={20} />
              <span>Start Chat</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              type="text"
              className="chat-input-field"
              placeholder={isConnected ? "Type your message..." : "Waiting for connection..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              disabled={!isConnected}
            />
            <button type="button" className="emoji-toggle-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={!isConnected}>
              <Smile size={20} />
            </button>
            <button type="submit" className="send-message-btn" disabled={!isConnected || !inputText.trim()}>
              <Send size={18} />
            </button>
          </form>
        )}
      </div>

      <div className="action-cards-grid">
        <div className="action-card" onClick={onNext}>
          <div className="action-card-icon blue-bg"><Users size={20} /></div>
          <div className="action-card-text"><h5>Next</h5><p>Find next stranger</p></div>
          <ArrowRight size={18} className="card-arrow" />
        </div>
        <div className="action-card" onClick={onOpenReport}>
          <div className="action-card-icon red-bg"><Flag size={20} /></div>
          <div className="action-card-text"><h5>Report</h5><p>Report inappropriate behavior</p></div>
          <ArrowRight size={18} className="card-arrow" />
        </div>
        <div className="action-card" onClick={onOpenSafety}>
          <div className="action-card-icon green-bg"><Shield size={20} /></div>
          <div className="action-card-text"><h5>Safety</h5><p>Tips to stay safe</p></div>
          <ArrowRight size={18} className="card-arrow" />
        </div>
      </div>

      <style>{`
        .chat-column-container { display: flex; flex-direction: column; gap: 1rem; height: 100%; }
        .chat-top-bar { display: flex; align-items: center; justify-content: space-between; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 0.75rem 1.25rem; flex-wrap: wrap; gap: 0.5rem; }
        .online-user-info { display: flex; align-items: center; gap: 0.75rem; }
        .user-icon-circle { width: 38px; height: 38px; border-radius: var(--radius-full); background-color: var(--brand-blue-light); color: var(--brand-blue); display: flex; align-items: center; justify-content: center; }
        .online-val { font-weight: 800; font-size: 1.1rem; color: var(--brand-blue); line-height: 1.1; }
        .online-sub { font-size: 0.78rem; color: var(--text-secondary); }
        .action-btns-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .lang-indicator { display: flex; align-items: center; gap: 0.3rem; background: var(--brand-blue-light); color: var(--brand-blue); padding: 0.3rem 0.6rem; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; }
        .top-action-btn { display: flex; align-items: center; gap: 0.4rem; border: 1px solid var(--border-color); background-color: var(--bg-surface); color: var(--text-primary); padding: 0.45rem 0.85rem; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; }
        .top-action-btn:hover { background-color: var(--bg-surface-secondary); }
        .top-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .chat-feed-card { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); display: flex; flex-direction: column; height: 480px; position: relative; overflow: hidden; }
        .system-banner { background-color: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 1rem 1.25rem; font-size: 0.9rem; }
        .sys-headline { font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem; }
        .sys-interests { color: var(--text-secondary); font-size: 0.85rem; }
        .sys-translate { color: var(--brand-blue); font-size: 0.8rem; font-weight: 600; margin-top: 0.25rem; display: flex; align-items: center; gap: 0.3rem; }
        .highlight-interest { color: var(--brand-orange); font-weight: 700; }
        .messages-list { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .message-row { display: flex; width: 100%; }
        .message-row.you { justify-content: flex-end; }
        .message-row.stranger { justify-content: flex-start; }
        .message-row.system { justify-content: center; }
        .message-bubble { max-width: 75%; padding: 0.75rem 1rem; border-radius: var(--radius-lg); position: relative; }
        .bubble-you { background-color: var(--brand-blue); color: #ffffff; border-bottom-right-radius: 4px; }
        .bubble-stranger { background-color: var(--bg-surface-secondary); color: var(--text-primary); border-bottom-left-radius: 4px; }
        .bubble-system { background: none; color: var(--text-muted); font-size: 0.82rem; font-style: italic; text-align: center; max-width: 100%; }
        .bubble-header { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; font-size: 0.75rem; margin-bottom: 0.25rem; opacity: 0.85; }
        .sender-label { font-weight: 700; }
        .bubble-text { font-size: 0.95rem; line-height: 1.4; word-break: break-word; }
        .bubble-original { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem; font-style: italic; }
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
        .action-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .action-card { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 1rem; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.2s ease; }
        .action-card:hover { box-shadow: var(--shadow-md); border-color: var(--border-color-hover); }
        .action-card-icon { width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; }
        .action-card-text { flex: 1; }
        .action-card-text h5 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.1rem; }
        .action-card-text p { font-size: 0.78rem; color: var(--text-secondary); }
        .card-arrow { color: var(--text-muted); }
        @media (max-width: 768px) {
          .action-cards-grid { grid-template-columns: 1fr; }
          .chat-feed-card { height: 380px; }
          .chat-top-bar { padding: 0.6rem 0.85rem; }
          .top-action-btn span { display: none; }
          .lang-indicator span { display: none; }
        }
      `}</style>
    </div>
  );
};
