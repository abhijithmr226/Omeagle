import { useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import {
  createPeerConnection, addLocalTracks, createOffer, handleOffer,
  handleAnswer, handleIceCandidate, closePeerConnection, getPeerConnection,
} from '../services/webrtc';

interface WebRTCCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}

export function useWebRTC() {
  const roomIdRef = useRef<string | null>(null);

  const setupInitiator = useCallback(async (
    socket: Socket, roomId: string, stream: MediaStream, callbacks: WebRTCCallbacks
  ) => {
    roomIdRef.current = roomId;
    const pc = createPeerConnection(socket, roomId, {
      onRemoteStream: callbacks.onRemoteStream,
      onIceCandidate: () => {},
      onConnectionStateChange: callbacks.onConnectionStateChange,
    });
    await addLocalTracks(pc, stream);
    const offer = await createOffer(pc);
    socket.emit('offer', { roomId, offer });
  }, []);

  const setupReceiver = useCallback(async (
    socket: Socket, roomId: string, stream: MediaStream,
    offer: RTCSessionDescriptionInit, callbacks: WebRTCCallbacks
  ) => {
    roomIdRef.current = roomId;
    const pc = createPeerConnection(socket, roomId, {
      onRemoteStream: callbacks.onRemoteStream,
      onIceCandidate: () => {},
      onConnectionStateChange: callbacks.onConnectionStateChange,
    });
    await addLocalTracks(pc, stream);
    const answer = await handleOffer(pc, offer);
    socket.emit('answer', { roomId, answer });
  }, []);

  const handleRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = getPeerConnection();
    if (pc) await handleAnswer(pc, answer);
  }, []);

  const handleRemoteICE = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = getPeerConnection();
    if (pc) {
      try {
        await handleIceCandidate(pc, candidate);
      } catch (e) {
        console.warn('[webrtc] ICE candidate error:', e);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    roomIdRef.current = null;
    closePeerConnection();
  }, []);

  return {
    roomIdRef,
    setupInitiator, setupReceiver,
    handleRemoteAnswer, handleRemoteICE,
    cleanup,
  };
}
