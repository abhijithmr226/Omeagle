import { useRef, useCallback } from 'react';
import {
  PeerConnectionManager,
  addLocalTracks,
  createOffer,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  type SignalSender,
  type ConnectionCallbacks,
} from '../services/webrtc';

export function useWebRTC() {
  // Each hook instance owns its own PeerConnectionManager — no module-level singleton
  const managerRef = useRef(new PeerConnectionManager());

  const setupInitiator = useCallback(async (
    callId: string,
    stream: MediaStream,
    signalSender: SignalSender,
    callbacks: ConnectionCallbacks
  ) => {
    const manager = managerRef.current;
    const pc = manager.create(signalSender, callbacks);
    await addLocalTracks(pc, stream);
    const offer = await createOffer(pc);
    await signalSender.sendOffer(offer);
    void callId; // used externally for tracking only
  }, []);

  const setupReceiver = useCallback(async (
    callId: string,
    stream: MediaStream,
    offer: RTCSessionDescriptionInit,
    signalSender: SignalSender,
    callbacks: ConnectionCallbacks
  ) => {
    const manager = managerRef.current;
    const pc = manager.create(signalSender, callbacks);
    await addLocalTracks(pc, stream);
    const answer = await handleOffer(pc, offer);
    await signalSender.sendAnswer(answer);
    void callId;
  }, []);

  const handleRemoteAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const pc = managerRef.current.get();
    if (pc) await handleAnswer(pc, answer);
  }, []);

  const handleRemoteICE = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = managerRef.current.get();
    if (pc) {
      try {
        await handleIceCandidate(pc, candidate);
      } catch (e) {
        console.warn('[webrtc] ICE candidate error:', e);
      }
    }
  }, []);

  const getVideoSender = useCallback((): RTCRtpSender | null => {
    return managerRef.current.getVideoSender();
  }, []);

  const cleanup = useCallback(() => {
    managerRef.current.close();
  }, []);

  return {
    setupInitiator,
    setupReceiver,
    handleRemoteAnswer,
    handleRemoteICE,
    getVideoSender,
    cleanup,
  };
}
