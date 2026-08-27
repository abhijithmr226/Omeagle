import React from 'react';
import { 
  Globe, Users, Sparkles, ShieldCheck, Heart, Zap, Tag, Check, Award, Lock, ArrowUpRight
} from 'lucide-react';
import type { UserSettings } from '../../types/chat';

interface MatchingPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onlineCount: number;
  onOpenPreferences: () => void;
  onSelectInterest: (tag: string) => void;
}

const POPULAR_INTERESTS = [
  'Football', 'Gaming', 'Music', 'Movies', 'Anime', 'Travel', 
  'Technology', 'Study', 'Fitness', 'Language Exchange', 
  'Cricket', 'India', 'Nepal', 'Sri Lanka', 'Dosti', 'English'
];

export const MatchingPanel: React.FC<MatchingPanelProps> = ({
  settings,
  onUpdateSettings,
  onlineCount,
  onOpenPreferences,
  onSelectInterest
}) => {
  const activeInterests = settings.interests || [];

  const toggleTag = (tag: string) => {
    const exists = activeInterests.includes(tag);
    const updated = exists 
      ? activeInterests.filter(t => t !== tag)
      : [...activeInterests, tag];
    onUpdateSettings({ interests: updated });
  };

  return (
    <aside className="matching-panel-root" aria-label="Matching Controls & Filters">
      {/* 1. Live Counters & Match Quality */}
      <div className="panel-card stats-card">
        <div className="stats-header">
          <span className="live-dot-pulse"></span>
          <span className="stats-title">Live Matchmaking Network</span>
        </div>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-val">{(onlineCount || 1240).toLocaleString()}</span>
            <span className="stat-lbl">Online Users</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">190+</span>
            <span className="stat-lbl">Countries</span>
          </div>
          <div className="stat-box">
            <span className="stat-val">&lt; 0.8s</span>
            <span className="stat-lbl">Avg Match Time</span>
          </div>
          <div className="stat-box">
            <span className="stat-val text-green">99.4%</span>
            <span className="stat-lbl">Match Quality</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Match Filters */}
      <div className="panel-card filters-card">
        <div className="card-heading-row">
          <h3 className="card-heading">
            <Heart size={16} className="text-orange" /> Matching Preferences
          </h3>
          <button className="edit-link-btn" onClick={onOpenPreferences}>
            More Filters
          </button>
        </div>

        {/* Gender Preference */}
        <div className="filter-group">
          <label className="filter-label">Looking For</label>
          <div className="gender-btn-group">
            {[
              { id: 'any', label: 'Anyone ⚧' },
              { id: 'female', label: 'Girls ♀' },
              { id: 'male', label: 'Boys ♂' }
            ].map(item => (
              <button
                key={item.id}
                className={`gender-pill ${(settings.preferredGender || 'any') === item.id ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ preferredGender: item.id as any })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Country / Region Indicator */}
        <div className="filter-group mt-3">
          <div className="region-indicator-box" onClick={onOpenPreferences}>
            <Globe size={16} className="text-orange" />
            <div className="region-text">
              <span className="region-name">{settings.country ? `${settings.country}` : 'Global Matchmaking'}</span>
              <span className="region-sub">Low Latency Edge Relay</span>
            </div>
            <ArrowUpRight size={14} className="text-muted" />
          </div>
        </div>
      </div>

      {/* 3. Interest Matching Chips */}
      <div className="panel-card interests-card">
        <div className="card-heading-row">
          <h3 className="card-heading">
            <Tag size={16} className="text-orange" /> Interest Topics
          </h3>
          <span className="badge-count">{activeInterests.length} selected</span>
        </div>
        <p className="interests-subtitle">Pair instantly with strangers who share your passions:</p>
        
        <div className="interest-chips-cloud">
          {POPULAR_INTERESTS.map(tag => {
            const isSelected = activeInterests.includes(tag);
            return (
              <button
                key={tag}
                className={`interest-tag-btn ${isSelected ? 'active-tag' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {isSelected && <Check size={12} className="check-icon" />}
                <span>#{tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Trust & Security Badges */}
      <div className="panel-card trust-card">
        <div className="trust-badge-row">
          <ShieldCheck size={16} className="text-green" />
          <span>Real-Time AI Moderation Active</span>
        </div>
        <div className="trust-badge-row">
          <Lock size={16} className="text-orange" />
          <span>Peer-to-Peer Encrypted WebRTC</span>
        </div>
      </div>
    </aside>
  );
};
