import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { VideoGrid } from './components/VideoChat/VideoGrid';
import { ControlsBar } from './components/VideoChat/ControlsBar';
import { ChatBox } from './components/Chat/ChatBox';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/Modals/SettingsModal';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import type { ChatMode, ConnectionStatus } from './types/chat';
import { getSocket, connectSocket, disconnectSocket } from './services/socket';
import { joinQueue, pollMatch, leaveQueue, getUserId, getOnlineCount } from './services/matching';
import { useWebRTC } from './hooks/useWebRTC';
import { useMedia } from './hooks/useMedia';
import { useChat } from './hooks/useChat';
import { useSocketListeners } from './hooks/useSocket';
import { useSettingsContext } from './contexts/SettingsContext';
import { useThemeContext } from './contexts/ThemeContext';

const POLL_FAST_MS = 4000;
const POLL_SLOW_MS = 8000;
const SLOW_AFTER_MS = 30000;

export const App: React.FC = () => {
  const socket = getSocket();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();
  const { settings } = useSettingsContext();
  const webrtc = useWebRTC();
  const media = useMedia();
  const chat = useChat();

  const [mode, setMode] = useState<ChatMode>('landing');
  const [onlineCount, setOnlineCount] = useState(120);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const roomIdRef = useRef<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const currentModeRef = useRef<ChatMode>('landing');

  currentModeRef.current = mode;

  const cleanupPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const handleMatchFound = useCallback(async (channel: string, initiator: boolean) => {
    cleanupPoll();
    roomIdRef.current = channel;
    chat.clearMessages();
    chat.addSystemMessage("You're now chatting with a random stranger. Say hi!");
    setConnectionStatus('connecting');

    connectSocket();
    socket.emit('register', { userId: getUserId() });
    socket.emit('join-room', { roomId: channel });

    setConnectionStatus('connected');

    if (currentModeRef.current === 'video' && media.localStream) {
      try {
        if (initiator) {
          await webrtc.setupInitiator(socket, channel, media.localStream, {
            onRemoteStream: (stream) => setRemoteStream(stream),
            onConnectionStateChange: (state) => {
              if (state === 'disconnected' || state === 'failed') handleStrangerDisconnected();
            },
          });
        }
      } catch (err) {
        console.error('[app] WebRTC setup error:', err);
      }
    }
  }, [socket, webrtc, media.localStream, chat, cleanupPoll]);

  const handleStrangerDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    setRemoteStream(null);
    roomIdRef.current = null;
    webrtc.cleanup();
    chat.addSystemMessage('Stranger has disconnected.');
  }, [webrtc, chat]);

  const handleStrangerTimeout = useCallback(() => {
    setConnectionStatus('timed-out');
    setRemoteStream(null);
    roomIdRef.current = null;
    webrtc.cleanup();
    chat.addSystemMessage('Stranger took too long to respond. Finding someone new...');
    setTimeout(() => startChat(currentModeRef.current as 'video' | 'text'), 1500);
  }, [webrtc, chat]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const roomId = roomIdRef.current;
    if (!roomId || !media.localStream) return;
    try {
      await webrtc.setupReceiver(socket, roomId, media.localStream, offer, {
        onRemoteStream: (stream) => setRemoteStream(stream),
        onConnectionStateChange: (state) => {
          if (state === 'disconnected' || state === 'failed') handleStrangerDisconnected();
        },
      });
    } catch (err) {
      console.error('[app] handleOffer error:', err);
    }
  }, [webrtc, media.localStream, socket, handleStrangerDisconnected]);

  useSocketListeners(socket, {
    onOnlineCount: setOnlineCount,
    onOffer: handleOffer,
    onAnswer: webrtc.handleRemoteAnswer,
    onIceCandidate: webrtc.handleRemoteICE,
    onReceiveMessage: chat.addMessage.bind(null, 'stranger'),
    onStrangerDisconnected: handleStrangerDisconnected,
    onStrangerTimeout: handleStrangerTimeout,
    onTyping: chat.handleStrangerTyping,
    onStopTyping: chat.handleStrangerStopTyping,
    setConnectionStatus,
  });

  const doPoll = useCallback(async () => {
    try {
      const result = await pollMatch();
      if (result.status === 'matched' && result.channel) {
        handleMatchFound(result.channel, result.initiator!);
        return;
      }
      const elapsed = Date.now() - pollStartRef.current;
      const interval = elapsed > SLOW_AFTER_MS ? POLL_SLOW_MS : POLL_FAST_MS;
      pollTimerRef.current = setTimeout(doPoll, interval);
    } catch (err) {
      console.error('[matching] poll error:', err);
      pollTimerRef.current = setTimeout(doPoll, POLL_SLOW_MS);
    }
  }, [handleMatchFound]);

  const startChat = useCallback(async (chatMode: 'video' | 'text') => {
    cleanupPoll();
    setMode(chatMode);
    setConnectionStatus('searching');
    setRemoteStream(null);
    chat.clearMessages();
    webrtc.cleanup();

    if (chatMode === 'video') {
      const stream = await media.startMedia(settings);
      if (!stream) {
        const err = media.handleError(new Error('no camera'));
        chat.addSystemMessage(err);
        setConnectionStatus('idle');
        return;
      }
    }

    try {
      await joinQueue(chatMode);
      pollStartRef.current = Date.now();
      doPoll();
    } catch (err) {
      console.error('[matching] join error:', err);
      chat.addSystemMessage('Failed to connect. Please try again.');
      setConnectionStatus('idle');
    }
  }, [settings, media, webrtc, chat, cleanupPoll, doPoll]);

  const handleStop = useCallback(async () => {
    cleanupPoll();
    socket.emit('stop');
    await leaveQueue();
    roomIdRef.current = null;
    webrtc.cleanup();
    media.stopMedia();
    setRemoteStream(null);
    setConnectionStatus('idle');
    chat.addSystemMessage('You have disconnected.');
  }, [socket, webrtc, media, chat, cleanupPoll]);

  const handleNext = useCallback(async () => {
    cleanupPoll();
    socket.emit('skip');
    await leaveQueue();
    roomIdRef.current = null;
    webrtc.cleanup();
    setRemoteStream(null);
    setConnectionStatus('idle');
    setTimeout(() => startChat(currentModeRef.current as 'video' | 'text'), 300);
  }, [socket, webrtc, chat, cleanupPoll, startChat]);

  const handleSendMessage = useCallback((text: string) => {
    chat.addMessage('you', text);
    const roomId = roomIdRef.current;
    if (roomId) {
      socket.emit('send-message', { roomId, text });
      socket.emit('message-sent', { roomId });
    }
  }, [chat, socket]);

  useEffect(() => {
    getOnlineCount().then(setOnlineCount).catch(() => {});
    const interval = setInterval(() => {
      getOnlineCount().then(setOnlineCount).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => () => cleanupPoll(), [cleanupPoll]);

  const openPage = (page: string) => navigate(`/${page}`);

  return (
    <div className="app-container">
      <Header currentMode={mode} onSelectMode={(m) => {
        setMode(m);
        if (m !== 'landing' && connectionStatus === 'idle') startChat(m as 'video' | 'text');
      }} onlineCount={onlineCount} theme={theme} onToggleTheme={toggleTheme} />

      <main className="main-content">
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/*" element={
            mode === 'landing' ? (
              <LandingPage onStartChat={startChat} onlineCount={onlineCount} />
            ) : mode === 'text' ? (
              <div className="text-chat-layout">
                <ChatBox messages={chat.messages} connectionStatus={connectionStatus}
                  onSendMessage={handleSendMessage} onNext={handleNext}
                  onStart={() => startChat('text')} mode="text"
                  isStrangerTyping={chat.isStrangerTyping}
                  onTyping={() => roomIdRef.current && socket.volatile.emit('typing', { roomId: roomIdRef.current })} />
              </div>
            ) : (
              <div className="chat-layout-grid">
                <div className="video-column">
                  <VideoGrid localStream={media.localStream} remoteStream={remoteStream}
                    connectionStatus={connectionStatus} isMuted={media.isMuted} isVideoOff={media.isVideoOff}
                    onFlipCamera={media.flipCamera} />
                  <ControlsBar connectionStatus={connectionStatus} isMuted={media.isMuted} isVideoOff={media.isVideoOff}
                    onStart={() => startChat('video')} onStop={handleStop} onNext={handleNext}
                    onToggleMute={media.toggleMute} onToggleVideo={media.toggleVideo} onOpenSettings={() => setIsSettingsOpen(true)}
                    onFlipCamera={media.flipCamera} mobileChatOpen={mobileChatOpen} onToggleChat={() => setMobileChatOpen(!mobileChatOpen)} />
                </div>
                <div className="chat-column">
                  <ChatBox messages={chat.messages} connectionStatus={connectionStatus}
                    onSendMessage={handleSendMessage} onNext={handleNext}
                    onStart={() => startChat('video')} mode="video"
                    isStrangerTyping={chat.isStrangerTyping}
                    onTyping={() => roomIdRef.current && socket.volatile.emit('typing', { roomId: roomIdRef.current })} />
                </div>
                <div className={`mobile-chat-overlay ${mobileChatOpen ? 'open' : ''}`}>
                  <div className="mobile-chat-header">
                    <span>Text Chat</span>
                    <button className="mobile-chat-close" onClick={() => setMobileChatOpen(false)}>✕</button>
                  </div>
                  <ChatBox messages={chat.messages} connectionStatus={connectionStatus}
                    onSendMessage={handleSendMessage} onNext={handleNext}
                    onStart={() => startChat('video')} mode="video"
                    isStrangerTyping={chat.isStrangerTyping}
                    onTyping={() => roomIdRef.current && socket.volatile.emit('typing', { roomId: roomIdRef.current })} />
                </div>
              </div>
            )
          } />
        </Routes>
      </main>

      <Footer onOpenPage={openPage} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSaveSettings={() => {}} />

      <style>{`
        .chat-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; width: 100%; margin: 0 auto; position: relative; }
        .video-column { display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; }
        .chat-column { display: flex; flex-direction: column; }
        .text-chat-layout { display: flex; justify-content: center; width: 100%; max-width: 640px; margin: 0 auto; }
        .mobile-chat-overlay { display: none; }
        @media (max-width: 1024px) {
          .chat-layout-grid { grid-template-columns: 1fr; gap: 0; }
          .video-column { height: calc(100dvh - 140px); display: flex; flex-direction: column; justify-content: space-between; }
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
