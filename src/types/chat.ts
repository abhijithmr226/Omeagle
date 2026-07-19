export type ChatMode = 'landing' | 'video' | 'text';
export type ConnectionStatus = 'idle' | 'searching' | 'connected' | 'disconnected';
export type ThemeMode = 'light' | 'dark';

export interface ChatMessage {
  id: string;
  sender: 'you' | 'stranger' | 'system';
  text: string;
  timestamp: string;
}

export interface UserSettings {
  videoDeviceId?: string;
  audioDeviceId?: string;
}
