import { CONFIG, logInfo, logWarn, logError } from './utils.js';

const rateLimitStore = new Map();

export function checkRateLimit(socketId) {
  const now = Date.now();
  const record = rateLimitStore.get(socketId);

  if (!record || now - record.windowStart > CONFIG.RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(socketId, { windowStart: now, count: 1 });
    return true;
  }

  record.count++;
  if (record.count > CONFIG.RATE_LIMIT_MAX) {
    logWarn('RATE_LIMITED', socketId);
    return false;
  }
  return true;
}

export function cleanupRateLimit(socketId) {
  rateLimitStore.delete(socketId);
}

export function getMessageLength(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().length;
}

export function isSpam(text) {
  if (!text) return false;
  const repeated = /(.)\1{20,}/;
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  return repeated.test(text) || urlCount > 3;
}

export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.trim().slice(0, CONFIG.MAX_MSG_LENGTH);
}
