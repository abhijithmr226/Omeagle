import React, { useState, useCallback, useRef } from 'react';
import { X, Tag, Plus } from 'lucide-react';

interface InterestTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

const POPULAR_INTERESTS = [
  'music', 'gaming', 'anime', 'movies', 'travel',
  'sports', 'coding', 'art', 'fitness', 'reading',
  'food', 'tech', 'crypto', 'fashion', 'photography'
];

export const InterestTagInput: React.FC<InterestTagInputProps> = ({
  tags, onChange, maxTags = 10, placeholder = 'Add interests (e.g. music, gaming)...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback((value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || tags.length >= maxTags) return;
    if (tags.some(t => t.toLowerCase() === trimmed)) return;
    onChange([...tags, trimmed]);
    setInputValue('');
  }, [tags, onChange, maxTags]);

  const removeTag = useCallback((idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  }, [tags, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }, [addTag, removeTag, inputValue, tags.length]);

  const availableSuggestions = POPULAR_INTERESTS.filter(item =>
    !tags.includes(item) && item.includes(inputValue.trim().toLowerCase())
  );

  const availablePopular = POPULAR_INTERESTS.filter(item => !tags.includes(item)).slice(0, 8);

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-container" onClick={() => inputRef.current?.focus()}>
        <div className="tag-input-tags">
          {tags.map((tag, idx) => (
            <span key={idx} className="tag-chip">
              <Tag size={12} />
              {tag}
              <button type="button" className="tag-remove" onClick={(e) => { e.stopPropagation(); removeTag(idx); }}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            className="tag-input-field"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ''}
            maxLength={30}
          />
        )}
        <span className="tag-counter">{tags.length}/{maxTags}</span>
      </div>

      {/* Autocomplete dropdown when typing */}
      {isFocused && inputValue.trim().length > 0 && availableSuggestions.length > 0 && (
        <div className="tag-suggestions-dropdown">
          {availableSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="tag-suggestion-item"
              onMouseDown={(e) => { e.preventDefault(); addTag(item); }}
            >
              <Tag size={12} />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popular quick-add chips */}
      {availablePopular.length > 0 && tags.length < maxTags && (
        <div className="popular-tags-row">
          <span className="popular-label">Popular:</span>
          <div className="popular-chips">
            {availablePopular.map((item, idx) => (
              <button
                key={idx}
                type="button"
                className="popular-chip"
                onClick={() => addTag(item)}
              >
                <Plus size={10} />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .tag-input-wrapper { display: flex; flex-direction: column; gap: 0.5rem; position: relative; width: 100%; }
        .tag-input-container { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); min-height: 44px; cursor: text; transition: border-color 0.2s; }
        .tag-input-container:focus-within { border-color: var(--brand-blue); }
        .tag-input-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .tag-chip { display: inline-flex; align-items: center; gap: 0.3rem; background: var(--brand-blue-light); color: var(--brand-blue); padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
        .tag-remove { display: flex; align-items: center; justify-content: center; color: var(--brand-blue); opacity: 0.6; padding: 1px; border-radius: 50%; }
        .tag-remove:hover { opacity: 1; background: rgba(0,102,255,0.1); }
        .tag-input-field { flex: 1; min-width: 80px; border: none; outline: none; background: transparent; font-size: 0.9rem; color: var(--text-primary); padding: 0.25rem 0; }
        .tag-counter { font-size: 0.7rem; color: var(--text-muted); margin-left: auto; white-space: nowrap; }
        .tag-suggestions-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 50; max-height: 160px; overflow-y: auto; margin-top: 0.25rem; }
        .tag-suggestion-item { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.85rem; color: var(--text-primary); transition: background 0.15s; }
        .tag-suggestion-item:hover { background: var(--bg-surface-secondary); color: var(--brand-blue); }
        .popular-tags-row { display: flex; align-items: center; gap: 0.5rem; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 0.2rem; }
        .popular-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); white-space: nowrap; }
        .popular-chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .popular-chip { display: inline-flex; align-items: center; gap: 0.25rem; background: var(--bg-surface-secondary); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-full); padding: 0.15rem 0.5rem; font-size: 0.75rem; font-weight: 500; transition: all 0.15s; }
        .popular-chip:hover { border-color: var(--brand-blue); color: var(--brand-blue); background: var(--brand-blue-light); }
      `}</style>
    </div>
  );
};
