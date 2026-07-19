import { useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ConnectionStatus } from '../types/chat';

interface UseSocketOptions {
  onOffer: (offer: RTCSessionDescriptionInit) => void;
  onAnswer: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onReceiveMessage: (text: string) => void;
  onStrangerDisconnected: () => void;
  onStrangerTimeout: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onOnlineCount: (count: number) => void;
  setConnectionStatus: (s: ConnectionStatus) => void;
}

export function useSocketListeners(socket: Socket | null, opts: UseSocketOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!socket) return;
    const o = optsRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers: Record<string, (...args: any[]) => void> = {
      'online-count': (count: number) => o.onOnlineCount(count),
      'offer': (data: { offer: RTCSessionDescriptionInit }) => o.onOffer(data.offer),
      'answer': (data: { answer: RTCSessionDescriptionInit }) => o.onAnswer(data.answer),
      'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => o.onIceCandidate(data.candidate),
      'receive-message': (data: { text: string }) => o.onReceiveMessage(data.text),
      'stranger-disconnected': () => o.onStrangerDisconnected(),
      'stranger-timeout': () => o.onStrangerTimeout(),
      'typing': () => o.onTyping(),
      'stop-typing': () => o.onStopTyping(),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    return () => {
      for (const event of Object.keys(handlers)) {
        socket.off(event);
      }
    };
  }, [socket]);
}

export function useSocketConnect(socket: Socket | null) {
  const connectedRef = useRef(false);

  const connect = useCallback(() => {
    if (socket && !socket.connected && !connectedRef.current) {
      connectedRef.current = true;
      socket.connect();
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      connectedRef.current = false;
      socket.disconnect();
    }
  }, [socket]);

  return { connect, disconnect };
}
