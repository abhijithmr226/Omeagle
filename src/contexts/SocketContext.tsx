import React, { createContext, useContext } from 'react';
import { getSocket } from '../services/socket';
import type { TypedSocket } from '../services/socket';

const SocketContext = createContext<TypedSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = getSocket();
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): TypedSocket {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocketContext must be used within SocketProvider');
  return ctx;
}
