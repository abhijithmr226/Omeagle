import crypto from 'crypto';

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3001),
  TIMEOUT_MS: Number(process.env.TIMEOUT_MS ?? 20000),
  MAX_MSG_LENGTH: 2000,
  RATE_LIMIT_WINDOW_MS: 5000,
  RATE_LIMIT_MAX: 10,
  PING_TIMEOUT: 20000,
  PING_INTERVAL: 10000,
};

export function generateRoomId(): string {
  return crypto.randomUUID();
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: '\x1b[36m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
};
const RESET = '\x1b[0m';

function log(level: LogLevel, event: string, data?: string): void {
  const ts = new Date().toISOString().slice(11, 23);
  const color = LEVEL_COLORS[level];
  console.log(`${color}[${ts}] [${level}]${RESET} ${event}${data ? ` | ${data}` : ''}`);
}

export const logInfo = (event: string, data?: string) => log('INFO', event, data);
export const logWarn = (event: string, data?: string) => log('WARN', event, data);
export const logError = (event: string, data?: string) => log('ERROR', event, data);
