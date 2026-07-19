import { logInfo } from './utils.js';

export function cleanupSocketRoom(socket) {
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      socket.leave(room);
    }
  }
}
