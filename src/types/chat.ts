export type ChatMode = 'landing' | 'video' | 'text';
export type ConnectionStatus = 'idle' | 'searching' | 'connecting' | 'connected' | 'disconnected' | 'timed-out';
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
  country?: string;
  gender?: string;
  interests?: string[];
  preferredGender?: string;
  preferredCountries?: string[];
}

export interface PartnerProfile {
  country?: string;
  gender?: string;
  interests?: string[];
}
