import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, joinSession } from '../api/sessions';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const createId = useId();
  const joinId = useId();

  // Create state
  const [createName, setCreateName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join state
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = createName.trim();
    if (!name) { setCreateError('Please enter your name'); return; }
    setCreateLoading(true);
    setCreateError('');
    try {
      const res = await createSession(name);
      sessionStorage.setItem(`okudera_uid_${res.code}`, res.user_id);
      sessionStorage.setItem(`okudera_name_${res.code}`, name);
      navigate(`/room/${res.code}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    const name = joinName.trim();
    if (!code || code.length !== 6) { setJoinError('Enter a valid 6-character code'); return; }
    if (!name) { setJoinError('Please enter your name'); return; }
    setJoinLoading(true);
    setJoinError('');
    try {
      const res = await joinSession(code, name);
      sessionStorage.setItem(`okudera_uid_${res.code}`, res.user_id);
      sessionStorage.setItem(`okudera_name_${res.code}`, name);
      navigate(`/room/${res.code}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      setJoinError(msg.toLowerCase().includes('not found') ? 'Room not found. Check the code.' : msg);
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <main className="landing">
      <div className="landing-header">
        <h1 className="landing-wordmark">Okudera</h1>
        <p className="landing-tagline">Shared focus sessions, together.</p>
      </div>

      <div className="landing-panels">
        {/* Create panel */}
        <section className="panel" aria-labelledby={`${createId}-title`}>
          <div className="panel-icon panel-icon--create" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 7v8M7 11h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          <h2 id={`${createId}-title`} className="panel-title">Create a room</h2>
          <p className="panel-desc">Start a new focus session and invite others with a code.</p>
          <form className="panel-form" onSubmit={handleCreate} noValidate>
            <div className="field">
              <label htmlFor={`${createId}-name`} className="field-label">Your name</label>
              <input
                id={`${createId}-name`}
                type="text"
                className="field-input"
                placeholder="e.g. Alex"
                value={createName}
                onChange={e => { setCreateName(e.target.value); setCreateError(''); }}
                autoComplete="nickname"
                maxLength={40}
                required
              />
            </div>
            {createError && <p className="field-error" role="alert">{createError}</p>}
            <button
              id="create-room-btn"
              type="submit"
              className="cta-btn"
              disabled={createLoading}
            >
              {createLoading ? (
                <span className="btn-spinner" aria-hidden="true" />
              ) : null}
              {createLoading ? 'Creating…' : 'Create room'}
            </button>
          </form>
        </section>

        <div className="panel-divider" aria-hidden="true">
          <span>or</span>
        </div>

        {/* Join panel */}
        <section className="panel" aria-labelledby={`${joinId}-title`}>
          <div className="panel-icon panel-icon--join" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M8 11h6M11 8l3 3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="3" y="3" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h2 id={`${joinId}-title`} className="panel-title">Join a room</h2>
          <p className="panel-desc">Have a code? Jump straight in.</p>
          <form className="panel-form" onSubmit={handleJoin} noValidate>
            <div className="field">
              <label htmlFor={`${joinId}-code`} className="field-label">Room code</label>
              <input
                id={`${joinId}-code`}
                type="text"
                className="field-input field-input--code mono"
                placeholder="ABC123"
                value={joinCode}
                onChange={e => {
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6));
                  setJoinError('');
                }}
                maxLength={6}
                spellCheck={false}
                autoCapitalize="characters"
                autoComplete="off"
                required
              />
            </div>
            <div className="field">
              <label htmlFor={`${joinId}-name`} className="field-label">Your name</label>
              <input
                id={`${joinId}-name`}
                type="text"
                className="field-input"
                placeholder="e.g. Jordan"
                value={joinName}
                onChange={e => { setJoinName(e.target.value); setJoinError(''); }}
                autoComplete="nickname"
                maxLength={40}
                required
              />
            </div>
            {joinError && <p className="field-error" role="alert">{joinError}</p>}
            <button
              id="join-room-btn"
              type="submit"
              className="cta-btn"
              disabled={joinLoading}
            >
              {joinLoading ? (
                <span className="btn-spinner" aria-hidden="true" />
              ) : null}
              {joinLoading ? 'Joining…' : 'Join room'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
