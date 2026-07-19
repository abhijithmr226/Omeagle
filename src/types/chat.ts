export type ChatMode = 'landing' | 'video' | 'text';
export type ConnectionStatus = 'idle' | 'searching' | 'connected' | 'disconnected';
export type ThemeMode = 'light' | 'dark';
export type PageView = 'about' | 'privacy' | 'terms' | 'contact' | null;

export interface ChatMessage {
  id: string;
  sender: 'you' | 'stranger' | 'system';
  text: string;
  timestamp: string;
}

export interface StrangerProfile {
  id: string;
  name: string;
  location: string;
  countryFlag: string;
  avatarUrl: string;
  interests: string[];
  videoUrl?: string;
}

export interface UserSettings {
  videoDeviceId?: string;
  audioDeviceId?: string;
  autoNextOnSkip: boolean;
  filterByInterest: boolean;
  userInterests: string[];
  language: string;
  // New features
  unmonitoredMode: boolean;
  faceCheck: boolean;
  keywordFilter: boolean;
  blockedKeywords: string[];
  locationSharing: boolean;
  countryFilter: string;
}

export interface Favorite {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
}

export interface UserLocation {
  country: string;
  city: string;
  countryCode: string;
}
