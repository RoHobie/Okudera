import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { timerAction, setTimer, sendMessage } from '../api/sessions';
import { TopBar } from '../components/TopBar';
import { TimerDial } from '../components/TimerDial';
import { TimerPresets } from '../components/TimerPresets';
import { TimerControls } from '../components/TimerControls';
import { ChatDrawer } from '../components/ChatDrawer';
import './RoomPage.css';

interface Toast {
  id: number;
  text: string;
}

let toastId = 0;

export function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // Retrieve stored identity
  const safeCode = (code ?? '').toUpperCase();
  const storedUserId = sessionStorage.getItem(`okudera_uid_${safeCode}`) ?? '';
  const storedName = sessionStorage.getItem(`okudera_name_${safeCode}`) ?? '';

  // Redirect to landing if no identity
  useEffect(() => {
    if (!storedUserId || !storedName) {
      navigate('/', { replace: true });
    }
  }, [storedUserId, storedName, navigate]);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((text: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Chat drawer state
  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleSessionClosed = useCallback(() => {
    navigate('/', { replace: true });
    // Toast will flash briefly then page changes
    addToast('The session was closed.');
  }, [navigate, addToast]);

  const session = useSession({
    code: safeCode,
    userId: storedUserId,
    userName: storedName,
    onSessionClosed: handleSessionClosed,
  });

  // Track unread messages received while chat is closed
  const prevMsgCountRef = useRef(session.messages.length);
  useEffect(() => {
    const prev = prevMsgCountRef.current;
    if (!chatOpen && session.messages.length > prev) {
      setUnread(c => c + (session.messages.length - prev));
    }
    prevMsgCountRef.current = session.messages.length;
  }, [session.messages.length, chatOpen]);

  const handleOpenChat = () => {
    setChatOpen(true);
    setUnread(0);
  };

  const handleToggleChat = () => {
    if (chatOpen) {
      setChatOpen(false);
    } else {
      handleOpenChat();
    }
  };

  // Timer actions
  const handleStart = async () => {
    try { await timerAction(safeCode, storedUserId, 'start'); }
    catch (e) { addToast(e instanceof Error ? e.message : 'Error'); }
  };
  const handlePause = async () => {
    try { await timerAction(safeCode, storedUserId, 'pause'); }
    catch (e) { addToast(e instanceof Error ? e.message : 'Error'); }
  };
  const handleReset = async () => {
    try { await timerAction(safeCode, storedUserId, 'reset'); }
    catch (e) { addToast(e instanceof Error ? e.message : 'Error'); }
  };
  const handleSetTimer = async (seconds: number) => {
    try { await setTimer(safeCode, storedUserId, seconds); }
    catch (e) { addToast(e instanceof Error ? e.message : 'Error'); }
  };
  const handleSendMessage = async (text: string) => {
    try { await sendMessage(safeCode, storedUserId, storedName, text); }
    catch (e) { addToast(e instanceof Error ? e.message : 'Error'); }
  };

  if (!storedUserId || !storedName) return null;

  return (
    <div className="room-root">
      <TopBar
        ownerName={session.ownerName}
        code={safeCode}
        users={session.users}
        reconnecting={session.reconnecting}
      />

      <div className={`room-body${chatOpen ? ' room-body--chat-open' : ''}`}>
        <main className="room-main" aria-label="Timer">
          {/* Zone 1 — Timer dial */}
          <div className="timer-zone">
            <TimerDial
              state={session.timerState}
              remaining={session.timerRemaining}
              duration={session.timerDuration}
            />

            {session.isOwner && (
              <div className="owner-controls">
                <TimerPresets
                  onSelect={handleSetTimer}
                  currentDuration={session.timerDuration}
                />
                <TimerControls
                  timerState={session.timerState}
                  canStart={session.canStart}
                  canPause={session.canPause}
                  canReset={session.canReset}
                  onStart={handleStart}
                  onPause={handlePause}
                  onReset={handleReset}
                />
              </div>
            )}

            {!session.connected && !session.reconnecting && (
              <p className="connecting-hint">Connecting…</p>
            )}
          </div>
        </main>
      </div>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onToggle={handleToggleChat}
        messages={session.messages}
        currentUserId={storedUserId}
        unreadCount={unread}
        onSend={handleSendMessage}
      />

      {/* Toast container */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.text}</div>
        ))}
      </div>
    </div>
  );
}
