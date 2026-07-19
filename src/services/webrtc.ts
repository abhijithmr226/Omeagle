import { Socket } from 'socket.io-client';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
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
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
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

export async function addLocalTracks(pc: RTCPeerConnection, stream: MediaStream): Promise<void> {
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
}

export async function createOffer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return pc.localDescription!;
}

export async function handleOffer(
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return pc.localDescription!;
}

export async function handleAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit): Promise<void> {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
}

export async function handleIceCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidateInit): Promise<void> {
  if (pc.signalingState === 'closed') return;
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
}

export function closePeerConnection(): void {
  if (peerConnection) {
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.onconnectionstatechange = null;
    peerConnection.getTransceivers().forEach(t => { try { t.stop(); } catch {} });
    peerConnection.getSenders().forEach(s => { try { s.replaceTrack(null); } catch {} });
    peerConnection.close();
    peerConnection = null;
  }
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => { try { track.stop(); } catch {} });
  }
}

export function getPeerConnection(): RTCPeerConnection | null {
  return peerConnection;
}

export async function getLocalUserMedia(
  videoDeviceId?: string,
  audioDeviceId?: string,
  audioOnly = false
): Promise<MediaStream> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;

  const videoConstraints: MediaTrackConstraints | false = audioOnly
    ? false
    : videoDeviceId
      ? { deviceId: { exact: videoDeviceId } }
      : {
          facingMode: 'user',
          width: { ideal: isPortrait ? 720 : 1280 },
          height: { ideal: isPortrait ? 1280 : 720 },
          aspectRatio: { ideal: isPortrait ? 9 / 16 : 16 / 9 },
          frameRate: { ideal: 30 },
        };

  const audioConstraints: MediaTrackConstraints | boolean = audioDeviceId
    ? { deviceId: { exact: audioDeviceId } }
    : { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

  const constraints: MediaStreamConstraints = {
    video: videoConstraints,
    audio: audioConstraints,
  };

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
    } catch (fallbackErr) {
      console.warn('Could not get webcam stream:', fallbackErr);
      throw fallbackErr;
    }
  }
}

export async function getMediaDevices(): Promise<MediaDeviceInfo[]> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    return await navigator.mediaDevices.enumerateDevices();
  } catch {
    return [];
  }
}
