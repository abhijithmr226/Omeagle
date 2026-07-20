/**
 * Google Tag Manager (GTM) & Analytics DataLayer utility module
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export interface GTMEventParams {
  [key: string]: unknown;
}

/**
 * Safely pushes an event to window.dataLayer
 */
export const pushToDataLayer = (eventName: string, params: GTMEventParams = {}): void => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
};

/**
 * Track user starting a chat (Video or Text)
 */
export const trackChatStart = (chatMode: string): void => {
  pushToDataLayer('chat_start', { chat_mode: chatMode });
};

/**
 * Track match found with another user
 */
export const trackMatchFound = (chatMode: string): void => {
  pushToDataLayer('match_found', { chat_mode: chatMode });
};

/**
 * Track ending a chat session
 */
export const trackChatEnd = (chatMode: string): void => {
  pushToDataLayer('chat_end', { chat_mode: chatMode });
};

/**
 * Track user skipping to next stranger
 */
export const trackSkipNext = (chatMode: string): void => {
  pushToDataLayer('skip_next', { chat_mode: chatMode });
};

/**
 * Track text message sent
 */
export const trackSendMessage = (chatMode: string): void => {
  pushToDataLayer('send_message', { chat_mode: chatMode });
};

/**
 * Track page view / navigation
 */
export const trackPageView = (path: string, title?: string): void => {
  pushToDataLayer('page_view', {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track settings update
 */
export const trackSettingsChange = (setting: string, value: unknown): void => {
  pushToDataLayer('settings_change', {
    setting_name: setting,
    setting_value: value,
  });
};
