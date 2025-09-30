import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket as useWebSocketHook } from '@/customHook/useWebSocket';

interface WebSocketContextType {
  connected: boolean;
  error: string | null;
  clearError: () => void;
  reconnectAttempts: number;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const webSocketState = useWebSocketHook();

  return (
    <WebSocketContext.Provider value={webSocketState}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};