import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CONFIG, logInfo } from './utils.js';
import { createSocketServer } from './socket.js';
import { api } from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use('/api', api);

const io = createSocketServer(httpServer);

setInterval(() => { global.__onlineCount = io.engine.clientsCount || 1; }, 2000);

app.use(express.static(join(__dirname, '..', 'dist')));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/{*splat}', (_req, res) => res.sendFile(join(__dirname, '..', 'dist', 'index.html')));

httpServer.listen(CONFIG.PORT, () => logInfo('SERVER_START', `port=${CONFIG.PORT}`));
