import React, { useState } from 'react';
import { Sparkles, MessageCircle, Gamepad2, Languages, X, Copy, Check, Shuffle } from 'lucide-react';

interface AIIcebreakersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

const AI_ICEBREAKERS = [
  "If you could travel anywhere in the world tomorrow for free, where would you go?",
  "What is the funniest or most unexpected thing that happened to you this week?",
  "If you could instantly master any one musical instrument or language, what would it be?",
  "Chai or Coffee? What's your ultimate comfort food?",
  "What movie or anime can you rewatch 100 times without ever getting bored?",
  "What's one conspiracy theory or mystery you secretly find fascinating?",
  "If you had a superpower for 24 hours, what would you do first?",
  "What song always puts you in an instant good mood?",
  "Would you rather live on Mars for a year or at the bottom of the ocean for a month?",
  "What's the best piece of advice anyone has ever given you?"
];

const MINI_GAMES = [
  { title: "Two Truths & A Lie", prompt: "I'll tell you 2 truths and 1 lie about myself — you have to guess which one is the lie!" },
  { title: "Guess My City in 5 Clues", prompt: "Ask me up to 5 yes/no questions to guess which city I live in!" },
  { title: "Rapid Fire 5 Questions", prompt: "Let's do 5 rapid-fire questions: Pizza or Burger? Mountains or Beach? Early bird or Night owl?" },
  { title: "Movie Plot in 3 Words", prompt: "Describe your favorite movie using only 3 words and let me guess the title!" }
];

const QUICK_TRANSLATIONS = [
  { lang: "Hindi (हिन्दी)", phrase: "नमस्ते! आप कैसे हैं और कहाँ से हैं?", trans: "Namaste! How are you and where are you from?" },
  { lang: "Arabic (العربية)", phrase: "مرحباً! كيف حالك ومن أي بلد أنت؟", trans: "Hello! How are you and what country are you from?" },
  { lang: "Spanish (Español)", phrase: "¡Hola! ¿De dónde eres y qué tal tu día?", trans: "Hello! Where are you from and how is your day?" },
  { lang: "Japanese (日本語)", phrase: "こんにちは！どこからですか？", trans: "Konnichiwa! Where are you from?" }
];

export const AIIcebreakersModal: React.FC<AIIcebreakersModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [activeTab, setActiveTab] = useState<'icebreakers' | 'games' | 'translation'>('icebreakers');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleCopyOrSend = (text: string, idx: number) => {
    if (onSendToChat) {
      onSendToChat(text);
    } else {
      navigator.clipboard?.writeText(text);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-header-title">
            <Sparkles size={20} className="text-purple" />
            <div>
              <h3>AI Conversation Spark &amp; Games</h3>
              <p>Break the ice instantly with smart conversation starters</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="ai-tabs-row">
          <button 
            className={`ai-tab-btn ${activeTab === 'icebreakers' ? 'active' : ''}`}
            onClick={() => setActiveTab('icebreakers')}
          >
            <MessageCircle size={16} /> <span>Icebreakers</span>
          </button>
          <button 
            className={`ai-tab-btn ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <Gamepad2 size={16} /> <span>Mini-Games</span>
          </button>
          <button 
            className={`ai-tab-btn ${activeTab === 'translation' ? 'active' : ''}`}
            onClick={() => setActiveTab('translation')}
          >
            <Languages size={16} /> <span>Translations</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="ai-modal-body">
          {activeTab === 'icebreakers' && (
            <div className="ai-cards-list">
              {AI_ICEBREAKERS.map((item, idx) => (
                <div key={idx} className="ai-item-card" onClick={() => handleCopyOrSend(item, idx)}>
                  <p className="ai-prompt-text">"{item}"</p>
                  <button className="copy-action-btn" title="Send to stranger">
                    {copiedIdx === idx ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'games' && (
            <div className="ai-cards-list">
              {MINI_GAMES.map((game, idx) => (
                <div key={idx} className="ai-game-card" onClick={() => handleCopyOrSend(game.prompt, idx)}>
                  <div className="game-card-head">
                    <span className="game-badge">Game</span>
                    <h4>{game.title}</h4>
                  </div>
                  <p className="game-prompt">"{game.prompt}"</p>
                  <button className="send-game-btn">
                    {copiedIdx === idx ? 'Sent to Stranger!' : 'Send Game Challenge'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'translation' && (
            <div className="ai-cards-list">
              {QUICK_TRANSLATIONS.map((tr, idx) => (
                <div key={idx} className="ai-item-card" onClick={() => handleCopyOrSend(tr.phrase, idx)}>
                  <div>
                    <span className="lang-tag">{tr.lang}</span>
                    <p className="ai-prompt-text mt-1">{tr.phrase}</p>
                    <span className="text-muted text-xs">({tr.trans})</span>
                  </div>
                  <button className="copy-action-btn" title="Send phrase">
                    {copiedIdx === idx ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
