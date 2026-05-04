import type { TimerState } from '../hooks/useSession';
import './TimerDial.css';

interface Props {
  state: TimerState;
  remaining: number; // seconds
  duration: number;  // seconds
}

function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

const RADIUS = 120;
const STROKE = 10;
const SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDial({ state, remaining, duration }: Props) {
  const progress = duration > 0 ? Math.min(1, remaining / duration) : 1;
  const offset = CIRCUMFERENCE * (1 - progress);

  const isDone = state === 'done';
  const isPaused = state === 'paused';
  const isRunning = state === 'running';

  const stateLabel: Record<TimerState, string> = {
    idle: 'idle',
    running: 'running',
    paused: 'paused',
    done: 'done',
  };

  return (
    <div className={`timer-dial-wrap${isDone ? ' timer-dial-wrap--done' : ''}`}>
      <svg
        className="timer-dial-svg"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`Timer: ${formatTime(remaining)}, ${stateLabel[state]}`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--bg-surface)"
          strokeWidth={STROKE}
        />
        {/* Progress arc */}
        {!isDone && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={
              state === 'idle' ? 'var(--border-mid)' : 'var(--accent)'
            }
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={
              isPaused
                ? `${CIRCUMFERENCE * 0.04} ${CIRCUMFERENCE * 0.04}`
                : `${CIRCUMFERENCE}`
            }
            strokeDashoffset={isPaused ? `-${offset}` : `${offset}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            className={`arc${isRunning ? ' arc--running' : ''}${isPaused ? ' arc--paused' : ''}`}
          />
        )}
        {/* Done flash ring */}
        {isDone && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className="arc--done-flash"
          />
        )}
      </svg>

      {/* Inner content */}
      <div className="timer-dial-inner">
        <span className={`timer-countdown mono${isDone ? ' timer-countdown--done' : ''}${isRunning ? ' timer-countdown--running' : ''}`}>
          {formatTime(remaining)}
        </span>
        <div className={`timer-state-pill timer-state-pill--${state}`}>
          <span className="timer-state-icon" aria-hidden="true">
            {state === 'idle' && '●'}
            {state === 'running' && '▶'}
            {state === 'paused' && '⏸'}
            {state === 'done' && '✓'}
          </span>
          <span className="timer-state-text">
            {isDone ? 'done' : stateLabel[state]}
          </span>
        </div>
      </div>
    </div>
  );
}
