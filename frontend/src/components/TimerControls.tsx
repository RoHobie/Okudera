import type { TimerState } from '../hooks/useSession';
import './TimerControls.css';

interface Props {
  timerState: TimerState;
  canStart: boolean;
  canPause: boolean;
  canReset: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  timerState,
  canStart,
  canPause,
  canReset,
  onStart,
  onPause,
  onReset,
}: Props) {
  const isRunning = timerState === 'running';

  return (
    <div className="timer-controls" role="group" aria-label="Timer controls">
      {/* Start / Pause toggle */}
      <button
        id="timer-start-pause-btn"
        className="ctrl-btn ctrl-btn--primary"
        onClick={isRunning ? onPause : onStart}
        disabled={isRunning ? !canPause : !canStart}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? (
          /* Pause icon */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="4" y="3" width="4" height="14" rx="1.5" fill="currentColor" />
            <rect x="12" y="3" width="4" height="14" rx="1.5" fill="currentColor" />
          </svg>
        ) : (
          /* Play icon */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M6 4l12 6-12 6V4z" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Reset */}
      <button
        id="timer-reset-btn"
        className="ctrl-btn"
        onClick={onReset}
        disabled={!canReset}
        aria-label="Reset timer"
        title="Reset"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 9a6 6 0 1 1 1.5 3.9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M3 13.5V9.5H7"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
