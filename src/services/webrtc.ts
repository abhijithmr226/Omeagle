const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // NOTE: These are public TURN credentials for development.
    // For production, replace with a dedicated TURN service (e.g. Metered, Twilio).
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

// FIX: Use a class-based instance instead of a module-level singleton.
// The old pattern (`let peerConnection: RTCPeerConnection | null`) was shared
// across the entire module lifetime, causing corruption in React StrictMode
// and during rapid skip/reconnect cycles.

export class PeerConnectionManager {
  private pc: RTCPeerConnection | null = null;

  create(signalSender: SignalSender, callbacks: ConnectionCallbacks): RTCPeerConnection {
    if (this.pc) {
      try { this.pc.close(); } catch {}
      this.pc = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.pc = pc;

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
      try { this.pc.getTransceivers().forEach(t => { try { t.stop(); } catch {} }); } catch {}
      try { this.pc.getSenders().forEach(s => { try { s.replaceTrack(null); } catch {} }); } catch {}
      try { this.pc.close(); } catch {}
      this.pc = null;
    }
  }
}

// Shared helpers (pure functions, no global state)
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
