export interface User {
  user_id: string;
  name: string;
}

export interface Message {
  UserID: string;
  Name: string;
  Text: string;
}

export interface TimerState {
  remaining: number;
  state: "idle" | "running" | "paused" | "done";
}

export interface SessionSnapshot {
  timer: TimerState;
  chat: Message[];
  users: User[];
  owner_name: string;
  owner_id: string;
}

export interface RoomState {
  code: string;
  userId: string;
  userName: string;
  isOwner: boolean;
  timer: TimerState;
  users: User[];
  ownerName: string;
  ownerId: string;
}

export type TimelineEventType =
  | "user_joined"
  | "user_left"
  | "chat_message"
  | "timer_set"
  | "timer_tick"
  | "timer_state"
  | "timer_done"
  | "session_snapshot";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: Date;
  data: Record<string, unknown>;
}

export interface SSEEvent {
  Type: string;
  Data: Record<string, unknown>;
}
