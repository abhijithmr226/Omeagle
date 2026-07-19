import { useState, useCallback } from 'react';
import type { UserSettings } from '../types/chat';
import { getMediaDevices, getLocalUserMedia } from '../services/webrtc';

export function useMedia() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const startMedia = useCallback(async (settings?: UserSettings) => {
    try {
      const stream = await getLocalUserMedia(settings?.videoDeviceId, settings?.audioDeviceId);
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(false);
      return stream;
    } catch (err) {
      console.error('[media] startMedia error:', err);
      return null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    localStream?.getTracks().forEach(t => {
      try { t.stop(); } catch {}
    });
    setLocalStream(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [localStream]);

  const toggleMute = useCallback(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(prev => !prev);
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
    setIsVideoOff(prev => !prev);
  }, [localStream, isVideoOff]);

  const flipCamera = useCallback(async () => {
    const currentTrack = localStream?.getVideoTracks()[0];
    if (!currentTrack) return;
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      localStream?.removeTrack(currentTrack);
      currentTrack.stop();
      localStream?.addTrack(newVideoTrack);
      setFacingMode(newFacing);
      setLocalStream(localStream);
    } catch (err) {
      console.error('[media] flipCamera error:', err);
    }
  }, [localStream, facingMode]);

  const loadDevices = useCallback(async () => {
    const list = await getMediaDevices();
    setDevices(list);
  }, []);

  const handleError = useCallback((err: unknown): string => {
    if (!(err instanceof DOMException)) return 'Camera error. Please check permissions.';
    switch (err.name) {
      case 'NotAllowedError': return 'Camera access denied. Please allow camera permissions.';
      case 'NotFoundError': return 'No camera or microphone found.';
      case 'OverconstrainedError': return 'Camera constraints not supported.';
      case 'NotReadableError': return 'Camera is in use by another app.';
      default: return 'Camera error. Please try again.';
    }
  }, []);

  return {
    localStream, isMuted, isVideoOff, facingMode, devices,
    startMedia, stopMedia, toggleMute, toggleVideo, flipCamera, loadDevices, handleError,
  };
}
