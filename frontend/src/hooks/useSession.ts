import { useEffect, useRef, useReducer, useCallback } from 'react';
import { getStreamUrl } from '../api/sessions';

// ── Types ──────────────────────────────────────────────────────────────

export interface SessionUser {
  user_id: string;
  name: string;
}

export interface ChatMessage {
  user_id: string;
  name: string;
  text: string;
  timestamp: number; // client-side time.now()
}

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

export interface SessionSnapshot {
  timer: { remaining: number; state: TimerState };
  chat: Array<{ user_id: string; name: string; text: string }>;
  users: SessionUser[];
  owner_name: string;
  owner_id: string;
}

interface State {
  connected: boolean;
  reconnecting: boolean;
  timerState: TimerState;
  timerRemaining: number; // seconds
  timerDuration: number;  // seconds (set when timer_set fires)
  messages: ChatMessage[];
  users: SessionUser[];
  ownerName: string;
  ownerId: string;
}

type Action =
  | { type: 'SNAPSHOT'; payload: SessionSnapshot }
  | { type: 'TIMER_TICK' | 'TIMER_STATE'; remaining: number; state: TimerState }
  | { type: 'TIMER_SET'; seconds: number }
  | { type: 'TIMER_DONE' }
  | { type: 'CHAT_MESSAGE'; msg: ChatMessage }
  | { type: 'USER_JOINED'; user: SessionUser }
  | { type: 'USER_LEFT'; userId: string }
  | { type: 'CONNECTED' }
  | { type: 'RECONNECTING' };

const initialState: State = {
  connected: false,
  reconnecting: false,
  timerState: 'idle',
  timerRemaining: 0,
  timerDuration: 0,
  messages: [],
  users: [],
  ownerName: '',
  ownerId: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SNAPSHOT': {
      const snap = action.payload;
      const msgs: ChatMessage[] = snap.chat.map((m, i) => ({
        ...m,
        timestamp: Date.now() - (snap.chat.length - i) * 1000,
      })).reverse();
      return {
        ...state,
        connected: true,
        reconnecting: false,
        timerState: snap.timer.state,
        timerRemaining: snap.timer.remaining,
        timerDuration: snap.timer.remaining > 0 ? snap.timer.remaining : state.timerDuration,
        messages: msgs,
        users: snap.users,
        ownerName: snap.owner_name,
        ownerId: snap.owner_id,
      };
    }
    case 'TIMER_TICK':
    case 'TIMER_STATE': {
      const isNewRun = action.state === 'running' && state.timerState !== 'running';
      const newState = { ...state, timerRemaining: action.remaining, timerState: action.state };
      if (isNewRun) {
        newState.messages = [{
          user_id: 'system',
          name: 'System',
          text: '▶ Timer started',
          timestamp: Date.now()
        }, ...state.messages];
      }
      return newState;
    }
    case 'TIMER_SET':
      return { ...state, timerDuration: action.seconds, timerRemaining: action.seconds, timerState: 'idle' };
    case 'TIMER_DONE':
      return { ...state, timerState: 'done', timerRemaining: 0 };
    case 'CHAT_MESSAGE':
      return { ...state, messages: [action.msg, ...state.messages] };
    case 'USER_JOINED':
      if (state.users.find(u => u.user_id === action.user.user_id)) return state;
      return { ...state, users: [...state.users, action.user] };
    case 'USER_LEFT':
      return { ...state, users: state.users.filter(u => u.user_id !== action.userId) };
    case 'CONNECTED':
      return { ...state, connected: true, reconnecting: false };
    case 'RECONNECTING':
      return { ...state, connected: false, reconnecting: true };
    default:
      return state;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────

interface UseSessionOptions {
  code: string;
  userId: string;
  userName: string;
  onSessionClosed?: () => void;
}

export function useSession({ code, userId, userName, onSessionClosed }: UseSessionOptions) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }
    const url = getStreamUrl(code, userId);
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      dispatch({ type: 'CONNECTED' });
    };

    es.onmessage = (ev: MessageEvent) => {
      let parsed: { type: string; data: unknown };
      try {
        parsed = JSON.parse(ev.data);
      } catch {
        return;
      }
      const { type, data } = parsed;

      switch (type) {
        case 'session_snapshot': {
          dispatch({ type: 'SNAPSHOT', payload: data as SessionSnapshot });
          break;
        }
        case 'timer_tick': {
          const d = data as { remaining: number; state: TimerState };
          dispatch({ type: 'TIMER_TICK', remaining: d.remaining, state: d.state });
          break;
        }
        case 'timer_state': {
          const d = data as { remaining: number; state: TimerState };
          dispatch({ type: 'TIMER_STATE', remaining: d.remaining, state: d.state });
          break;
        }
        case 'timer_set': {
          const d = data as { seconds: number; state: TimerState };
          dispatch({ type: 'TIMER_SET', seconds: d.seconds });
          break;
        }
        case 'timer_done': {
          dispatch({ type: 'TIMER_DONE' });
          break;
        }
        case 'chat_message': {
          const d = data as { user_id: string; name: string; text: string };
          dispatch({
            type: 'CHAT_MESSAGE',
            msg: { ...d, timestamp: Date.now() },
          });
          break;
        }
        case 'user_joined': {
          const d = data as { user_id: string; name: string };
          dispatch({ type: 'USER_JOINED', user: d });
          break;
        }
        case 'user_left': {
          const d = data as { user_id: string };
          dispatch({ type: 'USER_LEFT', userId: d.user_id });
          break;
        }
        case 'session_closed': {
          closedRef.current = true;
          es.close();
          onSessionClosed?.();
          break;
        }
      }
    };

    es.onerror = () => {
      if (closedRef.current) return;
      dispatch({ type: 'RECONNECTING' });
      es.close();
      reconnectTimerRef.current = setTimeout(() => {
        if (!closedRef.current) connect();
      }, 3000);
    };
  }, [code, userId, onSessionClosed]);

  useEffect(() => {
    closedRef.current = false;
    connect();
    return () => {
      closedRef.current = true;
      esRef.current?.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connect]);

  const isOwner = state.ownerId !== '' && state.ownerId === userId;

  const canStart =
    isOwner && state.timerDuration > 0 && (state.timerState === 'idle' || state.timerState === 'paused');
  const canPause = isOwner && state.timerState === 'running';
  const canReset = isOwner && state.timerState !== 'idle';

  return {
    ...state,
    isOwner,
    canStart,
    canPause,
    canReset,
    userId,
    userName,
  };
}
