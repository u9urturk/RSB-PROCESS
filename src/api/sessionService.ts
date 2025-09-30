import { apiGet, apiPost } from './httpClient';
import { BackendSessionData, SessionData } from '@/types/websocket';

// Backend verisini frontend formatına çevir
const transformBackendSessionData = (backendData: BackendSessionData, currentUserId?: string): SessionData => {
  // Device info'yu formatla
  const deviceInfo = `${backendData.device} - ${backendData.browser} (${backendData.os})`;
  
  // Last activity olarak createdAt kullan (backend'de lastActivity yoksa)
  const lastActivity = backendData.createdAt;
  
  return {
    sessionId: backendData.id,
    userId: currentUserId || 'unknown', // Auth context'ten alınabilir
    deviceInfo,
    lastActivity,
    current: backendData.isCurrent,
    browser: backendData.browser,
    os: backendData.os,
    device: backendData.device,
    ip: backendData.ip,
    createdAt: backendData.createdAt,
    expiresAt: backendData.expiresAt,
    status: backendData.status,
    revokedReason: backendData.revokedReason || undefined
  };
};

class SessionApiService {
  // Tüm aktif session'ları getir
  async getSessions(): Promise<SessionData[]> {
    try {
      // Backend'den direkt array geliyor, wrapped response değil
      const backendSessions = await apiGet<BackendSessionData[]>('/profile/me/sessions');
      console.log('Fetched sessions:', backendSessions);
      
      // Backend verilerini frontend formatına çevir
      const transformedSessions = (backendSessions || []).map(session => 
        transformBackendSessionData(session)
      );
      
      return transformedSessions;
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  }

  // Belirli bir session'ı iptal et
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiPost(`/profile/me/sessions/${sessionId}`);
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  }

  // Diğer tüm session'ları iptal et (mevcut hariç)
  async revokeAllOtherSessions(): Promise<void> {
    try {
      await apiPost('/profile/me/sessions');
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
      throw error;
    }
  }
}

export const sessionApiService = new SessionApiService();

// Utility fonksiyonlarını export et
export { transformBackendSessionData };