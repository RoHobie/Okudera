import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../hooks/useSession';
import './ChatMessages.css';

interface Props {
  messages: ChatMessage[];
  currentUserId: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function nameHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

export function ChatMessages({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 60;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="chat-messages"
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.length === 0 && (
        <div className="chat-empty">
          <span>No messages yet. Say hi!</span>
        </div>
      )}
      {[...messages].reverse().map((msg, i) => {
        const isSystem = msg.user_id === 'system';
        if (isSystem) {
          return (
            <div key={i} className="chat-msg chat-msg--system">
              <span className="chat-system-text">{msg.text}</span>
            </div>
          );
        }
        const isMine = msg.user_id === currentUserId;
        const hue = nameHue(msg.name);
        return (
          <div
            key={i}
            className={`chat-msg${isMine ? ' chat-msg--mine' : ''}`}
          >
            {!isMine && (
              <div
                className="chat-avatar"
                style={{
                  background: `hsl(${hue} 35% 88%)`,
                  color: `hsl(${hue} 40% 28%)`,
                }}
                aria-hidden="true"
              >
                {initials(msg.name)}
              </div>
            )}
            <div className="chat-bubble-wrap">
              {!isMine && (
                <span className="chat-name">{msg.name}</span>
              )}
              <div className="chat-bubble">{msg.text}</div>
              <span className="chat-time">{relativeTime(msg.timestamp)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
