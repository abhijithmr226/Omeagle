import { useRef, useCallback } from 'react';
import {
  createPeerConnection, addLocalTracks, createOffer, handleOffer,
  handleAnswer, handleIceCandidate, closePeerConnection, getPeerConnection,
  type SignalSender, type ConnectionCallbacks,
} from '../services/webrtc';

export function useWebRTC() {
  const roomIdRef = useRef<string | null>(null);

  const setupInitiator = useCallback(async (
    callId: string, stream: MediaStream,
    signalSender: SignalSender,
    callbacks: ConnectionCallbacks
  ) => {
    roomIdRef.current = callId;
    const pc = createPeerConnection(signalSender, {
      onRemoteStream: callbacks.onRemoteStream,
      onConnectionStateChange: callbacks.onConnectionStateChange,
    });
    await addLocalTracks(pc, stream);
    const offer = await createOffer(pc);
    await signalSender.sendOffer(offer);
  }, []);

  const setupReceiver = useCallback(async (
    callId: string, stream: MediaStream,
    offer: RTCSessionDescriptionInit,
    signalSender: SignalSender,
    callbacks: ConnectionCallbacks
  ) => {
    roomIdRef.current = callId;
    const pc = createPeerConnection(signalSender, {
      onRemoteStream: callbacks.onRemoteStream,
      onConnectionStateChange: callbacks.onConnectionStateChange,
    });
    await addLocalTracks(pc, stream);
    const answer = await handleOffer(pc, offer);
    await signalSender.sendAnswer(answer);
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
