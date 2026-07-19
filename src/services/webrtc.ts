/**
 * Real WebRTC + Socket.io signaling service for Omeagle.
 * Handles peer-to-peer video/audio and text chat via RTCPeerConnection.
 */

import { Socket } from 'socket.io-client';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

export type ConnectionCallbacks = {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
};

let peerConnection: RTCPeerConnection | null = null;

export function createPeerConnection(
  socket: Socket,
  roomId: string,
  callbacks: ConnectionCallbacks
): RTCPeerConnection {
  peerConnection = new RTCPeerConnection(ICE_SERVERS);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { roomId, candidate: event.candidate.toJSON() });
    }
  };

  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      callbacks.onRemoteStream(event.streams[0]);
    }
  };

  peerConnection.onconnectionstatechange = () => {
    if (peerConnection) {
      callbacks.onConnectionStateChange(peerConnection.connectionState);
    }
  };

  return peerConnection;
}

export async function addLocalTracks(
  pc: RTCPeerConnection,
  stream: MediaStream
): Promise<void> {
  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });
}

export async function createOffer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function handleOffer(
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function handleAnswer(
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function handleIceCandidate(
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
}

export function closePeerConnection(): void {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
}

export async function getLocalUserMedia(
  videoDeviceId?: string,
  audioDeviceId?: string
): Promise<MediaStream> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const videoConstraints: MediaTrackConstraints = videoDeviceId
    ? { deviceId: { exact: videoDeviceId } }
    : isMobile
      ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }
      : { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };

  const constraints: MediaStreamConstraints = {
    video: videoConstraints,
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    // Fallback: try with minimal constraints
    try {
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (fallbackErr) {
      console.warn('Could not get webcam stream:', fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function getMediaDevices(): Promise<MediaDeviceInfo[]> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    return await navigator.mediaDevices.enumerateDevices();
  } catch (err) {
    console.error('Failed to enumerate devices:', err);
    return [];
  }
}
