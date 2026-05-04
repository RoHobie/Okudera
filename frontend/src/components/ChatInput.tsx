import { useState, useRef } from 'react';
import './ChatInput.css';

const MAX_CHARS = 500;
const WARN_THRESHOLD = 50;

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_CHARS - text.length;
  const isNearLimit = remaining <= WARN_THRESHOLD;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  return (
    <div className="chat-input-bar">
      <div className="chat-input-wrap">
        <input
          ref={inputRef}
          id="chat-message-input"
          type="text"
          className="chat-input"
          placeholder="Message…"
          value={text}
          maxLength={MAX_CHARS}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={disabled}
          aria-label="Type a message"
        />
        {isNearLimit && (
          <span
            className={`char-count${remaining <= 0 ? ' char-count--over' : ''}`}
            aria-live="polite"
          >
            {remaining}
          </span>
        )}
      </div>
      <button
        id="chat-send-btn"
        className="chat-send-btn"
        onClick={handleSend}
        disabled={!text.trim() || disabled}
        aria-label="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2 9l14-7-7 14V9H2z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
