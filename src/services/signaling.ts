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
  const channel = supabase.channel(`call:${callId}`);

  channel
    .on('broadcast', { event: 'offer' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onOffer(payload.offer, payload.senderId);
      }
    })
    .on('broadcast', { event: 'answer' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onAnswer(payload.answer, payload.senderId);
      }
    })
    .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onIceCandidate(payload.candidate, payload.senderId);
      }
    })
    .on('broadcast', { event: 'disconnect' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onStrangerDisconnected();
      }
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onStrangerTyping();
      }
    })
    .on('broadcast', { event: 'stop-typing' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onStrangerStopTyping();
      }
    })
    .on('broadcast', { event: 'message' }, ({ payload }) => {
      if (payload.senderId !== userId) {
        callbacks.onReceiveMessage(payload.text);
      }
    })
    .subscribe((status) => {
      callbacks.onChannelStatus?.(status);
    });

  return {
    sendOffer: async (offer: RTCSessionDescriptionInit) => {
      await channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: { offer, senderId: userId },
      });
    },

    sendAnswer: async (answer: RTCSessionDescriptionInit) => {
      await channel.send({
        type: 'broadcast',
        event: 'answer',
        payload: { answer, senderId: userId },
      });
    },

    sendIceCandidate: async (candidate: RTCIceCandidateInit) => {
      await channel.send({
        type: 'broadcast',
        event: 'ice-candidate',
        payload: { candidate, senderId: userId },
      });
    },

    sendDisconnect: async () => {
      try {
        await channel.send({
          type: 'broadcast',
          event: 'disconnect',
          payload: { senderId: userId },
        });
      } catch {}
    },

    sendTyping: async () => {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { senderId: userId },
      });
    },

    sendStopTyping: async () => {
      await channel.send({
        type: 'broadcast',
        event: 'stop-typing',
        payload: { senderId: userId },
      });
    },

    sendMessage: async (text: string) => {
      // FIX: Persist to DB FIRST, then broadcast.
      // This ensures the record exists before any realtime events fire.
      // The broadcast is best-effort for real-time delivery; the DB is the source of truth.
      const { error } = await supabase
        .from('messages')
        .insert({
          call_id: callId,
          sender_id: userId,
          message: text,
        });

      if (error) {
        console.error('[signaling] sendMessage persist error:', error);
        // Still attempt broadcast so the sender sees their message immediately
      }

      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { text, senderId: userId },
      });
    },

    cleanup: () => {
      supabase.removeChannel(channel);
    },
  };
}
