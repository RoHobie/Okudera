const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export interface SessionCreated {
  code: string
  user_id: string
}

export interface SessionJoined {
  code: string
  user_id: string
}

export async function createSession(name: string): Promise<SessionCreated> {
  const res = await fetch(`${API}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function joinSession(code: string, name: string): Promise<SessionJoined> {
  const res = await fetch(`${API}/api/v1/sessions/${code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function leaveSession(code: string, userId: string): Promise<void> {
  await fetch(`${API}/api/v1/sessions/${code}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  })
}

export async function setTimer(code: string, userId: string, seconds: number): Promise<void> {
  const res = await fetch(`${API}/api/v1/sessions/${code}/timer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, seconds }),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function timerAction(
  code: string,
  userId: string,
  action: "start" | "pause" | "reset"
): Promise<void> {
  const res = await fetch(`${API}/api/v1/sessions/${code}/timer/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function sendMessage(
  code: string,
  userId: string,
  name: string,
  text: string
): Promise<void> {
  const res = await fetch(`${API}/api/v1/sessions/${code}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, name, text }),
  })
  if (!res.ok) throw new Error(await res.text())
}

export function openStream(code: string, userId: string): EventSource {
  return new EventSource(`${API}/api/v1/stream?code=${code}&user_id=${userId}`)
}