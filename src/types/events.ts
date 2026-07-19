export interface ServerToClientEvents {
  'online-count': (count: number) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit }) => void;
  'receive-message': (data: { text: string }) => void;
  'stranger-disconnected': () => void;
  'stranger-timeout': () => void;
  'typing': (data: { from: string }) => void;
  'stop-typing': (data: { from: string }) => void;
}

export interface ClientToServerEvents {
  'register': (data: { userId: string }) => void;
  'join-room': (data: { roomId: string }) => void;
  'offer': (data: { roomId: string; offer: RTCSessionDescriptionInit }) => void;
  'answer': (data: { roomId: string; answer: RTCSessionDescriptionInit }) => void;
  'ice-candidate': (data: { roomId: string; candidate: RTCIceCandidateInit }) => void;
  'send-message': (data: { roomId: string; text: string }) => void;
  'message-sent': (data: { roomId: string }) => void;
  'typing': (data: { roomId: string }) => void;
  'stop-typing': (data: { roomId: string }) => void;
  'stop': () => void;
  'skip': () => void;
}
