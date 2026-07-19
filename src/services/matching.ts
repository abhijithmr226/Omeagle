const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || (window.location.hostname === 'localhost'
    ? `http://${window.location.hostname}:3001`
    : 'https://omeagle-production.up.railway.app');

let _userId: string | null = null;

export function getUserId(): string {
  if (!_userId) {
    _userId = localStorage.getItem('omeagle_uid');
    if (!_userId) {
      _userId = crypto.randomUUID();
      localStorage.setItem('omeagle_uid', _userId);
    }
  }
  return _userId;
}

export interface MatchResult {
  status: 'waiting' | 'matched';
  channel?: string;
  partnerId?: string;
  initiator?: boolean;
}

export async function joinQueue(mode: 'video' | 'text'): Promise<MatchResult> {
  const res = await fetch(`${SERVER_URL}/api/matching-queue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, userId: getUserId() }),
  });
  return res.json();
}

export async function pollMatch(): Promise<MatchResult> {
  const res = await fetch(`${SERVER_URL}/api/matching-queue?userId=${getUserId()}`);
  return res.json();
}

export async function leaveQueue(): Promise<void> {
  await fetch(`${SERVER_URL}/api/matching-queue?userId=${getUserId()}`, {
    method: 'DELETE',
  });
}

export async function getOnlineCount(): Promise<number> {
  try {
    const res = await fetch(`${SERVER_URL}/api/online-count`);
    const data = await res.json();
    return data.count || 1;
  } catch {
    return 1;
  }
}
