const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface CreateSessionResponse {
  code: string;
  user_id: string;
}

export interface JoinSessionResponse {
  code: string;
  user_id: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  // Some endpoints return 200 with no body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function createSession(name: string): Promise<CreateSessionResponse> {
  const res = await fetch(`${BASE}/api/v1/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handleResponse<CreateSessionResponse>(res);
}

export async function joinSession(code: string, name: string): Promise<JoinSessionResponse> {
  const res = await fetch(`${BASE}/api/v1/sessions/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return handleResponse<JoinSessionResponse>(res);
}

export async function leaveSession(code: string, userId: string): Promise<void> {
  await fetch(`${BASE}/api/v1/sessions/${code}/leave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function setTimer(code: string, userId: string, seconds: number): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/sessions/${code}/timer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, seconds }),
  });
  return handleResponse<void>(res);
}

export async function timerAction(
  code: string,
  userId: string,
  action: 'start' | 'pause' | 'reset',
): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/sessions/${code}/timer/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  return handleResponse<void>(res);
}

export async function sendMessage(
  code: string,
  userId: string,
  name: string,
  text: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/sessions/${code}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, name, text }),
  });
  return handleResponse<void>(res);
}

export function getStreamUrl(code: string, userId: string): string {
  return `${BASE}/api/v1/stream?code=${code}&user_id=${userId}`;
}
