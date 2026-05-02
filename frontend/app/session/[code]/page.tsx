"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { leaveSession } from "@/lib/api"
import TimerDisplay from "@/components/TimerDisplay"
import SessionInfo from "@/components/SessionInfo"
import EventFeed from "@/components/EventFeed"

export default function SessionPage() {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const code = (params.code ?? "").toUpperCase()

  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const id = sessionStorage.getItem("okudera_user_id") ?? ""
    const name = sessionStorage.getItem("okudera_name") ?? ""
    if (!id || !name) {
      router.replace("/")
      return
    }
    setUserId(id)
    setUserName(name)
  }, [router])

  const session = useSession(code, userId)
  const isOwner = session.ownerId === userId

  async function handleLeave() {
    setLeaving(true)
    try {
      await leaveSession(code, userId)
    } finally {
      sessionStorage.removeItem("okudera_user_id")
      sessionStorage.removeItem("okudera_name")
      router.push("/")
    }
  }

  if (!userId) return null

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        background: "var(--bg)",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.875rem 1.5rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-2)",
        }}
      >
        <span
          className="font-mono"
          style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: "var(--amber)" }}
        >
          OKUDERA
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
            {userName}
          </span>
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="font-mono"
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              borderRadius: "2px",
              color: "var(--text-3)",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              padding: "0.4rem 0.85rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--red)"
              e.currentTarget.style.color = "var(--red)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)"
              e.currentTarget.style.color = "var(--text-3)"
            }}
          >
            {leaving ? "LEAVING…" : "LEAVE"}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 300px",
          gap: 0,
          minHeight: 0,
          height: "calc(100vh - 49px)",
        }}
      >
        {/* Left — session info */}
        <aside
          style={{
            borderRight: "1px solid var(--border)",
            overflowY: "auto",
            padding: "1.25rem",
          }}
        >
          <SessionInfo
            code={code}
            ownerName={session.ownerName}
            ownerId={session.ownerId}
            userId={userId}
            users={session.users}
            timer={session.timer}
            connected={session.connected}
          />
        </aside>

        {/* Center — timer */}
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial glow behind timer */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                session.timer.state === "running"
                  ? "radial-gradient(circle, rgba(232,137,12,0.07) 0%, transparent 70%)"
                  : session.timer.state === "done"
                  ? "radial-gradient(circle, rgba(204,63,63,0.07) 0%, transparent 70%)"
                  : "none",
              pointerEvents: "none",
              transition: "background 0.6s ease",
            }}
          />

          <TimerDisplay
            sessionCode={code}
            userId={userId}
            isOwner={isOwner}
            timer={session.timer}
          />
        </main>

        {/* Right — event feed */}
        <aside
          style={{
            borderLeft: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <EventFeed
            feed={session.feed}
            sessionCode={code}
            userId={userId}
            userName={userName}
          />
        </aside>
      </div>
    </div>
  )
}