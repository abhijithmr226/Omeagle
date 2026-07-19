import crypto from 'crypto';
import { logInfo } from './utils.js';

const queues = { video: [], text: [] };
const pendingMatches = new Map();

export function joinQueue(userId, mode) {
  if (!queues[mode]) return false;
  if (queues[mode].some(e => e.userId === userId)) return false;
  queues[mode].push({ userId, joinedAt: Date.now() });
  return true;
}

export function leaveQueue(userId) {
  for (const mode of Object.keys(queues)) {
    queues[mode] = queues[mode].filter(e => e.userId !== userId);
  }
}

export function findAndMatch(userId, mode) {
  if (!queues[mode]) return null;

  queues[mode] = queues[mode].filter(e => e.userId !== userId);

  while (queues[mode].length > 0) {
    const candidate = queues[mode].shift();
    if (candidate.userId !== userId) {
      const channel = crypto.randomUUID();
      pendingMatches.set(userId, { channel, partnerId: candidate.userId, initiator: true });
      pendingMatches.set(candidate.userId, { channel, partnerId: userId, initiator: false });
      return { channel, partnerId: candidate.userId, initiator: true };
    }
  }
  return null;
}

export function getMatch(userId) {
  return pendingMatches.get(userId) || null;
}

export function destroyMatch(userId) {
  const match = pendingMatches.get(userId);
  if (match) {
    pendingMatches.delete(userId);
    pendingMatches.delete(match.partnerId);
    return match;
  }
  return null;
}

export function getQueueLength(mode) {
  return queues[mode] ? queues[mode].length : 0;
}

export function cleanupStaleEntries(maxAge = 30000) {
  const now = Date.now();
  for (const mode of Object.keys(queues)) {
    queues[mode] = queues[mode].filter(e => now - e.joinedAt < maxAge);
  }
}
