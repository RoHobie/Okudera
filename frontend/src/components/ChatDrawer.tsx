import type { ChatMessage } from '../hooks/useSession';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import './ChatDrawer.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  unreadCount: number;
  onToggle: () => void;
  onSend: (text: string) => void;
}

export function ChatDrawer({
  isOpen,
  onClose,
  messages,
  currentUserId,
  unreadCount,
  onToggle,
  onSend,
}: Props) {
  return (
    <>
      {/* Floating toggle button */}
      <button
        id="chat-toggle-btn"
        className="chat-toggle"
        onClick={onToggle}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3 4h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6l-4 3V5a1 1 0 0 1 1-1z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && !isOpen && (
          <span className="chat-badge" aria-label={`${unreadCount} unread messages`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer overlay (mobile) */}
      {isOpen && (
        <div
          className="chat-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`chat-drawer${isOpen ? ' chat-drawer--open' : ''}`}
        aria-label="Chat"
        aria-hidden={!isOpen}
      >
        <div className="chat-header">
          <h2 className="chat-title">Chat</h2>
          <button
            id="chat-close-btn"
            className="chat-close-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ChatMessages messages={messages} currentUserId={currentUserId} />
        <ChatInput onSend={onSend} />
      </aside>
    </>
  );
}
