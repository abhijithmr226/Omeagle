import React, { useState, useCallback, useRef } from 'react';
import { X, Tag } from 'lucide-react';

interface InterestTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export const InterestTagInput: React.FC<InterestTagInputProps> = ({
  tags, onChange, maxTags = 10, placeholder = 'Add interests...',
}) => {
  const [inputValue, setInputValue] = useState('');
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

  return (
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
          onKeyDown={handleKeyDown}
          onBlur={() => { if (inputValue.trim()) addTag(inputValue); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          maxLength={30}
        />
      )}
      <span className="tag-counter">{tags.length}/{maxTags}</span>
      <style>{`
        .tag-input-container { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-surface); min-height: 44px; cursor: text; transition: border-color 0.2s; }
        .tag-input-container:focus-within { border-color: var(--brand-blue); }
        .tag-input-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .tag-chip { display: inline-flex; align-items: center; gap: 0.3rem; background: var(--brand-blue-light); color: var(--brand-blue); padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
        .tag-remove { display: flex; align-items: center; justify-content: center; color: var(--brand-blue); opacity: 0.6; padding: 1px; border-radius: 50%; }
        .tag-remove:hover { opacity: 1; background: rgba(0,102,255,0.1); }
        .tag-input-field { flex: 1; min-width: 80px; border: none; outline: none; background: transparent; font-size: 0.9rem; color: var(--text-primary); padding: 0.25rem 0; }
        .tag-counter { font-size: 0.7rem; color: var(--text-muted); margin-left: auto; white-space: nowrap; }
      `}</style>
    </div>
  );
};
