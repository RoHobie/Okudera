"use client";

import { useState, useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { RoomPage } from "@/components/room-page";

interface RoomSession {
  code: string;
  userId: string;
  userName: string;
  isOwner: boolean;
}

const SESSION_STORAGE_KEY = "okudera_session";

export default function Home() {
  const [session, setSession] = useState<RoomSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RoomSession;
        setSession(parsed);
      } catch {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save session to sessionStorage when it changes
  useEffect(() => {
    if (!isHydrated) return;

    if (session) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session, isHydrated]);

  const handleRoomJoined = (
    code: string,
    userId: string,
    userName: string,
    isOwner: boolean
  ) => {
    setSession({ code, userId, userName, isOwner });
  };

  const handleLeave = () => {
    setSession(null);
  };

  // Prevent flash of wrong content during hydration
  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (session) {
    return <RoomPage initialState={session} onLeave={handleLeave} />;
  }

  return <LandingPage onRoomJoined={handleRoomJoined} />;
}
