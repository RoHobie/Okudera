const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function createSession(name: string): Promise<{ code: string; user_id: string }> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create session");
  }
  
  return res.json();
}

export async function joinSession(code: string, name: string): Promise<{ code: string; user_id: string }> {
  const res = await fetch(`${API_BASE}/sessions/${code}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to join session");
  }
  
  return res.json();
}

export async function leaveSession(code: string, userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${code}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to leave session");
  }
}

export async function setTimer(code: string, userId: string, seconds: number): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${code}/timer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, seconds }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to set timer");
  }
}

export async function timerAction(code: string, userId: string, action: "start" | "pause" | "reset"): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${code}/timer/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to ${action} timer`);
  }
}

export async function sendMessage(code: string, userId: string, name: string, text: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${code}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, name, text }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to send message");
  }
}

export function createEventSource(code: string, userId: string): EventSource {
  return new EventSource(`${API_BASE}/stream?code=${code}&user_id=${userId}`);
}
