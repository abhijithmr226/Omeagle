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

export function createCallChannel(callId: string, callbacks: CallChannelCallbacks): CallChannel {
  const userId = getCurrentUserId();
  const processedSignalIds = new Set<string>();

  const processSignal = (type: string, data: any, senderId: string, signalId?: string) => {
    if (senderId === userId) return;
    if (signalId && processedSignalIds.has(signalId)) return;
    if (signalId) processedSignalIds.add(signalId);

    if (type === 'offer') callbacks.onOffer(data, senderId);
    else if (type === 'answer') callbacks.onAnswer(data, senderId);
    else if (type === 'ice-candidate') callbacks.onIceCandidate(data, senderId);
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
      if (payload.senderId !== userId) callbacks.onReceiveMessage(payload.text);
    })
    .subscribe((status) => {
      callbacks.onChannelStatus?.(status);
      if (status === 'SUBSCRIBED') {
        // Fetch existing signals from DB in case broadcast was missed before subscription
        fetchDbSignals();
      }
    });

  // 2. Setup Realtime Postgres changes listener on 'signals' table (100% delivery backup)
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
      const signalId = crypto.randomUUID();
      // Broadcast immediately
      broadcastChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer, senderId: userId, signalId },
      }).catch(() => {});

      // Persist to DB for guarantee
      if (userId) {
        await supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'offer',
          data: offer,
        });
      }
    },

    sendAnswer: async (answer: RTCSessionDescriptionInit) => {
      const signalId = crypto.randomUUID();
      broadcastChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer, senderId: userId, signalId },
      }).catch(() => {});

      if (userId) {
        await supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'answer',
          data: answer,
        });
      }
    },

    sendIceCandidate: async (candidate: RTCIceCandidateInit) => {
      const signalId = crypto.randomUUID();
      broadcastChannel.send({
        type: 'broadcast',
        event: 'ice-candidate',
        payload: { candidate, senderId: userId, signalId },
      }).catch(() => {});

      if (userId) {
        await supabase.from('signals').insert({
          id: signalId,
          call_id: callId,
          sender_id: userId,
          type: 'ice-candidate',
          data: candidate,
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
      if (userId) {
        const { error } = await supabase
          .from('messages')
          .insert({
            call_id: callId,
            sender_id: userId,
            message: text,
          });

        if (error) {
          console.error('[signaling] sendMessage error:', error);
        }
      }

      await broadcastChannel.send({
        type: 'broadcast',
        event: 'message',
        payload: { text, senderId: userId },
      }).catch(() => {});
    },

    cleanup: () => {
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(dbSignalsChannel);
    },
  };
}
