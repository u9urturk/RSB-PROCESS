import { io, Socket } from 'socket.io-client';
import { WebSocketEvents, WebSocketStatus } from '@/types/websocket';

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentToken: string | null = null;
  
  connect(token: string) {
    // Eğer zaten aynı token ile bağlantı varsa, mevcut socket'i döndür
    if (this.socket?.connected && this.currentToken === token) {
      return this.socket;
    }

    // Önceki bağlantıyı kapat
    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      path: '/ws',
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
    });
  }

  on<T extends keyof WebSocketEvents>(event: T, callback: WebSocketEvents[T]) {
    this.socket?.on(event as string, callback as any);
  }

  off<T extends keyof WebSocketEvents>(event: T, callback?: WebSocketEvents[T]) {
    this.socket?.off(event as string, callback as any);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentToken = null;
    this.reconnectAttempts = 0;
  }

  getStatus(): WebSocketStatus {
    return {
      connected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Token değiştiğinde yeniden bağlan
  updateToken(newToken: string) {
    if (this.currentToken !== newToken) {
      this.disconnect();
      this.connect(newToken);
    }
  }
}

export const websocketManager = new WebSocketManager();