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
import { AgeGateModal } from './components/Modals/AgeGateModal';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import { Blog } from './pages/Blog';
import { Safety } from './pages/Safety';
import type { ChatMode, ConnectionStatus, PartnerProfile } from './types/chat';
import { joinQueue, pollMatch, leaveQueue, endCall, cleanupAfterSkip } from './services/queue';
import { createCallChannel, type CallChannel } from './services/signaling';
import { useWebRTC } from './hooks/useWebRTC';
import { useMedia } from './hooks/useMedia';
import { useChat } from './hooks/useChat';
import { useSettingsContext } from './contexts/SettingsContext';
import { useThemeContext } from './contexts/ThemeContext';
import { getOnlineCount } from './lib/auth';
import { supabase } from './lib/supabase';
import { getCurrentUserId } from './lib/auth';
import { trackChatStart, trackMatchFound, trackChatEnd, trackSkipNext } from './services/gtm';

// Polling fallback intervals (used only when Realtime match detection is unavailable)
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
  const [ageConfirmed, setAgeConfirmed] = useState(() => {
    return sessionStorage.getItem('omeagle_age_verified') === 'true';
  });

  const roomIdRef = useRef<string | null>(null);
  const callChannelRef = useRef<CallChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartRef = useRef<number>(0);
  const currentModeRef = useRef<ChatMode>('landing');
  const initiatorRef = useRef<boolean>(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  // Supabase Realtime channel used to detect when a match arrives
  const matchChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  currentModeRef.current = mode;
  // Keep ref in sync so callbacks always see the latest stream
  localStreamRef.current = media.localStream;

  const cleanupPoll = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const cleanupMatchChannel = useCallback(() => {
    if (matchChannelRef.current) {
      supabase.removeChannel(matchChannelRef.current);
      matchChannelRef.current = null;
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
    const localStream = localStreamRef.current;
    if (!callId || !localStream) return;
    const channel = callChannelRef.current;
    if (!channel) return;
    try {
      await webrtc.setupReceiver(callId, localStream, offer, {
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
  }, [webrtc, handleStrangerDisconnected]);

  const handleMatchFound = useCallback(async (callId: string, initiator: boolean, profile?: PartnerProfile | null) => {
    cleanupPoll();
    cleanupMatchChannel();
    roomIdRef.current = callId;
    initiatorRef.current = initiator;
    setPartnerProfile(profile || null);
    chat.clearMessages();
    chat.addSystemMessage(buildPartnerMessage(profile));
    setConnectionStatus('connecting');

    trackMatchFound(currentModeRef.current);

    const channel = createCallChannel(callId, {
      onOffer: handleOffer,
      onAnswer: webrtc.handleRemoteAnswer,
      onIceCandidate: webrtc.handleRemoteICE,
      onStrangerDisconnected: handleStrangerDisconnected,
      onStrangerTyping: chat.handleStrangerTyping,
      onStrangerStopTyping: chat.handleStrangerStopTyping,
      onReceiveMessage: chat.addMessage.bind(null, 'stranger'),
      onChannelStatus: (status) => {
        if (status !== 'SUBSCRIBED') return;
        if (initiator && currentModeRef.current === 'video') {
          // Initiator in video mode: set up WebRTC; connectionStatus set by onConnectionStateChange
          const localStream = localStreamRef.current;
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
                  if (state === 'connected') {
                    setConnectionStatus('connected');
                  } else if (state === 'disconnected' || state === 'failed') {
                    handleStrangerDisconnected();
                  }
                },
              });
            } catch (err) {
              console.error('[app] WebRTC initiator error:', err);
            }
          }, 500);
        } else {
          // Text mode or non-initiator: channel is ready, mark connected
          // (Non-initiator in video mode gets 'connected' from WebRTC onConnectionStateChange)
          if (currentModeRef.current === 'text') {
            setConnectionStatus('connected');
          }
          // Non-initiator in video mode: wait for WebRTC onConnectionStateChange
        }
      },
    });

    callChannelRef.current = channel;
  }, [chat, webrtc, cleanupPoll, cleanupMatchChannel, handleOffer, handleStrangerDisconnected]);

  // Polling fallback (fires only if Realtime hasn't picked up the match first)
  const doPoll = useCallback(async () => {
    const chatMode = currentModeRef.current as 'video' | 'text';
    try {
      const result = await pollMatch(chatMode);  // FIX: pass actual mode
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

  /**
   * Subscribe to Supabase Realtime on the calls table.
   * When a new call is inserted that includes the current user as user1 or user2,
   * we immediately handle the match — no polling needed.
   */
  const subscribeToMatchRealtime = useCallback((chatMode: 'video' | 'text') => {
    cleanupMatchChannel();
    const userId = getCurrentUserId();
    if (!userId) return;

    const ch = supabase
      .channel(`match:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `user1_id=eq.${userId}`,
        },
        (payload) => {
          const call = payload.new as { id: string; user1_id: string; user2_id: string; mode: string };
          if (call.mode !== chatMode) return;
          // user1 is the waiting user — they are NOT the initiator
          handleMatchFound(call.id, false, null);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `user2_id=eq.${userId}`,
        },
        (payload) => {
          const call = payload.new as { id: string; user1_id: string; user2_id: string; mode: string };
          if (call.mode !== chatMode) return;
          // user2 is the one who triggered the match — they ARE the initiator
          handleMatchFound(call.id, true, null);
        }
      )
      .subscribe();

    matchChannelRef.current = ch;
  }, [handleMatchFound, cleanupMatchChannel]);

  const startChatRef = useRef<(chatMode: 'video' | 'text') => Promise<void>>();

  const startChat = useCallback(async (chatMode: 'video' | 'text') => {
    cleanupPoll();
    cleanupMatchChannel();
    await cleanupCallChannel();
    setMode(chatMode);
    setConnectionStatus('searching');
    setRemoteStream(null);
    setPartnerProfile(null);
    chat.clearMessages();
    webrtc.cleanup();

    trackChatStart(chatMode);

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
      // Subscribe to Realtime BEFORE joining queue so we don't miss the match event
      subscribeToMatchRealtime(chatMode);

      const result = await joinQueue(chatMode, {
        country: settings.country,
        gender: settings.gender,
        interests: settings.interests,
        preferredGender: settings.preferredGender,
        preferredCountries: settings.preferredCountries,
      });

      // If the RPC already returned a match immediately (user2 scenario), handle it
      if (result.status === 'matched' && result.call_id) {
        handleMatchFound(result.call_id, result.initiator ?? true, result.partner_profile);
        return;
      }

      // Otherwise start polling as a fallback alongside Realtime
      pollStartRef.current = Date.now();
      doPoll();
    } catch (err) {
      console.error('[matching] join error:', err);
      cleanupMatchChannel();
      const msg = err instanceof Error ? err.message : String(err);
      chat.addSystemMessage(`Failed to connect: ${msg}`);
      setConnectionStatus('idle');
    }
  }, [settings, media, webrtc, chat, cleanupPoll, cleanupMatchChannel, cleanupCallChannel, doPoll, subscribeToMatchRealtime, handleMatchFound]);

  startChatRef.current = startChat;

  const handleStop = useCallback(async () => {
    cleanupPoll();
    cleanupMatchChannel();
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

    trackChatEnd(currentModeRef.current);
  }, [webrtc, media, chat, cleanupPoll, cleanupMatchChannel, cleanupCallChannel]);

  const handleNext = useCallback(async () => {
    cleanupPoll();
    cleanupMatchChannel();
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

    trackSkipNext(currentModeRef.current);

    // Re-start in the same mode after a short delay
    setTimeout(() => startChatRef.current?.(currentModeRef.current as 'video' | 'text'), 300);
  }, [webrtc, cleanupPoll, cleanupMatchChannel, cleanupCallChannel]);

  const handleFlipCamera = useCallback(() => {
    media.flipCamera((newTrack) => {
      const sender = webrtc.getVideoSender();
      if (sender) sender.replaceTrack(newTrack);
    });
  }, [media, webrtc]);

  const handleSendMessage = useCallback((text: string) => {
    chat.addMessage('you', text);
    const channel = callChannelRef.current;
    if (channel) {
      channel.sendMessage(text);
    }
  }, [chat]);

  // Online count — initial fetch + periodic refresh
  useEffect(() => {
    getOnlineCount().then(setOnlineCount).catch(() => {});
    const interval = setInterval(() => {
      getOnlineCount().then(setOnlineCount).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    cleanupPoll();
    cleanupMatchChannel();
    cleanupCallChannel();
  }, [cleanupPoll, cleanupMatchChannel, cleanupCallChannel]);

  const openPage = (page: string) => navigate(`/${page}`);

  const handleAgeConfirm = useCallback(() => {
    sessionStorage.setItem('omeagle_age_verified', 'true');
    setAgeConfirmed(true);
  }, []);

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
          <Route path="/blog" element={<Blog />} />
          <Route path="/safety" element={<Safety />} />
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

      <div className="ad-banner">
        <script dangerouslySetInnerHTML={{ __html: `
          atOptions = {
            'key' : '8bdddf8feba87229589bd6c56db45ecd',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        ` }} />
        <script src="https://www.highperformanceformat.com/8bdddf8feba87229589bd6c56db45ecd/invoke.js" async />
      </div>
      <Footer onOpenPage={openPage} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settings={settings} onSaveSettings={updateSettings} />
      <PreferencesModal isOpen={isPrefsOpen} onClose={() => setIsPrefsOpen(false)}
        settings={settings} onSave={updateSettings} />
      {!ageConfirmed && <AgeGateModal onConfirm={handleAgeConfirm} />}

      <style>{`
        .chat-layout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; width: 100%; margin: 0 auto; position: relative; }
        .video-column { display: flex; flex-direction: column; gap: 0.5rem; min-height: 0; }
        .chat-column { display: flex; flex-direction: column; }
        .text-chat-layout { display: flex; justify-content: center; width: 100%; max-width: 640px; margin: 0 auto; }
        .mobile-chat-overlay { display: none; }
        .ad-banner { display: flex; justify-content: center; width: 100%; max-width: 100vw; overflow: hidden; padding: 0.5rem 0; opacity: 0.85; }

        @media (max-width: 1024px) {
          .ad-banner { display: none; }
          .chat-layout-grid { grid-template-columns: 1fr; gap: 0; }
          .video-column { height: calc(100dvh - 120px); display: flex; flex-direction: column; justify-content: space-between; }
          .chat-column { display: none; }
          .mobile-chat-overlay {
            display: flex; flex-direction: column; position: fixed; bottom: 0; left: 0; right: 0;
            height: 55vh; background: var(--bg-surface); border-top: 1px solid var(--border-color);
            border-radius: var(--radius-xl) var(--radius-xl) 0 0; box-shadow: 0 -4px 30px rgba(0,0,0,0.3);
            z-index: 200; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden;
            padding-bottom: env(safe-area-inset-bottom, 0px);
          }
          .mobile-chat-overlay.open { transform: translateY(0); }
          .mobile-chat-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);
            font-weight: 700; font-size: 0.9rem; flex-shrink: 0; background: var(--bg-surface);
          }
          .mobile-chat-close {
            width: 40px; height: 40px; border-radius: var(--radius-full);
            background: var(--bg-surface-secondary); display: flex; align-items: center;
            justify-content: center; font-size: 1rem; color: var(--text-primary);
            min-width: 44px; min-height: 44px; -webkit-tap-highlight-color: transparent;
          }
          .mobile-chat-close:active { background: var(--border-color); }
        }

        @media (max-width: 480px) {
          .mobile-chat-overlay { height: 60vh; }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .video-column { height: calc(100dvh - 80px); }
          .mobile-chat-overlay { height: 50vh; }
        }
      `}</style>
    </div>
  );
};
