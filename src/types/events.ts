// Supabase Realtime broadcast event types used by signaling.ts

export interface OfferPayload {
  offer: RTCSessionDescriptionInit;
  senderId: string;
}

export interface AnswerPayload {
  answer: RTCSessionDescriptionInit;
  senderId: string;
}

export interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
  senderId: string;
}

export interface DisconnectPayload {
  senderId: string;
}

export interface TypingPayload {
  senderId: string;
}

export interface MessagePayload {
  text: string;
  senderId: string;
}
