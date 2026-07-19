import { generateRoomId, logInfo } from './utils.js';

const rooms = new Map();

export function createRoom(socket1, socket2) {
  const roomId = generateRoomId();
  const room = {
    id: roomId,
    user1: socket1.id,
    user2: socket2.id,
    createdAt: Date.now(),
  };
  rooms.set(roomId, room);
  socket1.join(roomId);
  socket2.join(roomId);
  logInfo('ROOM_CREATED', `${roomId} | ${socket1.id} <-> ${socket2.id}`);
  return room;
}

export function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

export function getPartnerRoom(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.user1 === socketId || room.user2 === socketId) {
      return room;
    }
  }
  return null;
}

export function getPartnerId(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return room.user1 === socketId ? room.user2 : room.user1;
}

export function destroyRoom(roomId) {
  const room = rooms.get(roomId);
  if (room) {
    logInfo('ROOM_DESTROYED', roomId);
    rooms.delete(roomId);
  }
  return room;
}

export function destroyAllRoomsFor(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.user1 === socketId || room.user2 === socketId) {
      rooms.delete(roomId);
      return room;
    }
  }
  return null;
}

export function getRoomCount() {
  return rooms.size;
}
