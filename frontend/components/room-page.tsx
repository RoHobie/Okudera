"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TimerDisplay } from "@/components/timer-display";
import { RoomInfo } from "@/components/room-info";
import { Timeline } from "@/components/timeline";
import {
  leaveSession,
  setTimer,
  timerAction,
  sendMessage,
  createEventSource,
} from "@/lib/api";
import type { RoomState, TimerState, User, TimelineEvent, Message, SSEEvent } from "@/lib/types";

interface RoomPageProps {
  initialState: {
    code: string;
    userId: string;
    userName: string;
    isOwner: boolean;
  };
  onLeave: () => void;
}

export function RoomPage({ initialState, onLeave }: RoomPageProps) {
  const { code, userId, userName, isOwner: initialIsOwner } = initialState;

  const [timer, setTimerState] = useState<TimerState>({ remaining: 0, state: "idle" });
  const [users, setUsers] = useState<User[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const eventIdCounter = useRef(0);

  const isOwner = ownerId === userId;

  const addEvent = useCallback((type: TimelineEvent["type"], data: Record<string, unknown>) => {
    // Skip timer_tick events to avoid cluttering the timeline
    if (type === "timer_tick") return;

    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}-${eventIdCounter.current++}`,
      type,
      timestamp: new Date(),
      data,
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  // Handle SSE connection
  useEffect(() => {
    const eventSource = createEventSource(code, userId);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed: SSEEvent = JSON.parse(event.data);
        const { Type: type, Data: data } = parsed;

        switch (type) {
          case "session_snapshot": {
            const snapshot = data as {
              timer: TimerState;
              chat: Message[];
              users: User[];
              owner_name: string;
              owner_id: string;
            };
            setTimerState(snapshot.timer);
            setUsers(snapshot.users);
            setOwnerName(snapshot.owner_name);
            setOwnerId(snapshot.owner_id);
            setMessages(snapshot.chat || []);

            // Add existing messages to timeline
            (snapshot.chat || []).forEach((msg) => {
              addEvent("chat_message", {
                user_id: msg.UserID,
                name: msg.Name,
                text: msg.Text,
              });
            });
            break;
          }

          case "timer_tick":
          case "timer_state":
          case "timer_done":
          case "timer_set": {
            const timerData = data as { remaining: number; state: TimerState["state"] };
            setTimerState(timerData);
            if (type !== "timer_tick") {
              addEvent(type as TimelineEvent["type"], data as Record<string, unknown>);
            }
            break;
          }

          case "user_joined": {
            const userData = data as { user_id: string; name: string };
            setUsers((prev) => {
              if (prev.some((u) => u.user_id === userData.user_id)) return prev;
              return [...prev, { user_id: userData.user_id, name: userData.name }];
            });
            addEvent("user_joined", data as Record<string, unknown>);
            break;
          }

          case "user_left": {
            const leftData = data as { user_id: string };
            setUsers((prev) => prev.filter((u) => u.user_id !== leftData.user_id));
            addEvent("user_left", data as Record<string, unknown>);
            break;
          }

          case "chat_message": {
            const msgData = data as { user_id: string; name: string; text: string };
            const newMsg: Message = {
              UserID: msgData.user_id,
              Name: msgData.name,
              Text: msgData.text,
            };
            setMessages((prev) => [...prev, newMsg]);
            addEvent("chat_message", data as Record<string, unknown>);
            break;
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Connection lost. Trying to reconnect...");
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [code, userId, addEvent]);

  const handleLeave = async () => {
    try {
      await leaveSession(code, userId);
    } catch {
      // Ignore errors on leave
    }
    eventSourceRef.current?.close();
    onLeave();
  };

  const handleSetTimer = async (seconds: number) => {
    try {
      await setTimer(code, userId, seconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set timer");
    }
  };

  const handleTimerAction = async (action: "start" | "pause" | "reset") => {
    try {
      await timerAction(code, userId, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} timer`);
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(code, userId, userName, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Okudera</h1>
            <span className="text-muted-foreground">/</span>
            <span className="font-mono text-lg">{code}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-success" : "bg-destructive"}`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 shrink-0">
          <p className="text-sm text-destructive text-center">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Timer */}
            <div className="lg:col-span-2 space-y-6">
              <TimerDisplay
                timer={timer}
                isOwner={isOwner}
                onStart={() => handleTimerAction("start")}
                onPause={() => handleTimerAction("pause")}
                onReset={() => handleTimerAction("reset")}
                onSet={handleSetTimer}
              />

              {/* Timeline on mobile */}
              <div className="lg:hidden h-[400px]">
                <Timeline
                  events={events}
                  messages={messages}
                  currentUserId={userId}
                  userName={userName}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            {/* Right Column - Room Info & Timeline */}
            <div className="space-y-6">
              <RoomInfo
                code={code}
                users={users}
                ownerName={ownerName}
                ownerId={ownerId}
                currentUserId={userId}
                onLeave={handleLeave}
              />

              {/* Timeline on desktop */}
              <div className="hidden lg:block h-[400px]">
                <Timeline
                  events={events}
                  messages={messages}
                  currentUserId={userId}
                  userName={userName}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
