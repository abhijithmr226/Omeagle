import { Server } from 'socket.io';
import { CONFIG, logInfo } from './utils.js';
import { createRoom, getRoom, destroyRoom, getPartnerId, destroyAllRoomsFor } from './rooms.js';
import { enqueue, findMatch, dequeueAll } from './matchmaking.js';
import { registerSignaling } from './signaling.js';
import { cleanupAndDisconnect, cleanupAndSkip, cleanupAndStop, cleanupAndDisconnectSocket } from './cleanup.js';
import { checkRateLimit, cleanupRateLimit, getMessageLength, isSpam, sanitizeText } from './rateLimit.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket'],
    pingTimeout: CONFIG.PING_TIMEOUT,
    pingInterval: CONFIG.PING_INTERVAL,
  });

  const peerTimers = new Map();
  const typingTimers = new Map();

  function startPeerTimeout(socket, partnerSocket) {
    clearTimeout(peerTimers.get(socket.id));
    clearTimeout(peerTimers.get(partnerSocket.id));

    peerTimers.set(socket.id, setTimeout(() => {
      logInfo('TIMEOUT', `${socket.id} (no answer)`);
      socket.emit('stranger-timeout');
      cleanupAndDisconnectSocket(socket, io);
    }, CONFIG.TIMEOUT_MS));

    peerTimers.set(partnerSocket.id, setTimeout(() => {
      logInfo('TIMEOUT', `${partnerSocket.id} (no answer)`);
      partnerSocket.emit('stranger-timeout');
      cleanupAndDisconnectSocket(partnerSocket, io);
    }, CONFIG.TIMEOUT_MS));
  }

  function clearPeerTimeout(socketId) {
    const timer = peerTimers.get(socketId);
    if (timer) {
      clearTimeout(timer);
      peerTimers.delete(socketId);
    }
  }

  function clearTypingTimeout(socketId) {
    const timer = typingTimers.get(socketId);
    if (timer) {
      clearTimeout(timer);
      typingTimers.delete(socketId);
    }
  }

  io.on('connection', (socket) => {
    logInfo('CONNECTED', socket.id);
    io.emit('online-count', io.engine.clientsCount);

    registerSignaling(socket);

    socket.on('find-stranger', ({ mode }) => {
      cleanupAndDisconnect(socket);
      const matched = findMatch(socket, mode, io);
      if (matched) {
        const room = createRoom(socket, matched);
        socket.emit('stranger-found', { roomId: room.id, initiator: true });
        matched.emit('stranger-found', { roomId: room.id, initiator: false });
        startPeerTimeout(socket, matched);
      } else {
        enqueue(socket, mode);
        socket.emit('waiting');
      }
    });

    socket.on('send-message', ({ roomId, text }) => {
      if (!checkRateLimit(socket.id)) return;
      const clean = sanitizeText(text);
      if (!clean || isSpam(clean)) return;
      socket.to(roomId).emit('receive-message', { text: clean, from: socket.id });
    });

    socket.on('message-sent', ({ roomId }) => {
      clearPeerTimeout(socket.id);
      const partnerId = getPartnerId(roomId, socket.id);
      if (partnerId) clearPeerTimeout(partnerId);
    });

    socket.on('typing', ({ roomId }) => {
      if (!checkRateLimit(socket.id)) return;
      socket.to(roomId).emit('typing', { from: socket.id });
      clearTypingTimeout(socket.id);
      typingTimers.set(socket.id, setTimeout(() => {
        socket.to(roomId).emit('stop-typing', { from: socket.id });
        typingTimers.delete(socket.id);
      }, 3000));
    });

    socket.on('stop-typing', ({ roomId }) => {
      clearTypingTimeout(socket.id);
      socket.to(roomId).emit('stop-typing', { from: socket.id });
    });

    socket.on('stop', () => {
      clearPeerTimeout(socket.id);
      cleanupAndStop(socket);
    });

    socket.on('skip', () => {
      clearPeerTimeout(socket.id);
      cleanupAndSkip(socket, io);
    });

    socket.on('disconnect', () => {
      clearPeerTimeout(socket.id);
      clearTypingTimeout(socket.id);
      cleanupRateLimit(socket.id);
      cleanupAndDisconnectSocket(socket, io);
      io.emit('online-count', io.engine.clientsCount);
      logInfo('DISCONNECT', socket.id);
    });
  });

  return io;
}
