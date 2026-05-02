"use client"

import type { User, TimerState } from "@/hooks/useSession"

interface Props {
  code: string
  ownerName: string
  ownerId: string
  userId: string
  users: User[]
  timer: TimerState
  connected: boolean
}

export default function SessionInfo({
  code,
  ownerName,
  ownerId,
  userId,
  users,
  timer,
  connected,
}: Props) {
  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {})
  }

  const stateColor: Record<string, string> = {
    idle: "var(--text-3)",
    running: "var(--amber)",
    paused: "var(--text-2)",
    done: "var(--red)",
  }

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Connection indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: connected ? "var(--green)" : "var(--red)",
            flexShrink: 0,
          }}
        />
        <span
          className="font-mono"
          style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.1em" }}
        >
          {connected ? "LIVE" : "DISCONNECTED"}
        </span>
      </div>

      {/* Divider */}
      <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

      {/* Room code */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <span
          style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--text-3)", textTransform: "uppercase" }}
        >
          Room code
        </span>
        <button
          onClick={copyCode}
          title="Click to copy"
          className="font-mono"
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            color: "var(--amber)",
            fontSize: "1.2rem",
            letterSpacing: "0.3em",
            padding: "0.5rem 0.75rem",
            cursor: "pointer",
            textAlign: "left",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--amber)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {code}
        </button>
        <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>click to copy</span>
      </div>

      {/* Timer status */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <span
          style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--text-3)", textTransform: "uppercase" }}
        >
          Timer status
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: "0.85rem",
            color: stateColor[timer.state] ?? "var(--text-2)",
            letterSpacing: "0.1em",
          }}
        >
          {timer.state.toUpperCase()}
        </span>
      </div>

      {/* Owner */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <span
          style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--text-3)", textTransform: "uppercase" }}
        >
          Owner
        </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>
          {ownerName}
          {ownerId === userId && (
            <span
              className="font-mono"
              style={{ marginLeft: "0.5rem", fontSize: "0.65rem", color: "var(--amber)", letterSpacing: "0.1em" }}
            >
              (you)
            </span>
          )}
        </span>
      </div>

      {/* Users */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <span
          style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "var(--text-3)", textTransform: "uppercase" }}
        >
          In room · {users.length}
        </span>
        <ul style={{ display: "flex", flexDirection: "column", gap: "0.35rem", listStyle: "none" }}>
          {users.map((u) => (
            <li
              key={u.user_id}
              style={{
                fontSize: "0.85rem",
                color: u.user_id === userId ? "var(--text)" : "var(--text-2)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              {u.user_id === ownerId && (
                <span style={{ color: "var(--amber)", fontSize: "0.6rem" }}>★</span>
              )}
              {u.name}
              {u.user_id === userId && (
                <span
                  className="font-mono"
                  style={{ fontSize: "0.65rem", color: "var(--text-3)", letterSpacing: "0.1em" }}
                >
                  you
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}