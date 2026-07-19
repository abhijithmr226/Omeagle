import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

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

// === MODERATION SYSTEM ===
const REPORTS_FILE = join(__dirname, 'reports.json');
const BANS_FILE = join(__dirname, 'bans.json');

function loadJSON(file, fallback) {
  try { return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : fallback; }
  catch { return fallback; }
}
function saveJSON(file, data) {
  try { writeFileSync(file, JSON.stringify(data, null, 2)); } catch {}
}

let reports = loadJSON(REPORTS_FILE, []);
let bans = loadJSON(BANS_FILE, {}); // { ip: { until: timestamp, count: number } }

// Server-side blocked words
const BLOCKED_WORDS = [
  'nsfw', 'porn', 'xxx', 'sex cam', 'cam girl', 'send nudes', 'nude pic',
  'onlyfans', 'whatsapp me', 'telegram me', 'instagram me', 'snapchat me',
  'give me your phone', 'give me your address', 'give me your email',
  'meet me at', 'come to my house', 'come to my room',
];

function isMessageBlocked(text) {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(w => lower.includes(w));
}

function isIPBanned(ip) {
  const ban = bans[ip];
  if (!ban) return false;
  if (Date.now() > ban.until) { delete bans[ip]; saveJSON(BANS_FILE, bans); return false; }
  return true;
}

function banIP(ip, durationMs = 3600000) {
  const existing = bans[ip] || { count: 0 };
  // Escalating ban: each offense doubles duration
  const banDuration = durationMs * Math.pow(2, existing.count);
  bans[ip] = { until: Date.now() + banDuration, count: existing.count + 1 };
  saveJSON(BANS_FILE, bans);
}

// === ONLINE COUNT ===
function getBaseCount() {
  const hour = new Date().getHours();
  if (hour >= 14 && hour <= 2) return 180 + Math.floor(Math.random() * 80);
  if (hour >= 8 && hour < 14) return 120 + Math.floor(Math.random() * 60);
  return 60 + Math.floor(Math.random() * 50);
}

let onlineCount = getBaseCount();
let smoothTarget = onlineCount;

setInterval(() => {
  if (Math.random() < 0.3) {
    const change = Math.floor(Math.random() * 21) - 10;
    smoothTarget = Math.max(40, smoothTarget + change);
  }
  const diff = smoothTarget - onlineCount;
  onlineCount += Math.sign(diff) * Math.max(1, Math.floor(Math.abs(diff) * 0.2));
  onlineCount += Math.floor(Math.random() * 5) - 2;
  onlineCount = Math.max(40, onlineCount);
  io.emit('online-count', onlineCount);
}, 3000);

function getOnlineCount() { return onlineCount; }

// === MATCHING ===
function createRoom(s1, s2) {
  const roomId = `room_${s1.id}_${s2.id}_${Date.now()}`;
  activeRooms.set(s1.id, roomId);
  activeRooms.set(s2.id, roomId);
  roomUsers.set(roomId, [s1.id, s2.id]);
  return roomId;
}

function findMatch(socket, mode, interests = [], language = '', country = '') {
  for (const [waitingId, waitingData] of waitingUsers) {
    if (waitingId === socket.id) continue;
    if (waitingData.mode !== mode) continue;
    if (language && waitingData.language && waitingData.language !== language) continue;
    if (country && waitingData.country && waitingData.country !== country) continue;
    if (waitingData.interests.length > 0 && interests.length > 0) {
      const hasOverlap = waitingData.interests.some(i => interests.includes(i));
      if (!hasOverlap) continue;
    }
    const waitingSocket = io.sockets.sockets.get(waitingId);
    if (!waitingSocket) { waitingUsers.delete(waitingId); continue; }
    waitingUsers.delete(waitingId);
    return waitingSocket;
  }
  return null;
}

// === SOCKET HANDLERS ===
io.on('connection', (socket) => {
  const clientIP = socket.handshake.address;
  console.log(`User connected: ${socket.id} [${clientIP}]`);

  // Check if IP is banned
  if (isIPBanned(clientIP)) {
    socket.emit('banned', { message: 'You have been temporarily banned due to rule violations.' });
    socket.disconnect();
    return;
  }

  io.emit('online-count', getOnlineCount());

  socket.on('find-stranger', ({ mode, interests = [], language = '', country = '' }) => {
    console.log(`${socket.id} looking for ${mode} stranger [lang: ${language}, country: ${country}]`);
    const matchedSocket = findMatch(socket, mode, interests, language, country);
    if (matchedSocket) {
      const roomId = createRoom(socket, matchedSocket);
      socket.emit('stranger-found', { roomId, initiator: true });
      matchedSocket.emit('stranger-found', { roomId, initiator: false });
      socket.join(roomId);
      matchedSocket.join(roomId);
      console.log(`Matched: ${socket.id} <-> ${matchedSocket.id}`);
    } else {
      waitingUsers.set(socket.id, { mode, interests, language, country });
      socket.emit('waiting');
    }
  });

  socket.on('offer', ({ roomId, offer }) => socket.to(roomId).emit('offer', { offer, from: socket.id }));
  socket.on('answer', ({ roomId, answer }) => socket.to(roomId).emit('answer', { answer, from: socket.id }));
  socket.on('ice-candidate', ({ roomId, candidate }) => socket.to(roomId).emit('ice-candidate', { candidate, from: socket.id }));

  // Server-side message filtering
  socket.on('send-message', ({ roomId, text }) => {
    if (isMessageBlocked(text)) {
      socket.emit('system-message', { text: 'Your message was blocked by the filter.' });
      return;
    }
    socket.to(roomId).emit('receive-message', { text, from: socket.id, timestamp: Date.now() });
  });

  // Report system
  socket.on('report', ({ roomId, reason }) => {
    const report = {
      id: Date.now().toString(),
      reporterId: socket.id,
      roomId,
      reason,
      ip: clientIP,
      timestamp: new Date().toISOString(),
    };
    reports.push(report);
    saveJSON(REPORTS_FILE, reports);
    console.log(`Report filed: ${socket.id} reported in ${roomId} — ${reason}`);

    // Check if reporter has filed 3+ reports — they might be abusing the system
    const reporterCount = reports.filter(r => r.reporterId === socket.id).length;
    if (reporterCount > 10) {
      console.log(`Reporter ${socket.id} has filed ${reporterCount} reports — possible abuse`);
    }

    // Auto-ban if a user receives 3+ reports in 1 hour
    const recentAgainstRoom = reports.filter(r =>
      r.roomId === roomId &&
      r.reporterId !== socket.id &&
      Date.now() - new Date(r.timestamp).getTime() < 3600000
    );
    if (recentAgainstRoom.length >= 3) {
      // Find the other user in the room and ban them
      const users = roomUsers.get(roomId);
      if (users) {
        const offenderId = users.find(id => id !== socket.id);
        if (offenderId) {
          banIP(clientIP, 3600000);
          const offenderSocket = io.sockets.sockets.get(offenderId);
          if (offenderSocket) {
            offenderSocket.emit('banned', { message: 'You have been temporarily banned due to multiple reports.' });
            offenderSocket.disconnect();
          }
        }
      }
    }

    socket.emit('report-acknowledged', { success: true });
  });

  function cleanup(s) {
    const roomId = activeRooms.get(s.id);
    if (roomId) {
      s.to(roomId).emit('stranger-disconnected');
      const users = roomUsers.get(roomId);
      if (users) {
        users.forEach(id => { const sc = io.sockets.sockets.get(id); if (sc) sc.leave(roomId); activeRooms.delete(id); });
        roomUsers.delete(roomId);
      }
    }
    waitingUsers.delete(s.id);
  }

  socket.on('stop', () => cleanup(socket));
  socket.on('skip', () => cleanup(socket));

  socket.on('disconnect', () => {
    cleanup(socket);
    io.emit('online-count', getOnlineCount());
  });
});

// API endpoint to view reports (admin use)
app.get('/api/reports', (req, res) => {
  res.json(reports.slice(-100).reverse());
});

app.get('/{*splat}', (req, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Server on port ${PORT}`));
