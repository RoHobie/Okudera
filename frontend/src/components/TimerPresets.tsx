import { useState } from 'react';
import './TimerPresets.css';

const PRESETS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '45 min', seconds: 2700 },
  { label: '60 min', seconds: 3600 },
];

interface Props {
  onSelect: (seconds: number) => void;
  currentDuration: number;
}

export function TimerPresets({ onSelect, currentDuration }: Props) {
  const [customVal, setCustomVal] = useState('');

  const handleCustomSubmit = () => {
    const mins = parseFloat(customVal);
    if (!isNaN(mins) && mins > 0) {
      onSelect(Math.round(mins * 60));
      setCustomVal('');
    }
  };

  return (
    <div className="timer-presets">
      <div className="timer-presets-scroll">
        {PRESETS.map(({ label, seconds }) => (
          <button
            key={seconds}
            id={`preset-${seconds}`}
            className={`preset-pill${currentDuration === seconds ? ' preset-pill--active' : ''}`}
            onClick={() => onSelect(seconds)}
          >
            {label}
          </button>
        ))}
        <div className="preset-custom">
          <input
            id="custom-timer-input"
            type="number"
            min="1"
            max="180"
            placeholder="min"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
            aria-label="Custom duration in minutes"
          />
          <button
            id="custom-timer-submit"
            className="preset-pill"
            onClick={handleCustomSubmit}
            disabled={!customVal}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
