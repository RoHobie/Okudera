import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

/* ─────────────────────────────── CSS ─────────────────────────────── */
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0c0c0b;
    --surface:   #141413;
    --surface2:  #1c1c1b;
    --border:    #2a2a28;
    --border2:   #3a3a37;
    --text:      #e8e6df;
    --muted:     #6b6960;
    --accent:    #d4c97a;
    --danger:    #c0574a;
    --success:   #5a9e6f;
    --mono:      'DM Mono', monospace;
    --display:   'Unbounded', sans-serif;
  }

  body {
    font-family: var(--mono);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── Landing ── */
  .landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    padding: 2rem;
    position: relative;
  }

  .landing::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 39px,
        #1a1a18 39px,
        #1a1a18 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 39px,
        #1a1a18 39px,
        #1a1a18 40px
      );
    pointer-events: none;
    z-index: 0;
  }

  .landing > * { position: relative; z-index: 1; }

  .wordmark {
    font-family: var(--display);
    font-size: clamp(2rem, 6vw, 3.5rem);
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--text);
  }

  .wordmark span { color: var(--accent); }

  .landing-cards {
    display: flex;
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 2px;
  }

  .landing-card {
    background: var(--surface);
    padding: 2rem;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .landing-card:first-child { border-radius: 1px 0 0 1px; }
  .landing-card:last-child  { border-radius: 0 1px 1px 0; }

  .card-label {
    font-size: 0.65rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .field label {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  input[type="text"], input[type="number"] {
    background: var(--bg);
    border: 1px solid var(--border2);
    color: var(--text);
    padding: 0.55rem 0.8rem;
    font-family: var(--mono);
    font-size: 0.85rem;
    border-radius: 2px;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }

  input[type="text"]:focus, input[type="number"]:focus {
    border-color: var(--accent);
  }

  .btn {
    font-family: var(--mono);
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid var(--border2);
    background: transparent;
    color: var(--text);
    padding: 0.55rem 1rem;
    border-radius: 2px;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .btn:hover { background: var(--surface2); border-color: var(--muted); }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-primary {
    background: var(--accent);
    color: var(--bg);
    border-color: var(--accent);
    font-weight: 500;
  }

  .btn-primary:hover { background: #c4b96a; border-color: #c4b96a; }

  .divider-or {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .divider-or::before,
  .divider-or::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Session layout ── */
  .session-root {
    display: grid;
    grid-template-rows: 56px 1fr;
    grid-template-columns: 1fr 300px;
    grid-template-areas: "hd hd" "main aside";
    height: 100vh;
    overflow: hidden;
  }

  .s-header {
    grid-area: hd;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: var(--surface);
  }

  .s-header-wordmark {
    font-family: var(--display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: var(--text);
  }

  .s-header-wordmark span { color: var(--accent); }

  .s-header-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.72rem;
    color: var(--muted);
  }

  .code-chip {
    background: var(--surface2);
    border: 1px solid var(--border);
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    letter-spacing: 0.15em;
    color: var(--accent);
    font-size: 0.8rem;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--muted);
    display: inline-block;
  }

  .status-dot.running { background: var(--success); animation: blink 1s steps(1) infinite; }
  .status-dot.done    { background: var(--danger); }
  @keyframes blink { 50% { opacity: 0; } }

  /* ── Main timer area ── */
  .s-main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2.5rem;
    overflow: hidden;
    position: relative;
    background: var(--bg);
  }

  /* tick-mark background on main */
  .s-main::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 60% at 50% 50%, #141413 0%, transparent 80%);
    pointer-events: none;
  }

  .timer-ring-wrap {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .timer-ring-svg {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
  }

  .timer-ring-track {
    fill: none;
    stroke: var(--surface2);
    stroke-width: 3;
  }

  .timer-ring-fill {
    fill: none;
    stroke: var(--accent);
    stroke-width: 3;
    stroke-linecap: butt;
    transition: stroke-dashoffset 0.9s linear, stroke 0.3s;
  }

  .timer-ring-fill.paused { stroke: var(--muted); }
  .timer-ring-fill.done   { stroke: var(--danger); }

  .timer-digits {
    font-family: var(--display);
    font-size: clamp(3.5rem, 7vw, 5rem);
    font-weight: 300;
    letter-spacing: 0.04em;
    color: var(--text);
    transition: color 0.3s;
    line-height: 1;
    position: relative;
    z-index: 1;
  }

  .timer-digits.paused { color: var(--muted); }
  .timer-digits.done   { color: var(--danger); }

  /* ── Owner controls ── */
  .owner-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    position: relative;
    z-index: 1;
  }

  .time-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time-inputs input {
    width: 64px;
    text-align: center;
    font-size: 1rem;
    padding: 0.45rem;
  }

  .time-sep { color: var(--muted); font-size: 1.2rem; font-weight: 300; }

  .controls-row {
    display: flex;
    gap: 0.5rem;
  }

  /* ── Guest view ── */
  .guest-hint {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.12em;
    position: relative;
    z-index: 1;
  }

  /* ── Sidebar ── */
  .s-aside {
    grid-area: aside;
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    background: var(--surface);
    overflow: hidden;
  }

  .aside-section {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── Users list ── */
  .users-list {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    min-height: 44px;
  }

  .user-pill {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .user-pill .crown { color: var(--accent); font-size: 0.65rem; }

  /* ── Chat ── */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .msg {
    font-size: 0.78rem;
    line-height: 1.5;
    word-break: break-word;
  }

  .msg-who {
    color: var(--accent);
    margin-right: 0.35rem;
    font-size: 0.7rem;
  }

  .msg-text { color: var(--text); }

  .msg.system {
    color: var(--muted);
    font-size: 0.7rem;
    font-style: italic;
  }

  .msg.alert { color: var(--danger); }

  .chat-input-row {
    border-top: 1px solid var(--border);
    display: flex;
    gap: 0px;
  }

  .chat-input-row input {
    flex: 1;
    border: none;
    border-radius: 0;
    background: var(--surface);
    padding: 0.65rem 0.9rem;
    font-size: 0.8rem;
    border-right: 1px solid var(--border);
  }

  .chat-input-row input:focus { border-color: var(--border); outline: none; }

  .chat-send-btn {
    background: transparent;
    border: none;
    color: var(--muted);
    padding: 0 1rem;
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.15s;
  }

  .chat-send-btn:hover { color: var(--accent); }

  /* ── Error toast ── */
  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface2);
    border: 1px solid var(--danger);
    color: var(--danger);
    padding: 0.5rem 1.2rem;
    font-size: 0.78rem;
    border-radius: 2px;
    z-index: 100;
    animation: toast-in 0.2s ease;
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── Fade in ── */
  .fade-in {
    animation: fadeIn 0.4s ease forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─────────────────────────── Helpers ─────────────────────────── */
function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ─────────────────────────── TimerRing ─────────────────────────── */
function TimerRing({ remaining, total, state }) {
  const R = 138;
  const C = 2 * Math.PI * R;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const offset = C * (1 - frac);

  return (
    <div className="timer-ring-wrap">
      <svg className="timer-ring-svg" viewBox="0 0 300 300">
        <circle className="timer-ring-track" cx="150" cy="150" r={R} />
        <circle
          className={`timer-ring-fill ${state}`}
          cx="150" cy="150" r={R}
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={`timer-digits ${state}`}>{fmt(remaining)}</div>
    </div>
  );
}

/* ─────────────────────────── UserPill ─────────────────────────── */
function UserPill({ name, isOwner }) {
  return (
    <div className="user-pill">
      {isOwner && <span className="crown">★</span>}
      {name}
    </div>
  );
}

/* ─────────────────────────── Chat ─────────────────────────── */
function Chat({ messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  }

  return (
    <>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.cls || ""}`}>
            {m.who && <span className="msg-who">{m.who}</span>}
            <span className="msg-text">{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="message..."
        />
        <button className="chat-send-btn" onClick={send}>→</button>
      </div>
    </>
  );
}

/* ─────────────────────────── SessionPage ─────────────────────────── */
function SessionPage({ code, userID, userName, isOwner, ownerName: ownerNameProp, onOwnerName }) {
  const [timerState, setTimerState] = useState("idle");
  const [remaining, setRemaining]   = useState(0);
  const [duration, setDuration]     = useState(0);
  const [messages, setMessages]     = useState([]);
  const [users, setUsers]           = useState(
    isOwner ? [{ id: userID, name: userName, owner: true }] : []
  );
  const [ownerName, setOwnerName]   = useState(ownerNameProp || "the owner");
  const [mins, setMins]     = useState(25);
  const [secs, setSecs]     = useState(0);
  const [toast, setToast]   = useState(null);
  const toastTimer          = useRef(null);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  function addMsg(text, cls, who) {
    setMessages(prev => [...prev, { text, cls, who }]);
  }

  /* ── SSE ── */
  useEffect(() => {
    const es = new EventSource(`/api/v1/stream?code=${code}&user_id=${userID}`);

    es.onmessage = (e) => {
      const ev = JSON.parse(e.data);
      switch (ev.Type) {
        case "session_snapshot": {
          const t = ev.Data.timer;
          setTimerState(t.state);
          setRemaining(t.remaining);
          if (t.remaining > 0) setDuration(t.remaining);
          if (ev.Data.chat) {
            ev.Data.chat.forEach(m => addMsg(m.Text, "", m.Name));
          }
          if (ev.Data.users) {
            const owId = ev.Data.owner_id;
            setUsers(ev.Data.users.map(u => ({
              id: u.user_id,
              name: u.name,
              owner: u.user_id === owId,
            })));
          }
          if (ev.Data.owner_name) {
            setOwnerName(ev.Data.owner_name);
            onOwnerName?.(ev.Data.owner_name);
          }
          break;
        }
        case "timer_tick":
        case "timer_state":
          setTimerState(ev.Data.state);
          setRemaining(ev.Data.remaining);
          break;
        case "timer_done":
          setTimerState("done");
          setRemaining(0);
          addMsg("time's up", "alert");
          break;
        case "timer_set": {
          const secs = ev.Data.seconds;
          setTimerState("idle");
          setRemaining(secs);
          setDuration(secs);
          break;
        }
        case "user_joined":
          setUsers(prev => {
            if (prev.find(u => u.id === ev.Data.user_id)) return prev;
            return [...prev, { id: ev.Data.user_id, name: ev.Data.name, owner: false }];
          });
          addMsg(`${ev.Data.name} joined`, "system");
          break;
        case "chat_message":
          addMsg(ev.Data.text, "", ev.Data.name);
          break;
      }
    };

    es.onerror = () => addMsg("connection lost — retrying…", "system");

    return () => es.close();
  }, [code, userID]);

  /* ── Timer API calls ── */
  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      showToast(txt);
    }
  }

  async function setTimer() {
    const total = (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0);
    if (total <= 0) return showToast("set a duration first");
    setDuration(total);
    await apiPost(`/api/v1/sessions/${code}/timer`, { seconds: total, user_id: userID });
  }

  async function action(act) {
    await apiPost(`/api/v1/sessions/${code}/timer/${act}`, { user_id: userID });
  }

  async function sendChat(text) {
    await apiPost(`/api/v1/sessions/${code}/messages`, { user_id: userID, name: userName, text });
  }

  /* ── Ensure owner is in user list ── */
  useEffect(() => {
    if (isOwner) {
      setUsers(prev => {
        if (prev.find(u => u.id === userID)) return prev;
        return [{ id: userID, name: userName, owner: true }, ...prev];
      });
    }
  }, [isOwner, userID, userName]);

  return (
    <div className="session-root fade-in">
      {/* Header */}
      <header className="s-header">
        <div className="s-header-wordmark">OKU<span>DERA</span></div>
        <div className="s-header-meta">
          <div className="code-chip">{code}</div>
          <span className={`status-dot ${timerState}`} />
          <span>{timerState}</span>
        </div>
      </header>

      {/* Main */}
      <main className="s-main">
        <TimerRing remaining={remaining} total={duration} state={timerState} />

        {isOwner ? (
          <div className="owner-controls fade-in">
            <div className="time-inputs">
              <input
                type="number" min="0" max="99" value={mins}
                onChange={e => setMins(e.target.value)}
              />
              <span className="time-sep">:</span>
              <input
                type="number" min="0" max="59" value={secs}
                onChange={e => setSecs(e.target.value)}
              />
              <button className="btn" onClick={setTimer}>set</button>
            </div>
            <div className="controls-row">
              <button
                className="btn btn-primary"
                disabled={timerState === "running" || timerState === "done" || remaining === 0}
                onClick={() => action("start")}
              >start</button>
              <button
                className="btn"
                disabled={timerState !== "running"}
                onClick={() => action("pause")}
              >pause</button>
              <button
                className="btn"
                disabled={!remaining && timerState === "idle"}
                onClick={() => action("reset")}
              >reset</button>
            </div>
          </div>
        ) : (
          <p className="guest-hint">timer controlled by {ownerName || "the owner"}</p>
        )}
      </main>

      {/* Sidebar */}
      <aside className="s-aside">
        <div className="aside-section">participants</div>
        <div className="users-list">
          {users.map(u => (
            <UserPill key={u.id} name={u.name} isOwner={u.owner} />
          ))}
        </div>
        <div className="aside-section">activity</div>
        <Chat messages={messages} onSend={sendChat} />
      </aside>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

/* ─────────────────────────── Landing ─────────────────────────── */
function Landing({ onEnterSession }) {
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName]     = useState("");
  const [joinCode, setJoinCode]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function createSession() {
    if (!createName.trim()) return setError("enter your name");
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onEnterSession({ code: data.code, userID: data.user_id, name: createName.trim(), isOwner: true });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function joinSession() {
    if (!joinName.trim() || !joinCode.trim()) return setError("enter name and room code");
    setLoading(true); setError("");
    const code = joinCode.trim().toUpperCase();
    try {
      const res = await fetch(`/api/v1/sessions/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: joinName.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onEnterSession({ code, userID: data.user_id, name: joinName.trim(), isOwner: false });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="landing">
      <h1 className="wordmark">OKU<span>DERA</span></h1>

      <div className="landing-cards fade-in">
        {/* Create */}
        <div className="landing-card">
          <div className="card-label">create room</div>
          <div className="field">
            <label>your name</label>
            <input
              type="text"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createSession()}
              placeholder="e.g. yuki"
            />
          </div>
          <button className="btn btn-primary" onClick={createSession} disabled={loading}>
            {loading ? "…" : "create →"}
          </button>
        </div>

        <div style={{ width: "1px", background: "var(--border)" }} />

        {/* Join */}
        <div className="landing-card">
          <div className="card-label">join room</div>
          <div className="field">
            <label>your name</label>
            <input
              type="text"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              placeholder="e.g. ryo"
            />
          </div>
          <div className="field">
            <label>room code</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && joinSession()}
              placeholder="ABC123"
              maxLength={6}
              style={{ textTransform: "uppercase", letterSpacing: "0.2em" }}
            />
          </div>
          <button className="btn" onClick={joinSession} disabled={loading}>
            {loading ? "…" : "join →"}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: "0.75rem", color: "var(--danger)", letterSpacing: "0.05em" }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── App Root ─────────────────────────── */
function App() {
  const [session, setSession] = useState(null);
  const [ownerName, setOwnerName] = useState("");

  function handleEnterSession({ code, userID, name, isOwner }) {
    if (isOwner) setOwnerName(name);
    setSession({ code, userID, name, isOwner });
  }

  return (
    <>
      <style>{css}</style>
      {session ? (
        <SessionPage
          key={session.code}
          code={session.code}
          userID={session.userID}
          userName={session.name}
          isOwner={session.isOwner}
          ownerName={ownerName}
          onOwnerName={setOwnerName}
        />
      ) : (
        <Landing onEnterSession={handleEnterSession} />
      )}
    </>
  );
}

export default App;