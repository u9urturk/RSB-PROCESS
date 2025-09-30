export interface WebSocketEvents {
  session_revoked: (data: { type: 'session_revoked', sessionId: string, reason: string }) => void;
  auth_error: (data: { type: 'auth_error', message: string }) => void;
  rate_limited: (data: { type: 'rate_limited', reason: string, limit: number }) => void;
}

export interface BackendSessionData {
  id: string;
  createdAt: string;
  expiresAt: string;
  ip: string;
  userAgent: string;
  revokedAt: string | null;
  revokedReason: string | null;
  browser: string;
  os: string;
  device: string;
  isCurrent: boolean;
  status: 'active' | 'revoked' | 'expired';
}

// Frontend'de kullanacağımız normalize edilmiş session data
export interface SessionData {
  sessionId: string;
  userId: string;
  deviceInfo: string;
  lastActivity: string;
  current: boolean;
  // Ek detaylar
  browser: string;
  os: string;
  device: string;
  ip: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked' | 'expired';
  revokedReason?: string;
}

export interface WebSocketStatus {
  connected: boolean;
  reconnectAttempts: number;
}