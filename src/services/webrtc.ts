const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};

export type SignalSender = {
  sendOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
};

export type ConnectionCallbacks = {
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
};

// Queue and deduplicate ICE candidates until remote description is set
const pendingIceCandidatesMap = new WeakMap<RTCPeerConnection, RTCIceCandidateInit[]>();
const processedCandidateKeysMap = new WeakMap<RTCPeerConnection, Set<string>>();

export class PeerConnectionManager {
  private pc: RTCPeerConnection | null = null;

  create(signalSender: SignalSender, callbacks: ConnectionCallbacks): RTCPeerConnection {
    if (this.pc) {
      try { this.pc.close(); } catch {}
      this.pc = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.pc = pc;

    pendingIceCandidatesMap.set(pc, []);
    processedCandidateKeysMap.set(pc, new Set());

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalSender.sendIceCandidate(event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        callbacks.onRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc === this.pc) {
        callbacks.onConnectionStateChange(pc.connectionState);
      }
    };

    return pc;
  }

  get(): RTCPeerConnection | null {
    return this.pc;
  }

  getVideoSender(): RTCRtpSender | null {
    if (!this.pc) return null;
    return this.pc.getSenders().find(s => s.track?.kind === 'video') || null;
  }

  close(): void {
    if (this.pc) {
      this.pc.onicecandidate = null;
      this.pc.ontrack = null;
      this.pc.onconnectionstatechange = null;
      pendingIceCandidatesMap.delete(this.pc);
      processedCandidateKeysMap.delete(this.pc);
      try { this.pc.getTransceivers().forEach(t => { try { t.stop(); } catch {} }); } catch {}
      try { this.pc.getSenders().forEach(s => { try { s.replaceTrack(null); } catch {} }); } catch {}
      try { this.pc.close(); } catch {}
      this.pc = null;
    }
  }
}

// Shared helpers
export async function addLocalTracks(pc: RTCPeerConnection, stream: MediaStream): Promise<void> {
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
}

export async function createOffer(pc: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return pc.localDescription!;
}

async function flushPendingIceCandidates(pc: RTCPeerConnection): Promise<void> {
  const pending = pendingIceCandidatesMap.get(pc) || [];
  pendingIceCandidatesMap.set(pc, []);
  for (const candidate of pending) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('[webrtc] Error flushing ICE candidate:', e);
    }
  }
}

export async function handleOffer(
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> {
  if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
    console.warn('[webrtc] handleOffer ignored, current signaling state:', pc.signalingState);
  }
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  await flushPendingIceCandidates(pc);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return pc.localDescription!;
}

export async function handleAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit): Promise<void> {
  if (pc.signalingState !== 'have-local-offer') {
    console.warn('[webrtc] handleAnswer ignored, current signaling state:', pc.signalingState);
    return;
  }
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
  await flushPendingIceCandidates(pc);
}

export async function handleIceCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidateInit): Promise<void> {
  if (pc.signalingState === 'closed') return;

  const key = `${candidate.candidate}_${candidate.sdpMid}_${candidate.sdpMLineIndex}`;
  const processed = processedCandidateKeysMap.get(pc) || new Set();
  if (processed.has(key)) return;
  processed.add(key);
  processedCandidateKeysMap.set(pc, processed);

  if (!pc.remoteDescription || !pc.remoteDescription.type) {
    const pending = pendingIceCandidatesMap.get(pc) || [];
    pending.push(candidate);
    pendingIceCandidatesMap.set(pc, pending);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.warn('[webrtc] addIceCandidate error:', e);
  }
}

export function stopMediaStream(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach(track => { try { track.stop(); } catch {} });
  }
}

export async function getLocalUserMedia(
  videoDeviceId?: string,
  audioDeviceId?: string,
  audioOnly = false
): Promise<MediaStream> {
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

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: audioConstraints,
    });
  } catch {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
    } catch (fallbackErr) {
      console.warn('[webrtc] Could not get media stream:', fallbackErr);
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
