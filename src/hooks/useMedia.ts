import { useState, useCallback, useRef, useEffect } from 'react';
import type { UserSettings } from '../types/chat';
import { getMediaDevices, getLocalUserMedia } from '../services/webrtc';

export interface StartMediaResult {
  stream: MediaStream | null;
  error?: unknown;
}

export function useMedia() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // FIX: Store the current stream in a ref so stopMedia always has the latest
  // reference, avoiding the stale closure issue from depending on state.
  const streamRef = useRef<MediaStream | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    streamRef.current = localStream;
  }, [localStream]);

  const startMedia = useCallback(async (settings?: UserSettings): Promise<StartMediaResult> => {
    try {
      const stream = await getLocalUserMedia(settings?.videoDeviceId, settings?.audioDeviceId);
      streamRef.current = stream;
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(false);
      return { stream };
    } catch (err) {
      console.error('[media] startMedia error:', err);
      return { stream: null, error: err };
    }
  }, []);

  const stopMedia = useCallback(() => {
    // Use ref to always access the current stream, not the closure-captured one
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
    }
    streamRef.current = null;
    setLocalStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, []); // no dependencies needed — uses ref

  const toggleMute = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    }
    setIsMuted(prev => !prev);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
    }
    setIsVideoOff(prev => !prev);
  }, [isVideoOff]);

  const flipCamera = useCallback(async (onNewTrack?: (track: MediaStreamTrack) => void) => {
    const stream = streamRef.current;
    const currentTrack = stream?.getVideoTracks()[0];
    if (!currentTrack || !stream) return;

    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      stream.removeTrack(currentTrack);
      currentTrack.stop();
      stream.addTrack(newVideoTrack);

      // Notify caller so the RTP sender can replaceTrack immediately
      onNewTrack?.(newVideoTrack);
      setFacingMode(newFacing);
      // Trigger a re-render with the same stream object (tracks changed in-place)
      setLocalStream(s => s);
    } catch (err) {
      console.error('[media] flipCamera error:', err);
    }
  }, [facingMode]);

  const loadDevices = useCallback(async () => {
    const list = await getMediaDevices();
    setDevices(list);
  }, []);

  const handleError = useCallback((err: unknown): string => {
    if (!(err instanceof DOMException)) return 'Camera error. Please check permissions.';
    switch (err.name) {
      case 'NotAllowedError': return 'Camera access denied. Please allow camera permissions in your browser settings.';
      case 'NotFoundError': return 'No camera or microphone found. Please connect a camera and try again.';
      case 'OverconstrainedError': return 'Camera constraints not supported by your device.';
      case 'NotReadableError': return 'Camera is in use by another app. Close other apps using the camera and try again.';
      case 'AbortError': return 'Camera request was aborted. Please try again.';
      case 'NotSupportedError': return 'Camera is not supported in this browser.';
      case 'SecurityError': return 'Camera access blocked for security reasons. Try using HTTPS.';
      default: return `Camera error (${err.name}). Please try again.`;
    }
  }, []);

  return {
    localStream, isMuted, isVideoOff, facingMode, devices,
    startMedia, stopMedia, toggleMute, toggleVideo, flipCamera, loadDevices, handleError,
  };
}
