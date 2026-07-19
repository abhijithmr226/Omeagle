import { Server } from 'socket.io';
import { CONFIG, logInfo } from './utils.js';
import { getPartnerId, destroyRoom, getPartnerRoom } from './rooms.js';
import { destroyMatch, getMatch } from './matchmaking.js';
import { registerSignaling } from './signaling.js';
import { checkRateLimit, cleanupRateLimit, sanitizeText, isSpam } from './rateLimit.js';

const socketToUser = new Map();
const peerTimers = new Map();
const typingTimers = new Map();

function clearPeerTimeout(socketId) {
  const timer = peerTimers.get(socketId);
  if (timer) { clearTimeout(timer); peerTimers.delete(socketId); }
}

function clearTypingTimeout(socketId) {
  const timer = typingTimers.get(socketId);
  if (timer) { clearTimeout(timer); typingTimers.delete(socketId); }
}

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['polling', 'websocket'],
    pingTimeout: CONFIG.PING_TIMEOUT,
    pingInterval: CONFIG.PING_INTERVAL,
  });

  io.on('connection', (socket) => {
    logInfo('SOCKET_CONNECTED', socket.id);
    io.emit('online-count', io.engine.clientsCount);

    socket.on('register', ({ userId }) => {
      socketToUser.set(socket.id, userId);
      logInfo('REGISTER', `${socket.id} -> ${userId}`);
    });

    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      logInfo('JOIN_ROOM', `${socket.id} -> ${roomId}`);
    });

    registerSignaling(socket);

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

    socket.on('skip', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const match = destroyMatch(userId);
        if (match) {
          const partnerSocketId = findSocketByUserId(match.partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('stranger-disconnected');
          }
        }
      }
      cleanupSocketRoom(socket);
      logInfo('SKIP', socket.id);
    });

    socket.on('stop', () => {
      const userId = socketToUser.get(socket.id);
      if (userId) {
        const match = destroyMatch(userId);
        if (match) {
          const partnerSocketId = findSocketByUserId(match.partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('stranger-disconnected');
          }
        }
      }
      cleanupSocketRoom(socket);
      logInfo('STOP', socket.id);
    });

    socket.on('disconnect', () => {
      clearPeerTimeout(socket.id);
      clearTypingTimeout(socket.id);
      cleanupRateLimit(socket.id);

      const userId = socketToUser.get(socket.id);
      if (userId) {
        const match = destroyMatch(userId);
        if (match) {
          const partnerSocketId = findSocketByUserId(match.partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('stranger-disconnected');
          }
        }
      }
      cleanupSocketRoom(socket);
      socketToUser.delete(socket.id);
      io.emit('online-count', io.engine.clientsCount);
      logInfo('SOCKET_DISCONNECT', socket.id);
    });
  });

  function findSocketByUserId(userId) {
    for (const [socketId, uid] of socketToUser) {
      if (uid === userId) return socketId;
    }
    return null;
  }

  function cleanupSocketRoom(socket) {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
  }

  return io;
}
