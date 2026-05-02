"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { openStream } from "@/lib/api"

export interface TimerState {
  remaining: number
  state: "idle" | "running" | "paused" | "done"
}

export interface User {
  user_id: string
  name: string
}

export interface FeedEntry {
  id: string
  type: "user_joined" | "user_left" | "chat_message" | "timer_tick" | "timer_done" | "timer_set" | "timer_state"
  payload: Record<string, unknown>
  timestamp: Date
}

export interface SessionState {
  timer: TimerState
  users: User[]
  ownerName: string
  ownerId: string
  chat: { user_id: string; name: string; text: string }[]
  feed: FeedEntry[]
  connected: boolean
}

const INITIAL: SessionState = {
  timer: { remaining: 0, state: "idle" },
  users: [],
  ownerName: "",
  ownerId: "",
  chat: [],
  feed: [],
  connected: false,
}

export function useSession(code: string, userId: string) {
  const router = useRouter()
  const [state, setState] = useState<SessionState>(INITIAL)
  const esRef = useRef<EventSource | null>(null)
  const feedIdRef = useRef(0)

  function addFeed(type: FeedEntry["type"], payload: Record<string, unknown>) {
    const entry: FeedEntry = {
      id: String(feedIdRef.current++),
      type,
      payload,
      timestamp: new Date(),
    }
    setState((prev) => ({
      ...prev,
      feed: [entry, ...prev.feed].slice(0, 100),
    }))
  }

  useEffect(() => {
    if (!code || !userId) return
    const es = openStream(code, userId)
    esRef.current = es

    es.onopen = () => setState((prev) => ({ ...prev, connected: true }))
    es.onerror = () => setState((prev) => ({ ...prev, connected: false }))

    es.onmessage = (e) => {
      const event = JSON.parse(e.data) as { Type: string; Data: unknown }
      const data = event.Data as Record<string, unknown>

      switch (event.Type) {
        case "session_snapshot":
          setState((prev) => ({
            ...prev,
            connected: true,
            timer: data.timer as TimerState,
            users: (data.users as User[]) ?? [],
            ownerName: data.owner_name as string,
            ownerId: data.owner_id as string,
            chat: (data.chat as SessionState["chat"]) ?? [],
          }))
          break

        case "session_closed":
          // Owner left — session is gone. Clean up and go home.
          es.close()
          sessionStorage.removeItem("okudera_user_id")
          sessionStorage.removeItem("okudera_name")
          router.replace("/?reason=session_closed")
          break

        case "timer_tick":
        case "timer_done":
        case "timer_set":
        case "timer_state":
          setState((prev) => ({ ...prev, timer: data as unknown as TimerState }))
          if (event.Type !== "timer_tick") addFeed(event.Type as FeedEntry["type"], data)
          break

        case "user_joined":
          setState((prev) => {
            const already = prev.users.some((u) => u.user_id === (data.user_id as string))
            if (already) return prev
            return { ...prev, users: [...prev.users, { user_id: data.user_id as string, name: data.name as string }] }
          })
          addFeed("user_joined", data)
          break

        case "user_left":
          setState((prev) => ({
            ...prev,
            users: prev.users.filter((u) => u.user_id !== (data.user_id as string)),
          }))
          addFeed("user_left", data)
          break

        case "chat_message":
          setState((prev) => ({
            ...prev,
            chat: [...prev.chat, { user_id: data.user_id as string, name: data.name as string, text: data.text as string }].slice(-50),
          }))
          addFeed("chat_message", data)
          break
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [code, userId, router])

  return state
}