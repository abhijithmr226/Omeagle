import React, { useState, useCallback } from 'react';
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
import { getSocket } from './services/socket';
import { useWebRTC } from './hooks/useWebRTC';
import { useMedia } from './hooks/useMedia';
import { useChat } from './hooks/useChat';
import { useSocketListeners, useSocketConnect } from './hooks/useSocket';
import { useSettingsContext } from './contexts/SettingsContext';
import { useThemeContext } from './contexts/ThemeContext';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const { connect: socketConnect } = useSocketConnect(socket);

  const handleStrangerDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    webrtc.cleanup();
    chat.addSystemMessage('Stranger has disconnected.');
  }, [webrtc, chat]);

  const handleStrangerTimeout = useCallback(() => {
    setConnectionStatus('timed-out');
    webrtc.cleanup();
    chat.addSystemMessage('Stranger took too long to respond. Finding someone new...');
    setTimeout(() => startChat(mode as 'video' | 'text'), 1500);
  }, [webrtc, chat, mode]);

  const handleStrangerFound = useCallback(async (roomId: string, initiator: boolean) => {
    chat.clearMessages();
    chat.addSystemMessage("You're now chatting with a random stranger. Say hi!");
    setConnectionStatus('connected');

    if (mode === 'video' && media.localStream) {
      try {
        if (initiator) {
          await webrtc.setupInitiator(socket, roomId, media.localStream, {
            onRemoteStream: () => {},
            onConnectionStateChange: (state) => {
              if (state === 'disconnected' || state === 'failed') handleStrangerDisconnected();
            },
          });
        }
      } catch (err) {
        console.error('[app] WebRTC setup error:', err);
      }
    }
  }, [mode, media.localStream, webrtc, socket, handleStrangerDisconnected, chat]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const roomId = webrtc.roomIdRef.current;
    if (!roomId || !media.localStream) return;
    try {
      await webrtc.setupReceiver(socket, roomId, media.localStream, offer, {
        onRemoteStream: () => {},
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
    onWaiting: () => setConnectionStatus('searching'),
    onStrangerFound: handleStrangerFound,
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

  const startChat = useCallback(async (chatMode: 'video' | 'text') => {
    setMode(chatMode);
    setConnectionStatus('searching');
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

    socketConnect();
    socket.emit('find-stranger', { mode: chatMode });
  }, [settings, media, webrtc, chat, socket, socketConnect]);

  const handleStop = useCallback(() => {
    socket.emit('stop');
    webrtc.cleanup();
    media.stopMedia();
    setConnectionStatus('idle');
    chat.addSystemMessage('You have disconnected.');
  }, [socket, webrtc, media, chat]);

  const handleNext = useCallback(() => {
    socket.emit('skip');
    webrtc.cleanup();
    setConnectionStatus('idle');
    setTimeout(() => startChat(mode as 'video' | 'text'), 300);
  }, [socket, webrtc, mode, startChat]);

  const handleSendMessage = useCallback((text: string) => {
    chat.addMessage('you', text);
    const roomId = webrtc.roomIdRef.current;
    if (roomId) {
      socket.emit('send-message', { roomId, text });
      socket.emit('message-sent', { roomId });
    }
  }, [chat, webrtc, socket]);

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
                  onTyping={() => socket.volatile.emit('typing', { roomId: webrtc.roomIdRef.current! })} />
              </div>
            ) : (
              <div className="chat-layout-grid">
                <div className="video-column">
                  <VideoGrid localStream={media.localStream} remoteStream={null}
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
                    onTyping={() => socket.volatile.emit('typing', { roomId: webrtc.roomIdRef.current! })} />
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
                    onTyping={() => socket.volatile.emit('typing', { roomId: webrtc.roomIdRef.current! })} />
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
