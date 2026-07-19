import { logInfo } from './utils.js';

const queues = { video: [], text: [] };

export function enqueue(socket, mode) {
  if (!queues[mode]) return;
  if (!queues[mode].includes(socket.id)) {
    queues[mode].push(socket.id);
    logInfo('ENQUEUE', `${socket.id} | mode=${mode} | queue=${queues[mode].length}`);
  }
}

export function dequeue(socket, mode) {
  if (!queues[mode]) return;
  const idx = queues[mode].indexOf(socket.id);
  if (idx !== -1) {
    queues[mode].splice(idx, 1);
  }
}

export function dequeueAll(socket) {
  for (const mode of Object.keys(queues)) {
    const idx = queues[mode].indexOf(socket.id);
    if (idx !== -1) queues[mode].splice(idx, 1);
  }
}

export function findMatch(socket, mode, io) {
  if (!queues[mode]) return null;
  const idx = queues[mode].indexOf(socket.id);
  if (idx !== -1) queues[mode].splice(idx, 1);

  while (queues[mode].length > 0) {
    const candidateId = queues[mode].shift();
    const candidateSocket = io.sockets.sockets.get(candidateId);
    if (candidateSocket && candidateSocket.id !== socket.id) {
      logInfo('MATCH_FOUND', `${socket.id} <-> ${candidateId} | mode=${mode}`);
      return candidateSocket;
    }
  }
  return null;
}

export function getQueueLength(mode) {
  return queues[mode] ? queues[mode].length : 0;
}
