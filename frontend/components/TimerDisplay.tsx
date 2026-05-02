"use client"

import { useState } from "react"
import type { TimerState } from "@/hooks/useSession"
import { timerAction, setTimer } from "@/lib/api"

interface Props {
  sessionCode: string
  userId: string
  isOwner: boolean
  timer: TimerState
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function TimerDisplay({ sessionCode, userId, isOwner, timer }: Props) {
  const [setTimeInput, setSetTimeInput] = useState("")
  const [showSetTime, setShowSetTime] = useState(false)
  const [actionError, setActionError] = useState("")

  const isRunning = timer.state === "running"
  const isPaused = timer.state === "paused"
  const isDone = timer.state === "done"
  const isIdle = timer.state === "idle"

  async function act(action: "start" | "pause" | "reset") {
    setActionError("")
    try {
      await timerAction(sessionCode, userId, action)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "error")
    }
  }

  async function handleSetTime() {
    const parts = setTimeInput.trim().split(":").map(Number)
    let seconds = 0
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1]
    else if (parts.length === 1) seconds = parts[0] * 60

    if (!seconds || seconds <= 0) {
      setActionError("Enter time as MM:SS or minutes")
      return
    }
    setActionError("")
    try {
      await setTimer(sessionCode, userId, seconds)
      setShowSetTime(false)
      setSetTimeInput("")
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "error")
    }
  }

  // Color logic
  const pct = timer.remaining / (timer.remaining > 0 || isRunning || isPaused ? Math.max(timer.remaining, 1) : 1)
  const timerColor = isDone
    ? "var(--red)"
    : isIdle
    ? "var(--text-3)"
    : "var(--amber)"

  const glowStyle =
    isRunning
      ? "0 0 60px rgba(232, 137, 12, 0.2), 0 0 120px rgba(232, 137, 12, 0.08)"
      : isDone
      ? "0 0 60px rgba(204, 63, 63, 0.2)"
      : "none"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
      {/* Timer face */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {/* State label */}
        <div
          className="font-mono"
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
            color: timerColor,
            textTransform: "uppercase",
            opacity: 0.8,
            minHeight: "1rem",
          }}
        >
          {isRunning && (
            <span style={{ animation: "pulse-amber 2s ease-in-out infinite" }}>
              ● RUNNING
            </span>
          )}
          {isPaused && "⏸ PAUSED"}
          {isDone && "■ DONE"}
          {isIdle && "○ IDLE"}
        </div>

        {/* Time display */}
        <div
          className="font-mono"
          style={{
            fontSize: "clamp(4rem, 12vw, 7rem)",
            fontWeight: 300,
            color: timerColor,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textShadow: glowStyle,
            transition: "color 0.4s ease, text-shadow 0.4s ease",
            userSelect: "none",
            tabularNums: true,
          } as React.CSSProperties}
        >
          {formatTime(timer.remaining)}
        </div>
      </div>

      {/* Controls — owner only */}
      {isOwner && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          {/* Primary action row */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {/* Start / Pause */}
            {(isIdle || isPaused) && (
              <button
                onClick={() => act("start")}
                style={controlBtn("amber")}
              >
                {isIdle ? "START" : "RESUME"}
              </button>
            )}
            {isRunning && (
              <button onClick={() => act("pause")} style={controlBtn("amber")}>
                PAUSE
              </button>
            )}

            {/* Reset */}
            <button
              onClick={() => act("reset")}
              disabled={isIdle}
              style={controlBtn("ghost")}
            >
              RESET
            </button>

            {/* Set time */}
            <button
              onClick={() => { setShowSetTime((v) => !v); setActionError("") }}
              style={controlBtn(showSetTime ? "active" : "ghost")}
              title="Set timer duration"
            >
              SET
            </button>
          </div>

          {/* Set time input */}
          {showSetTime && (
            <div
              className="animate-slide-down"
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                value={setTimeInput}
                onChange={(e) => setSetTimeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSetTime() }}
                placeholder="MM:SS or minutes"
                className="font-mono"
                style={{
                  background: "var(--bg-3)",
                  border: "1px solid var(--border-2)",
                  borderRadius: "2px",
                  color: "var(--text)",
                  fontSize: "0.85rem",
                  padding: "0.5rem 0.75rem",
                  outline: "none",
                  width: "160px",
                  textAlign: "center",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--amber)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
                autoFocus
              />
              <button onClick={handleSetTime} style={controlBtn("amber")}>
                OK
              </button>
            </div>
          )}

          {actionError && (
            <p
              className="font-mono"
              style={{ fontSize: "0.75rem", color: "var(--red)" }}
            >
              {actionError}
            </p>
          )}
        </div>
      )}

      {/* Non-owner: read-only note */}
      {!isOwner && (
        <p
          className="font-mono"
          style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.1em" }}
        >
          ROOM OWNER CONTROLS TIMER
        </p>
      )}
    </div>
  )
}

function controlBtn(variant: "amber" | "ghost" | "active"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    padding: "0.55rem 1.1rem",
    borderRadius: "2px",
    cursor: "pointer",
    transition: "all 0.15s",
    border: "1px solid",
  }
  if (variant === "amber") {
    return { ...base, background: "var(--amber)", borderColor: "var(--amber)", color: "#0e0e0e", fontWeight: 600 }
  }
  if (variant === "active") {
    return { ...base, background: "var(--amber-glow)", borderColor: "var(--amber-dim)", color: "var(--amber)" }
  }
  return { ...base, background: "transparent", borderColor: "var(--border-2)", color: "var(--text-2)" }
}