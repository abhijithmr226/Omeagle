import { useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ConnectionStatus } from '../types/chat';

interface UseSocketOptions {
  onStrangerFound: (roomId: string, initiator: boolean) => void;
  onOffer: (offer: RTCSessionDescriptionInit) => void;
  onAnswer: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onReceiveMessage: (text: string) => void;
  onStrangerDisconnected: () => void;
  onStrangerTimeout: () => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onOnlineCount: (count: number) => void;
  onWaiting: () => void;
  setConnectionStatus: (s: ConnectionStatus) => void;
}

export function useSocketListeners(socket: Socket | null, opts: UseSocketOptions) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  useEffect(() => {
    if (!socket) return;
    const o = optsRef.current;

    const handlers = {
      'online-count': o.onOnlineCount,
      'waiting': o.onWaiting,
      'stranger-found': (data: { roomId: string; initiator: boolean }) => {
        o.setConnectionStatus('connecting');
        o.onStrangerFound(data.roomId, data.initiator);
      },
      'offer': (data: { offer: RTCSessionDescriptionInit }) => o.onOffer(data.offer),
      'answer': (data: { answer: RTCSessionDescriptionInit }) => o.onAnswer(data.answer),
      'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => o.onIceCandidate(data.candidate),
      'receive-message': (data: { text: string }) => o.onReceiveMessage(data.text),
      'stranger-disconnected': o.onStrangerDisconnected,
      'stranger-timeout': o.onStrangerTimeout,
      'typing': o.onTyping,
      'stop-typing': o.onStopTyping,
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler as (...args: unknown[]) => void);
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
