import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/events';

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL
  || (window.location.hostname === 'localhost'
    ? `http://${window.location.hostname}:3001`
    : 'https://omeagle-production.up.railway.app');

let socket: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => console.log('[socket] connected:', socket?.id));
    socket.on('disconnect', (reason: string) => console.warn('[socket] disconnected:', reason));
    socket.io.on('reconnect', (attempt: number) => console.log('[socket] reconnected after', attempt, 'attempts'));
    socket.io.on('reconnect_attempt', (attempt: number) => console.log('[socket] reconnect attempt', attempt));
    socket.on('connect_error', (err: Error) => console.warn('[socket] connect error:', err.message));
  }
  return socket;
}

export function connectSocket(): TypedSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
