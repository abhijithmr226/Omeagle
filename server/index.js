import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.static(join(__dirname, '..', 'dist')));

const waitingUsers = new Map();
const activeRooms = new Map();
const roomUsers = new Map();

let onlineCount = 120 + Math.floor(Math.random() * 40);
let smoothTarget = onlineCount;

setInterval(() => {
  if (Math.random() < 0.3) {
    smoothTarget += Math.floor(Math.random() * 11) - 5;
    smoothTarget = Math.max(30, smoothTarget);
  }
  const diff = smoothTarget - onlineCount;
  onlineCount += Math.sign(diff) * Math.max(1, Math.floor(Math.abs(diff) * 0.2));
  onlineCount = Math.max(30, onlineCount);
  io.emit('online-count', onlineCount);
}, 3000);

function createRoom(s1, s2) {
  const roomId = `room_${s1.id}_${s2.id}_${Date.now()}`;
  activeRooms.set(s1.id, roomId);
  activeRooms.set(s2.id, roomId);
  roomUsers.set(roomId, [s1.id, s2.id]);
  return roomId;
}

function findMatch(socket, mode) {
  for (const [waitingId, waitingMode] of waitingUsers) {
    if (waitingId === socket.id) continue;
    if (waitingMode !== mode) continue;
    const waitingSocket = io.sockets.sockets.get(waitingId);
    if (!waitingSocket) { waitingUsers.delete(waitingId); continue; }
    waitingUsers.delete(waitingId);
    return waitingSocket;
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  io.emit('online-count', onlineCount);

  socket.on('find-stranger', ({ mode }) => {
    const matchedSocket = findMatch(socket, mode);
    if (matchedSocket) {
      const roomId = createRoom(socket, matchedSocket);
      socket.emit('stranger-found', { roomId, initiator: true });
      matchedSocket.emit('stranger-found', { roomId, initiator: false });
      socket.join(roomId);
      matchedSocket.join(roomId);
    } else {
      waitingUsers.set(socket.id, mode);
      socket.emit('waiting');
    }
  });

  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', { offer, from: socket.id }));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', { answer, from: socket.id }));
  socket.on('ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id }));

  socket.on('send-message', ({ roomId, text }) => {
    socket.to(roomId).emit('receive-message', { text, from: socket.id });
  });

  function cleanup(s) {
    const roomId = activeRooms.get(s.id);
    if (roomId) {
      s.to(roomId).emit('stranger-disconnected');
      const users = roomUsers.get(roomId);
      if (users) {
        users.forEach(id => {
          const sc = io.sockets.sockets.get(id);
          if (sc) sc.leave(roomId);
          activeRooms.delete(id);
        });
        roomUsers.delete(roomId);
      }
    }
    waitingUsers.delete(s.id);
  }

  socket.on('stop', () => cleanup(socket));
  socket.on('skip', () => cleanup(socket));

  socket.on('disconnect', () => {
    cleanup(socket);
    io.emit('online-count', onlineCount);
  });
});

app.get('/{*splat}', (req, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`));
