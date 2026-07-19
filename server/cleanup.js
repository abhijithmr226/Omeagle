import { getPartnerRoom, getPartnerId, destroyRoom } from './rooms.js';
import { dequeueAll, enqueue } from './matchmaking.js';
import { logInfo } from './utils.js';

export function cleanupAndDisconnect(socket) {
  const room = getPartnerRoom(socket.id);
  if (room) {
    const partnerId = getPartnerId(room.id, socket.id);
    if (partnerId) {
      socket.to(room.id).emit('stranger-disconnected');
      const partnerSocket = socket.server.sockets.sockets.get(partnerId);
      if (partnerSocket) partnerSocket.leave(room.id);
    }
    destroyRoom(room.id);
  }
  dequeueAll(socket);
  logInfo('CLEANUP_DISCONNECT', socket.id);
}

export function cleanupAndSkip(socket, io) {
  const room = getPartnerRoom(socket.id);
  if (room) {
    const partnerId = getPartnerId(room.id, socket.id);
    socket.leave(room.id);
    destroyRoom(room.id);
    dequeueAll(socket);

    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('stranger-disconnected');
        partnerSocket.leave(room.id);
        logInfo('SKIP_PARTNER_QUEUED', `${partnerId} (from ${socket.id})`);
      }
    }

    logInfo('SKIP', socket.id);
  } else {
    dequeueAll(socket);
  }
}

export function cleanupAndStop(socket) {
  const room = getPartnerRoom(socket.id);
  if (room) {
    const partnerId = getPartnerId(room.id, socket.id);
    if (partnerId) {
      socket.to(room.id).emit('stranger-disconnected');
      const partnerSocket = socket.server.sockets.sockets.get(partnerId);
      if (partnerSocket) partnerSocket.leave(room.id);
    }
    destroyRoom(room.id);
  }
  dequeueAll(socket);
  logInfo('STOP', socket.id);
}

export function cleanupAndDisconnectSocket(socket, io) {
  const room = getPartnerRoom(socket.id);
  if (room) {
    const partnerId = getPartnerId(room.id, socket.id);
    socket.leave(room.id);
    destroyRoom(room.id);

    if (partnerId) {
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partnerSocket.emit('stranger-disconnected');
        partnerSocket.leave(room.id);
        logInfo('DISCONNECT_PARTNER_QUEUED', partnerId);
      }
    }
  }
  dequeueAll(socket);
  logInfo('DISCONNECT', socket.id);
}
