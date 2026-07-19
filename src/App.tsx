import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { VideoGrid } from './components/VideoChat/VideoGrid';
import { ControlsBar } from './components/VideoChat/ControlsBar';
import { ChatBox } from './components/Chat/ChatBox';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/Modals/SettingsModal';
import { PreferencesModal } from './components/Modals/PreferencesModal';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import type { ChatMode, ConnectionStatus, PartnerProfile } from './types/chat';
import { joinQueue, pollMatch, leaveQueue, endCall, cleanupAfterSkip } from './services/queue';
import { getVideoSender } from './services/webrtc';
import { createCallChannel, type CallChannel } from './services/signaling';
import { useWebRTC } from './hooks/useWebRTC';
import { useMedia } from './hooks/useMedia';
import { useChat } from './hooks/useChat';
import { useSettingsContext } from './contexts/SettingsContext';
import { useThemeContext } from './contexts/ThemeContext';
import { getOnlineCount } from './lib/auth';

const POLL_FAST_MS = 4000;
const POLL_SLOW_MS = 8000;
const SLOW_AFTER_MS = 30000;

function buildPartnerMessage(profile?: PartnerProfile | null): string {
  if (!profile) return "You're now chatting with a random stranger. Say hi!";
  const parts: string[] = [];
  if (profile.country) {
    const flag = String.fromCodePoint(
      ...[...profile.country.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
    );
    parts.push(`a stranger from ${flag} ${profile.country}`);
  } else {
    parts.push('a random stranger');
  }
  if (profile.interests && profile.interests.length > 0) {
    const shared = profile.interests.slice(0, 5).join(', ');
    parts[0] += ` who likes ${shared}`;
  }
  return `You're now chatting with ${parts[0]}. Say hi!`;
}

export const App: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();
  const { settings, updateSettings } = useSettingsContext();
  const webrtc = useWebRTC();
  const media = useMedia();
  const chat = useChat();

  const [mode, setMode] = useState<ChatMode>('landing');
  const [onlineCount, setOnlineCount] = useState(120);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null);

  const roomIdRef = useRef<string | null>(null);
  const callChannelRef = useRef<CallChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const currentModeRef = useRef<ChatMode>('landing');
  const initiatorRef = useRef<boolean>(false);

  currentModeRef.current = mode;

  const cleanupPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const cleanupCallChannel = useCallback(async () => {
    if (callChannelRef.current) {
      try { await callChannelRef.current.sendDisconnect(); } catch {}
      callChannelRef.current.cleanup();
      callChannelRef.current = null;
    }
  }, []);

  const handleStrangerDisconnected = useCallback(() => {
    setConnectionStatus('disconnected');
    setRemoteStream(null);
    setPartnerProfile(null);
    roomIdRef.current = null;
    callChannelRef.current?.cleanup();
    callChannelRef.current = null;
    webrtc.cleanup();
    chat.addSystemMessage('Stranger has disconnected.');
  }, [webrtc, chat]);

  const handleStrangerTimeout = useCallback(() => {
    setConnectionStatus('timed-out');
    setRemoteStream(null);
    setPartnerProfile(null);
    roomIdRef.current = null;
    callChannelRef.current?.cleanup();
    callChannelRef.current = null;
    webrtc.cleanup();
    chat.addSystemMessage('Stranger took too long to respond. Finding someone new...');
    setTimeout(() => {
      const fn = startChatRef.current;
      if (fn) fn(currentModeRef.current as 'video' | 'text');
    }, 1500);
  }, [webrtc, chat]);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const callId = roomIdRef.current;
    if (!callId || !media.localStream) return;
    const channel = callChannelRef.current;
    if (!channel) return;
    try {
      await webrtc.setupReceiver(callId, media.localStream, offer, {
        sendOffer: channel.sendOffer,
        sendAnswer: channel.sendAnswer,
        sendIceCandidate: channel.sendIceCandidate,
      }, {
        onRemoteStream: (stream) => setRemoteStream(stream),
        onConnectionStateChange: (state) => {
          if (state === 'connected') {
            setConnectionStatus('connected');
          } else if (state === 'disconnected' || state === 'failed') {
            handleStrangerDisconnected();
          }
        },
      });
    } catch (err) {
      console.error('[app] handleOffer error:', err);
    }
  }, [webrtc, media.localStream, handleStrangerDisconnected]);

  const handleMatchFound = useCallback(async (callId: string, initiator: boolean, profile?: PartnerProfile | null) => {
    cleanupPoll();
    roomIdRef.current = callId;
    initiatorRef.current = initiator;
    setPartnerProfile(profile || null);
    chat.clearMessages();
    chat.addSystemMessage(buildPartnerMessage(profile));
    setConnectionStatus('connecting');

    const channel = createCallChannel(callId, {
      onOffer: handleOffer,
      onAnswer: webrtc.handleRemoteAnswer,
      onIceCandidate: webrtc.handleRemoteICE,
      onStrangerDisconnected: handleStrangerDisconnected,
      onStrangerTyping: chat.handleStrangerTyping,
      onStrangerStopTyping: chat.handleStrangerStopTyping,
      onReceiveMessage: chat.addMessage.bind(null, 'stranger'),
      onChannelStatus: (status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          if (initiator && currentModeRef.current === 'video' && media.localStream) {
            const localStream = media.localStream;
            setTimeout(async () => {
              const ch = callChannelRef.current;
              if (!ch || !localStream) return;
              try {
                await webrtc.setupInitiator(callId, localStream, {
                  sendOffer: ch.sendOffer,
                  sendAnswer: ch.sendAnswer,
                  sendIceCandidate: ch.sendIceCandidate,
                }, {
                  onRemoteStream: (stream) => setRemoteStream(stream),
                  onConnectionStateChange: (state) => {
                    if (state === 'disconnected' || state === 'failed') {
                      handleStrangerDisconnected();
                    }
                  },
                });
              } catch (err) {
                console.error('[app] WebRTC initiator error:', err);
              }
            }, 500);
          }
        }
      },
    });

    callChannelRef.current = channel;
  }, [chat, webrtc, media.localStream, cleanupPoll, handleOffer, handleStrangerDisconnected]);

  const doPoll = useCallback(async () => {
    try {
      const result = await pollMatch();
      if (result.status === 'matched' && result.call_id) {
        handleMatchFound(
          result.call_id,
          result.initiator ?? true,
          result.partner_profile
        );
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

  const startChatRef = useRef<(chatMode: 'video' | 'text') => Promise<void>>();

  const startChat = useCallback(async (chatMode: 'video' | 'text') => {
    cleanupPoll();
    await cleanupCallChannel();
    setMode(chatMode);
    setConnectionStatus('searching');
    setRemoteStream(null);
    setPartnerProfile(null);
    chat.clearMessages();
    webrtc.cleanup();

    if (chatMode === 'video') {
      const result = await media.startMedia(settings);
      if (!result.stream) {
        const errMsg = media.handleError(result.error ?? new Error('no camera'));
        chat.addSystemMessage(errMsg);
        setConnectionStatus('idle');
        return;
      }
    }

    try {
      await joinQueue(chatMode, {
        country: settings.country,
        gender: settings.gender,
        interests: settings.interests,
        preferredGender: settings.preferredGender,
        preferredCountries: settings.preferredCountries,
      });
      pollStartRef.current = Date.now();
      doPoll();
    } catch (err) {
      console.error('[matching] join error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      chat.addSystemMessage(`Failed to connect: ${msg}`);
      setConnectionStatus('idle');
    }
  }, [settings, media, webrtc, chat, cleanupPoll, cleanupCallChannel, doPoll]);

  startChatRef.current = startChat;

  const handleStop = useCallback(async () => {
    cleanupPoll();
    await cleanupCallChannel();
    const callId = roomIdRef.current;
    if (callId) {
      await endCall(callId);
    }
    roomIdRef.current = null;
    webrtc.cleanup();
    media.stopMedia();
    setRemoteStream(null);
    setPartnerProfile(null);
    setConnectionStatus('idle');
    chat.addSystemMessage('You have disconnected.');
  }, [webrtc, media, chat, cleanupPoll, cleanupCallChannel]);

  const handleNext = useCallback(async () => {
    cleanupPoll();
    await cleanupCallChannel();
    const callId = roomIdRef.current;
    if (callId) {
      await cleanupAfterSkip(callId);
    }
    roomIdRef.current = null;
    webrtc.cleanup();
    setRemoteStream(null);
    setPartnerProfile(null);
    setConnectionStatus('idle');
    setTimeout(() => startChatRef.current?.(currentModeRef.current as 'video' | 'text'), 300);
  }, [webrtc, chat, cleanupPoll, cleanupCallChannel]);

  const handleFlipCamera = useCallback(() => {
    media.flipCamera((newTrack) => {
      const sender = getVideoSender();
      if (sender) sender.replaceTrack(newTrack);
    });
  }, [media]);

  const handleSendMessage = useCallback((text: string) => {
    chat.addMessage('you', text);
    const channel = callChannelRef.current;
    if (channel) {
      channel.sendMessage(text);
    }
  }, [chat]);

  useEffect(() => {
    getOnlineCount().then(setOnlineCount).catch(() => {});
    const interval = setInterval(() => {
      getOnlineCount().then(setOnlineCount).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => () => { cleanupPoll(); cleanupCallChannel(); }, [cleanupPoll, cleanupCallChannel]);

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
              <LandingPage onStartChat={startChat} onlineCount={onlineCount}
                settings={settings} onOpenPrefs={() => setIsPrefsOpen(true)} />
            ) : mode === 'text' ? (
              <div className="text-chat-layout">
                <ChatBox messages={chat.messages} connectionStatus={connectionStatus}
                  onSendMessage={handleSendMessage} onNext={handleNext}
                  onStart={() => startChat('text')} mode="text"
                  isStrangerTyping={chat.isStrangerTyping}
                  onTyping={() => callChannelRef.current?.sendTyping()}
                  partnerProfile={partnerProfile} />
              </div>
            ) : (
              <div className="chat-layout-grid">
                <div className="video-column">
                  <VideoGrid localStream={media.localStream} remoteStream={remoteStream}
                    connectionStatus={connectionStatus} isMuted={media.isMuted} isVideoOff={media.isVideoOff}
                    onFlipCamera={handleFlipCamera} />
                  <ControlsBar connectionStatus={connectionStatus} isMuted={media.isMuted} isVideoOff={media.isVideoOff}
                    onStart={() => startChat('video')} onStop={handleStop} onNext={handleNext}
                    onToggleMute={media.toggleMute} onToggleVideo={media.toggleVideo} onOpenSettings={() => setIsSettingsOpen(true)}
                    onFlipCamera={handleFlipCamera} mobileChatOpen={mobileChatOpen} onToggleChat={() => setMobileChatOpen(!mobileChatOpen)} />
                </div>
                <div className="chat-column">
                  <ChatBox messages={chat.messages} connectionStatus={connectionStatus}
                    onSendMessage={handleSendMessage} onNext={handleNext}
                    onStart={() => startChat('video')} mode="video"
                    isStrangerTyping={chat.isStrangerTyping}
                    onTyping={() => callChannelRef.current?.sendTyping()}
                    partnerProfile={partnerProfile} />
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
                    onTyping={() => callChannelRef.current?.sendTyping()}
                    partnerProfile={partnerProfile} />
                </div>
              </div>
            )
          } />
        </Routes>
      </main>

      <Footer onOpenPage={openPage} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSaveSettings={updateSettings} />
      <PreferencesModal isOpen={isPrefsOpen} onClose={() => setIsPrefsOpen(false)}
        settings={settings} onSave={updateSettings} />

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
