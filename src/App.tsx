import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { VideoGrid } from './components/VideoChat/VideoGrid';
import { ControlsBar } from './components/VideoChat/ControlsBar';
import { ChatBox } from './components/Chat/ChatBox';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AboutPage } from './components/Pages/AboutPage';
import { PrivacyPage } from './components/Pages/PrivacyPage';
import { TermsPage } from './components/Pages/TermsPage';
import { ContactPage } from './components/Pages/ContactPage';
import { ChatMode, ConnectionStatus, ThemeMode, ChatMessage, UserSettings } from './types/chat';
import { getSocket } from './services/socket';
import {
  createPeerConnection, addLocalTracks, createOffer, handleOffer,
  handleAnswer, handleIceCandidate,
  closePeerConnection, getLocalUserMedia, getPeerConnection,
} from './services/webrtc';
import { Socket } from 'socket.io-client';

type PageView = 'about' | 'privacy' | 'terms' | 'contact' | null;

export const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>('landing');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [onlineCount, setOnlineCount] = useState(120);
  const [currentPage, setCurrentPage] = useState<PageView>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({});

  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const modeRef = useRef<ChatMode>(mode);
  const localStreamRef = useRef<MediaStream | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on('online-count', (count: number) => setOnlineCount(count));
    socket.on('waiting', () => console.log('Waiting...'));

    socket.on('stranger-found', async ({ roomId, initiator }: { roomId: string; initiator: boolean }) => {
      roomIdRef.current = roomId;
      setConnectionStatus('connected');
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`, sender: 'system',
        text: "You're now chatting with a random stranger. Say hi!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);

      if (modeRef.current === 'video' && initiator) {
        const stream = localStreamRef.current;
        if (stream) {
          const pc = createPeerConnection(socket, roomId, {
            onRemoteStream: (rStream) => setRemoteStream(rStream),
            onConnectionStateChange: (state) => {
              if (state === 'disconnected' || state === 'failed') handleStrangerDisconnected();
            },
            onIceCandidate: () => {},
          });
          await addLocalTracks(pc, stream);
          const offer = await createOffer(pc);
          socket.emit('offer', { roomId, offer });
        }
      }
    });

    socket.on('offer', async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      const roomId = roomIdRef.current;
      if (!roomId) return;
      const pc = createPeerConnection(socket, roomId, {
        onRemoteStream: (rStream) => setRemoteStream(rStream),
        onConnectionStateChange: (state) => {
          if (state === 'disconnected' || state === 'failed') handleStrangerDisconnected();
        },
        onIceCandidate: () => {},
      });
      const stream = localStreamRef.current;
      if (stream) await addLocalTracks(pc, stream);
      const answer = await handleOffer(pc, offer);
      socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      const pc = getPeerConnection();
      if (pc) await handleAnswer(pc, answer);
    });

    socket.on('ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      const pc = getPeerConnection();
      if (pc) await handleIceCandidate(pc, candidate);
    });

    socket.on('receive-message', ({ text }: { text: string }) => {
      setMessages(prev => [...prev, {
        id: `str-${Date.now()}`, sender: 'stranger', text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    });

    socket.on('stranger-disconnected', () => handleStrangerDisconnected());

    return () => {
      socket.off('online-count'); socket.off('waiting'); socket.off('stranger-found');
      socket.off('offer'); socket.off('answer'); socket.off('ice-candidate');
      socket.off('receive-message'); socket.off('stranger-disconnected');
    };
  }, []);

  const handleStrangerDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    setRemoteStream(null);
    setMessages(prev => [...prev, {
      id: `disc-${Date.now()}`, sender: 'system', text: 'Stranger has disconnected.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    closePeerConnection();
    roomIdRef.current = null;
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleStart = useCallback(async (startMode?: ChatMode) => {
    const activeMode = startMode || mode;
    setMode(activeMode);
    modeRef.current = activeMode;
    setConnectionStatus('searching');
    setMessages([]);
    setRemoteStream(null);
    closePeerConnection();

    if (activeMode === 'video') {
      try {
        const stream = await getLocalUserMedia(settingsRef.current.videoDeviceId, settingsRef.current.audioDeviceId);
        setLocalStream(stream);
        localStreamRef.current = stream;
      } catch (err) {
        console.error('Camera error:', err);
      }
    }

    const socket = socketRef.current || getSocket();
    socketRef.current = socket;
    socket.emit('find-stranger', { mode: activeMode });
  }, [mode]);

  const handleStop = useCallback(() => {
    socketRef.current?.emit('stop');
    closePeerConnection();
    setRemoteStream(null);
    setConnectionStatus('disconnected');
    setMessages(prev => [...prev, {
      id: `stop-${Date.now()}`, sender: 'system', text: 'You have disconnected.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    roomIdRef.current = null;
  }, []);

  const handleNext = useCallback(() => {
    socketRef.current?.emit('skip');
    closePeerConnection();
    setRemoteStream(null);
    setConnectionStatus('idle');
    roomIdRef.current = null;
    setTimeout(() => handleStart(modeRef.current), 300);
  }, [handleStart]);

  const handleSendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    const roomId = roomIdRef.current;
    setMessages(prev => [...prev, {
      id: `you-${Date.now()}`, sender: 'you', text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    if (socket && roomId) socket.emit('send-message', { roomId, text });
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
      setIsVideoOff(!isVideoOff);
    }
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
      setLocalStream(localStreamRef.current = localStream);
    } catch (err) { console.error('Flip failed:', err); }
  }, [localStream, facingMode]);

  if (currentPage) {
    return (
      <div className="app-container">
        <Header currentMode={mode} onSelectMode={(m) => { setCurrentPage(null); setMode(m); }}
          onlineCount={onlineCount} theme={theme} onToggleTheme={toggleTheme} />
        <main className="main-content">
          <div className="page-view">
            {currentPage === 'about' && <AboutPage onBack={() => setCurrentPage(null)} />}
            {currentPage === 'privacy' && <PrivacyPage onBack={() => setCurrentPage(null)} />}
            {currentPage === 'terms' && <TermsPage onBack={() => setCurrentPage(null)} />}
            {currentPage === 'contact' && <ContactPage onBack={() => setCurrentPage(null)} />}
          </div>
        </main>
        <Footer onOpenPage={(p) => setCurrentPage(p as PageView)} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header currentMode={mode} onSelectMode={(newMode) => {
        setMode(newMode);
        if (newMode !== 'landing' && connectionStatus === 'idle') handleStart(newMode);
      }} onlineCount={onlineCount} theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-content">
        {mode === 'landing' ? (
          <LandingPage onStartChat={(m) => { setMode(m); handleStart(m); }} onlineCount={onlineCount} />
        ) : mode === 'text' ? (
          <div className="text-chat-layout">
            <ChatBox messages={messages} connectionStatus={connectionStatus}
              onSendMessage={handleSendMessage} onNext={handleNext}
              onStart={() => handleStart('text')} mode="text" />
          </div>
        ) : (
          <div className="chat-layout-grid">
            <div className="video-column">
              <VideoGrid localStream={localStream} remoteStream={remoteStream}
                connectionStatus={connectionStatus} isMuted={isMuted} isVideoOff={isVideoOff}
                onFlipCamera={flipCamera} />
              <ControlsBar connectionStatus={connectionStatus} isMuted={isMuted} isVideoOff={isVideoOff}
                onStart={() => handleStart('video')} onStop={handleStop} onNext={handleNext}
                onToggleMute={toggleMute} onToggleVideo={toggleVideo} onOpenSettings={() => setIsSettingsOpen(true)}
                onFlipCamera={flipCamera} mobileChatOpen={mobileChatOpen} onToggleChat={() => setMobileChatOpen(!mobileChatOpen)} />
            </div>
            <div className="chat-column">
              <ChatBox messages={messages} connectionStatus={connectionStatus}
                onSendMessage={handleSendMessage} onNext={handleNext}
                onStart={() => handleStart('video')} mode="video" />
            </div>
            <div className={`mobile-chat-overlay ${mobileChatOpen ? 'open' : ''}`}>
              <div className="mobile-chat-header">
                <span>Text Chat</span>
                <button className="mobile-chat-close" onClick={() => setMobileChatOpen(false)}>✕</button>
              </div>
              <ChatBox messages={messages} connectionStatus={connectionStatus}
                onSendMessage={handleSendMessage} onNext={handleNext}
                onStart={() => handleStart('video')} mode="video" />
            </div>
          </div>
        )}
      </main>

      <Footer onOpenPage={(p) => setCurrentPage(p as PageView)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSaveSettings={setSettings} />

      <style>{`
        .chat-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; width: 100%; margin: 0 auto; position: relative; }
        .video-column { display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; }
        .chat-column { display: flex; flex-direction: column; }
        .text-chat-layout { display: flex; justify-content: center; width: 100%; max-width: 640px; margin: 0 auto; }
        .page-view { max-width: 720px; margin: 0 auto; }
        .mobile-chat-overlay { display: none; }
        @media (max-width: 1024px) {
          .chat-layout-grid { grid-template-columns: 1fr; gap: 0; }
          .video-column { min-height: calc(100dvh - 140px); }
          .chat-column { display: none; }
          .mobile-chat-overlay {
            display: flex; flex-direction: column; position: fixed; bottom: 0; left: 0; right: 0;
            height: 55vh; background: var(--bg-surface); border-top: 1px solid var(--border-color);
            border-radius: var(--radius-xl) var(--radius-xl) 0 0; box-shadow: 0 -4px 30px rgba(0,0,0,0.3);
            z-index: 100; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;
          }
          .mobile-chat-overlay.open { transform: translateY(0); }
          .mobile-chat-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); font-weight: 700; font-size: 0.9rem; flex-shrink: 0; background: var(--bg-surface); }
          .mobile-chat-close { width: 30px; height: 30px; border-radius: var(--radius-full); background: var(--bg-surface-secondary); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: var(--text-primary); }
        }
      `}</style>
    </div>
  );
};
