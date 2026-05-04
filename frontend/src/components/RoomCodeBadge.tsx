import { useClipboard } from '../hooks/useClipboard';
import './RoomCodeBadge.css';

interface Props {
  code: string;
}

export function RoomCodeBadge({ code }: Props) {
  const { copied, copy } = useClipboard(2200);

  return (
    <div className="room-code-badge">
      <span className="room-code-text mono">{code}</span>
      <button
        id="copy-code-btn"
        className="copy-btn"
        aria-label="Copy room code"
        onClick={() => copy(code)}
      >
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v7A1.5 1.5 0 0 0 3.5 12H5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
        {copied && <span className="copied-tooltip" aria-live="polite">Copied!</span>}
      </button>
    </div>
  );
}
