import { supabase } from '../lib/supabase';
import { getCurrentUserId } from '../lib/auth';

export interface CallChannelCallbacks {
  onOffer: (offer: RTCSessionDescriptionInit, senderId: string) => void;
  onAnswer: (answer: RTCSessionDescriptionInit, senderId: string) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit, senderId: string) => void;
  onStrangerDisconnected: () => void;
  onStrangerTyping: () => void;
  onStrangerStopTyping: () => void;
  onReceiveMessage: (text: string) => void;
  onChannelStatus?: (status: string) => void;
}

export interface CallChannel {
  sendOffer: (offer: RTCSessionDescriptionInit) => Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  sendIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  sendDisconnect: () => Promise<void>;
  sendTyping: () => Promise<void>;
  sendStopTyping: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  cleanup: () => void;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createCallChannel(callId: string, callbacks: CallChannelCallbacks): CallChannel {
  const userId = getCurrentUserId();
  const processedSignalIds = new Set<string>();
  const processedMessageIds = new Set<string>();

  const processSignal = (type: string, data: any, senderId: string, signalId?: string) => {
    if (senderId === userId) return;
    if (signalId && processedSignalIds.has(signalId)) return;
    if (signalId) processedSignalIds.add(signalId);

    if (type === 'offer') callbacks.onOffer(data, senderId);
    else if (type === 'answer') callbacks.onAnswer(data, senderId);
    else if (type === 'ice-candidate') callbacks.onIceCandidate(data, senderId);
  };

  const processMessage = (text: string, senderId: string, msgId?: string) => {
    if (senderId === userId) return;
    if (msgId && processedMessageIds.has(msgId)) return;
    if (msgId) processedMessageIds.add(msgId);

    callbacks.onReceiveMessage(text);
  };

  // 1. Setup Realtime Broadcast channel (for instant low-latency delivery)
  const broadcastChannel = supabase.channel(`call:${callId}`);

  broadcastChannel
    .on('broadcast', { event: 'offer' }, ({ payload }) => {
      processSignal('offer', payload.offer, payload.senderId, payload.signalId);
    })
    .on('broadcast', { event: 'answer' }, ({ payload }) => {
      processSignal('answer', payload.answer, payload.senderId, payload.signalId);
    })
    .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
      processSignal('ice-candidate', payload.candidate, payload.senderId, payload.signalId);
    })
    .on('broadcast', { event: 'disconnect' }, ({ payload }) => {
      if (payload.senderId !== userId) callbacks.onStrangerDisconnected();
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.senderId !== userId) callbacks.onStrangerTyping();
    })
    .on('broadcast', { event: 'stop-typing' }, ({ payload }) => {
      if (payload.senderId !== userId) callbacks.onStrangerStopTyping();
    })
    .on('broadcast', { event: 'message' }, ({ payload }) => {
      processMessage(payload.text, payload.senderId, payload.msgId);
    })
    .subscribe((status) => {
      callbacks.onChannelStatus?.(status);
      if (status === 'SUBSCRIBED') {
        // Fetch existing signals from DB in case broadcast was missed before subscription
        fetchDbSignals();
      }
    });

  // 2. Setup Realtime Postgres changes listener on 'signals' table (100% signal delivery backup)
  const dbSignalsChannel = supabase
    .channel(`signals:${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'signals',
        filter: `call_id=eq.${callId}`,
      },
      (payload) => {
        const row = payload.new as { id: string; sender_id: string; type: string; data: any };
        processSignal(row.type, row.data, row.sender_id, row.id);
      }
    )
    .subscribe();

  // 3. Setup Realtime Postgres changes listener on 'messages' table (100% message delivery backup)
  const dbMessagesChannel = supabase
    .channel(`dbmessages:${callId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `call_id=eq.${callId}`,
      },
      (payload) => {
        const row = payload.new as { id: string; sender_id: string; message: string };
        processMessage(row.message, row.sender_id, row.id);
      }
    )
    .subscribe();

  // Helper to fetch existing stored signals in DB
  const fetchDbSignals = async () => {
    const { data, error } = await supabase
      .from('signals')
      .select('id, sender_id, type, data')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      for (const row of data) {
        processSignal(row.type, row.data, row.sender_id, row.id);
      }
    }
  };

  return {
    sendOffer: async (offer: RTCSessionDescriptionInit) => {
      const signalId = generateUUID();
      // Broadcast immediately
      broadcastChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer, senderId: userId, signalId },
      }).catch(() => {});

      // Persist to DB for guarantee
      if (userId) {
        supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'offer',
          data: offer,
        }).then(({ error }) => {
          if (error) console.warn('[signaling] signals insert warning:', error.message);
        });
      }
    },

    sendAnswer: async (answer: RTCSessionDescriptionInit) => {
      const signalId = generateUUID();
      broadcastChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer, senderId: userId, signalId },
      }).catch(() => {});

      if (userId) {
        supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'answer',
          data: answer,
        }).then(({ error }) => {
          if (error) console.warn('[signaling] signals insert warning:', error.message);
        });
      }
    },

    sendIceCandidate: async (candidate: RTCIceCandidateInit) => {
      const signalId = generateUUID();
      broadcastChannel.send({
        type: 'broadcast',
        event: 'ice-candidate',
        payload: { candidate, senderId: userId, signalId },
      }).catch(() => {});

      if (userId) {
        supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'ice-candidate',
          data: candidate,
        }).then(({ error }) => {
          if (error) console.warn('[signaling] signals insert warning:', error.message);
        });
      }
    },

    sendDisconnect: async () => {
      try {
        await broadcastChannel.send({
          type: 'broadcast',
          event: 'disconnect',
          payload: { senderId: userId },
        });
      } catch {}
    },

    sendTyping: async () => {
      await broadcastChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: userId },
      }).catch(() => {});
    },

    sendStopTyping: async () => {
      await broadcastChannel.send({
        type: 'broadcast',
        event: 'stop-typing',
        payload: { senderId: userId },
      }).catch(() => {});
    },

    sendMessage: async (text: string) => {
      const msgId = generateUUID();

      // 1. Broadcast immediately for instant UI update on receiver
      broadcastChannel.send({
        type: 'broadcast',
        event: 'message',
        payload: { text, senderId: userId, msgId },
      }).catch(() => {});

      // 2. Async DB persistence backup
      if (userId) {
        supabase.from('messages').insert({
          id: msgId,
          call_id: callId,
          sender_id: userId,
          message: text,
        }).then(({ error }) => {
          if (error) console.warn('[signaling] message insert warning:', error.message);
        });
      }
    },

    cleanup: () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbSignalsChannel);
      supabase.removeChannel(dbMessagesChannel);
    },
  };
}
