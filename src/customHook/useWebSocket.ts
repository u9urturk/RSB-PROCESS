import { useEffect, useState, useCallback } from 'react';
import { websocketManager } from '@/services/websocket';
import { useAuth } from '@/context/provider/AuthProvider';
import { useNotification } from '@/context/provider/NotificationProvider';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, logout, user, isManualLogout } = useAuth();
  const { showNotification } = useNotification();

  // Session revoked handler
  const handleSessionRevoked = useCallback((data: any) => {
    console.log('Session revoked:', data);
    
    // Eğer iptal edilen session mevcut kullanıcının session'ı ise logout yap
    if (data.sessionId === user?.sessionId) {
      // Manuel logout kontrolü - eğer kullanıcı kendisi logout yaptıysa notification gösterme
      if (!isManualLogout()) {
        // 5 saniyeli geri sayım ile logout notification'ı göster
        showNotification('warning', 'Oturumunuz başka bir yerden sonlandırıldı! Giriş sayfasına yönlendiriliyorsunuz...', {
          countdown: 5,
          onComplete: logout
        });
      } else {
        // Manuel logout durumunda sadece logout işlemini gerçekleştir
        console.log('Manual logout detected, skipping notification');
      }
    } else {
      // Başka bir session iptal edildi, sadece bilgi ver
      showNotification('info', 'Bir oturumunuz sonlandırıldı');
      console.info('Bir oturumunuz sonlandırıldı');
    }
  }, [user?.sessionId, logout, showNotification, isManualLogout]);

  // Auth error handler  
  const handleAuthError = useCallback((data: any) => {
    console.error('WebSocket auth error:', data);
    setError(data.message);
    
    // Auth hatası durumunda da geri sayım ile logout
    showNotification('error', 'Kimlik doğrulama hatası! Giriş sayfasına yönlendiriliyorsunuz...', {
      countdown: 3,
      onComplete: logout
    });
  }, [logout, showNotification]);

  // Rate limit handler
  const handleRateLimited = useCallback((data: any) => {
    console.warn('WebSocket rate limited:', data);
    setError(`Rate limited: ${data.reason}`);
    
    // Rate limit uyarısı göster
    showNotification('warning', `Rate limit aşıldı: ${data.reason}. Lütfen bir süre bekleyin.`);
  }, [showNotification]);

  useEffect(() => {
    if (!accessToken) {
      websocketManager.disconnect();
      setConnected(false);
      setError(null);
      return;
    }

    const socket = websocketManager.connect(accessToken);
    
    const handleConnect = () => {
      setConnected(true);
      setError(null);
      // WebSocket bağlantısı sessizce kurulur, notification gereksiz
      console.log('✅ WebSocket connected successfully');
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    // Event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    // Custom events
    websocketManager.on('auth_error', handleAuthError);
    websocketManager.on('session_revoked', handleSessionRevoked);
    websocketManager.on('rate_limited', handleRateLimited);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      websocketManager.off('auth_error', handleAuthError);
      websocketManager.off('session_revoked', handleSessionRevoked);
      websocketManager.off('rate_limited', handleRateLimited);
    };
  }, [accessToken, handleAuthError, handleSessionRevoked, handleRateLimited]);

  // Token değiştiğinde WebSocket'i güncelle
  useEffect(() => {
    if (accessToken && websocketManager.isConnected()) {
      websocketManager.updateToken(accessToken);
    }
  }, [accessToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { 
    connected, 
    error, 
    clearError,
    reconnectAttempts: websocketManager.getStatus().reconnectAttempts
  };

}