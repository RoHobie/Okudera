"use client"

import { useState } from "react"
import type { FeedEntry } from "@/hooks/useSession"
import { sendMessage } from "@/lib/api"

interface Props {
  feed: FeedEntry[]
  sessionCode: string
  userId: string
  userName: string
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

function FeedRow({ entry }: { entry: FeedEntry }) {
  const t = formatTime(entry.timestamp)

  switch (entry.type) {
    case "user_joined":
      return (
        <div style={rowStyle}>
          <span className="font-mono" style={tsStyle}>{t}</span>
          <span style={{ color: "var(--green)", fontSize: "0.75rem" }}>
            → <strong style={{ color: "var(--text)" }}>{String(entry.payload.name)}</strong> joined
          </span>
        </div>
      )
    case "user_left":
      return (
        <div style={rowStyle}>
          <span className="font-mono" style={tsStyle}>{t}</span>
          <span style={{ color: "var(--red)", fontSize: "0.75rem" }}>
            ← <strong style={{ color: "var(--text)" }}>{String(entry.payload.name ?? entry.payload.user_id)}</strong> left
          </span>
        </div>
      )
    case "chat_message":
      return (
        <div style={{ ...rowStyle, flexDirection: "column", gap: "0.15rem", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="font-mono" style={tsStyle}>{t}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--amber)", fontWeight: 500 }}>
              {String(entry.payload.name)}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text)", paddingLeft: "0.1rem", wordBreak: "break-word" }}>
            {String(entry.payload.text)}
          </p>
        </div>
      )
    case "timer_set":
      return (
        <div style={rowStyle}>
          <span className="font-mono" style={tsStyle}>{t}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
            ○ Timer set to{" "}
            <span className="font-mono" style={{ color: "var(--amber)" }}>
              {formatSeconds(Number(entry.payload.seconds))}
            </span>
          </span>
        </div>
      )
    case "timer_state":
      return (
        <div style={rowStyle}>
          <span className="font-mono" style={tsStyle}>{t}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
            {entry.payload.state === "paused" && "⏸ Timer paused"}
            {entry.payload.state === "idle" && "↺ Timer reset"}
          </span>
        </div>
      )
    case "timer_done":
      return (
        <div style={rowStyle}>
          <span className="font-mono" style={tsStyle}>{t}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--red)", fontWeight: 600 }}>
            ■ TIME&apos;S UP
          </span>
        </div>
      )
    default:
      return null
  }
}

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "center",
  padding: "0.5rem 0",
  borderBottom: "1px solid var(--border)",
  animation: "fade-in 0.2s ease forwards",
}

const tsStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  color: "var(--text-3)",
  letterSpacing: "0.05em",
  flexShrink: 0,
  minWidth: "68px",
}

export default function EventFeed({ feed, sessionCode, userId, userName }: Props) {
  const [msg, setMsg] = useState("")
  const [sending, setSending] = useState(false)

  async function submit() {
    const text = msg.trim()
    if (!text) return
    setSending(true)
    try {
      await sendMessage(sessionCode, userId, userName, text)
      setMsg("")
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "var(--text-3)" }}
        >
          EVENTS
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            padding: "0.1rem 0.4rem",
            color: "var(--text-3)",
          }}
        >
          {feed.length}
        </span>
      </div>

      {/* Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 1rem",
          display: "flex",
          flexDirection: "column-reverse",
          minHeight: 0,
        }}
      >
        {feed.length === 0 && (
          <p
            className="font-mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              textAlign: "center",
              padding: "2rem 0",
              letterSpacing: "0.1em",
            }}
          >
            NO EVENTS YET
          </p>
        )}
        {feed.map((entry) => (
          <FeedRow key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Message input */}
      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit() }}
          placeholder="send a message…"
          maxLength={500}
          style={{
            flex: 1,
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            color: "var(--text)",
            fontSize: "0.85rem",
            padding: "0.5rem 0.65rem",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--border-2)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={submit}
          disabled={sending || !msg.trim()}
          className="font-mono"
          style={{
            background: "transparent",
            border: "1px solid var(--border-2)",
            borderRadius: "2px",
            color: "var(--text-2)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            padding: "0.5rem 0.75rem",
            cursor: "pointer",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--amber)"
            e.currentTarget.style.color = "var(--amber)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-2)"
            e.currentTarget.style.color = "var(--text-2)"
          }}
        >
          SEND
        </button>
      </div>
    </div>
  )
}