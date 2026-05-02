"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSession, joinSession } from "@/lib/api"

type Mode = "idle" | "create" | "join"

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [mode, setMode] = useState<Mode>("idle")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const trimmedName = name.trim()
  const trimmedCode = code.trim().toUpperCase()

  async function handleCreate() {
    if (!trimmedName) return
    setLoading(true)
    setError("")
    try {
      const res = await createSession(trimmedName)
      sessionStorage.setItem("okudera_user_id", res.user_id)
      sessionStorage.setItem("okudera_name", trimmedName)
      router.push(`/session/${res.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create room")
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!trimmedName || !trimmedCode) return
    setLoading(true)
    setError("")
    try {
      const res = await joinSession(trimmedCode, trimmedName)
      sessionStorage.setItem("okudera_user_id", res.user_id)
      sessionStorage.setItem("okudera_name", trimmedName)
      router.push(`/session/${res.code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Room not found")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
        }}
      />

      {/* Amber glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,137,12,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-fade-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Wordmark */}
        <div style={{ textAlign: "center" }}>
          <h1
            className="font-mono"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              color: "var(--amber)",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            OKUDERA
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
            Shared session timer
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Name input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: "var(--text-3)",
                textTransform: "uppercase",
              }}
            >
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && trimmedName) setMode("create")
              }}
              placeholder="enter name"
              maxLength={50}
              style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: "2px",
                color: "var(--text)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                padding: "0.65rem 0.75rem",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--amber)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Mode: idle — show two buttons */}
          {mode === "idle" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <button
                onClick={() => { setMode("create"); setError("") }}
                disabled={!trimmedName}
                style={btnStyle("primary")}
              >
                Create room
              </button>
              <button
                onClick={() => { setMode("join"); setError("") }}
                disabled={!trimmedName}
                style={btnStyle("ghost")}
              >
                Join room
              </button>
            </div>
          )}

          {/* Mode: create */}
          {mode === "create" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="animate-slide-down">
              <button
                onClick={handleCreate}
                disabled={loading || !trimmedName}
                style={btnStyle("primary")}
              >
                {loading ? "Creating…" : "Confirm — Create room"}
              </button>
              <button onClick={() => setMode("idle")} style={btnStyle("ghost")}>
                Back
              </button>
            </div>
          )}

          {/* Mode: join */}
          {mode === "join" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }} className="animate-slide-down">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label
                  style={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.15em",
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                  }}
                >
                  Room code
                </label>
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().slice(0, 6))
                    setError("")
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleJoin() }}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="font-mono"
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "2px",
                    color: "var(--amber)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "1.25rem",
                    letterSpacing: "0.3em",
                    padding: "0.65rem 0.75rem",
                    outline: "none",
                    textAlign: "center",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--amber)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={loading || !trimmedName || trimmedCode.length !== 6}
                style={btnStyle("primary")}
              >
                {loading ? "Joining…" : "Join room"}
              </button>
              <button onClick={() => setMode("idle")} style={btnStyle("ghost")}>
                Back
              </button>
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--red)",
                fontFamily: "var(--font-mono)",
                borderLeft: "2px solid var(--red)",
                paddingLeft: "0.75rem",
              }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function btnStyle(variant: "primary" | "ghost"): React.CSSProperties {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    borderRadius: "2px",
    fontSize: "0.8rem",
    fontFamily: "var(--font-sans)",
    letterSpacing: "0.05em",
    cursor: "pointer",
    transition: "all 0.15s",
    border: "1px solid",
  }
  if (variant === "primary") {
    return {
      ...base,
      background: "var(--amber)",
      borderColor: "var(--amber)",
      color: "#0e0e0e",
      fontWeight: 600,
    }
  }
  return {
    ...base,
    background: "transparent",
    borderColor: "var(--border-2)",
    color: "var(--text-2)",
  }
}