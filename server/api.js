import { Router } from 'express';
import { joinQueue, leaveQueue, findAndMatch, getMatch, destroyMatch, getQueueLength } from './matchmaking.js';
import { logInfo } from './utils.js';

export const api = Router();

api.post('/matching-queue', (req, res) => {
  const { mode, userId } = req.body;
  if (!userId || !['video', 'text'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode or userId' });
  }

  const existing = getMatch(userId);
  if (existing) {
    return res.json({ status: 'matched', channel: existing.channel, partnerId: existing.partnerId, initiator: existing.initiator });
  }

  const match = findAndMatch(userId, mode);
  if (match) {
    logInfo('HTTP_MATCH', `${userId} <-> ${match.partnerId} | mode=${mode}`);
    return res.json({ status: 'matched', channel: match.channel, partnerId: match.partnerId, initiator: match.initiator });
  }

  joinQueue(userId, mode);
  logInfo('HTTP_ENQUEUE', `${userId} | mode=${mode} | queue=${getQueueLength(mode)}`);
  return res.json({ status: 'waiting' });
});

api.get('/matching-queue', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const match = getMatch(userId);
  if (match) {
    return res.json({ status: 'matched', channel: match.channel, partnerId: match.partnerId, initiator: match.initiator });
  }

  return res.json({ status: 'waiting' });
});

api.delete('/matching-queue', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  destroyMatch(userId);
  leaveQueue(userId);
  logInfo('HTTP_LEAVE', `${userId}`);
  return res.json({ status: 'left' });
});

api.get('/online-count', (_req, res) => {
  return res.json({ count: global.__onlineCount || 1 });
});
