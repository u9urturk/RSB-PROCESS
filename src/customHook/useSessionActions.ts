import { useCallback } from 'react';
import { useSessionList } from './useSessionList';
import { SessionData } from '@/types/websocket';

export function useSessionActions() {
  const { 
    revokeSession, 
    revokeAllOtherSessions, 
    refreshSessions,
    otherSessions,
    error,
    clearError
  } = useSessionList();

  // Güvenli session iptal etme (confirmation ile)
  const safeRevokeSession = useCallback(async (sessionId: string, deviceInfo?: string) => {
    const confirmed = window.confirm(
      `"${deviceInfo || 'Bilinmeyen Cihaz'}" oturumunu sonlandırmak istediğinizden emin misiniz?`
    );
    
    if (confirmed) {
      try {
        await revokeSession(sessionId);
        return true;
      } catch (error) {
        console.error('Session revoke failed:', error);
        return false;
      }
    }
    return false;
  }, [revokeSession]);

  // Güvenli toplu session iptal etme
  const safeRevokeAllOtherSessions = useCallback(async () => {
    if (otherSessions.length === 0) {
      alert('İptal edilecek başka oturum bulunmuyor.');
      return false;
    }

    const confirmed = window.confirm(
      `${otherSessions.length} adet diğer oturumu sonlandırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    );
    
    if (confirmed) {
      try {
        await revokeAllOtherSessions();
        return true;
      } catch (error) {
        console.error('Bulk session revoke failed:', error);
        return false;
      }
    }
    return false;
  }, [revokeAllOtherSessions, otherSessions.length]);

  // Gelişmiş session detaylarını formatla
  const formatSessionInfo = useCallback((session: SessionData) => {
    const createdDate = new Date(session.createdAt);
    const expiresDate = new Date(session.expiresAt);
    const now = new Date();
    
    // Cihaz adını formatla
    const deviceName = `${session.device} - ${session.browser}`;
    const fullDeviceInfo = `${session.device} - ${session.browser} (${session.os})`;
    
    // Son aktivite zamanını formatla
    const lastActivity = new Date(session.lastActivity).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Göreceli zaman
    const lastActivityRelative = getRelativeTime(new Date(session.lastActivity));
    
    // IP masking (güvenlik için)
    const maskedIp = maskIpAddress(session.ip);
    
    // Oturum durumu
    const isExpired = expiresDate < now;
    const isActive = session.status === 'active' && !isExpired;
    
    // Kalan süre
    const timeUntilExpiry = isExpired ? null : getTimeUntilExpiry(expiresDate);
    
    return {
      deviceName,
      fullDeviceInfo,
      lastActivity,
      lastActivityRelative,
      isCurrent: session.current,
      ip: maskedIp,
      browser: session.browser,
      os: session.os,
      device: session.device,
      isActive,
      isExpired,
      status: session.status,
      createdAt: createdDate.toLocaleString('tr-TR'),
      expiresAt: expiresDate.toLocaleString('tr-TR'),
      timeUntilExpiry,
      revokedReason: session.revokedReason
    };
  }, []);

  return {
    safeRevokeSession,
    safeRevokeAllOtherSessions,
    refreshSessions,
    formatSessionInfo,
    error,
    clearError,
    hasOtherSessions: otherSessions.length > 0
  };
}

// Göreceli zaman helper fonksiyonu
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 30) return `${diffDays} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}

// IP adresini maskleme fonksiyonu (güvenlik)
function maskIpAddress(ip: string): string {
  if (!ip) return 'Bilinmiyor';
  
  // IPv4 için
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
  }
  
  // IPv6 için (basit masklama)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length > 2) {
      return `${parts[0]}:${parts[1]}:***:***`;
    }
  }
  
  return ip; // Fallback
}

// Süre bitimini formatla
function getTimeUntilExpiry(expiresDate: Date): string {
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Süresi dolmuş';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} gün kaldı`;
  if (diffHours > 0) return `${diffHours} saat kaldı`;
  if (diffMins > 0) return `${diffMins} dakika kaldı`;
  
  return 'Az kaldı';
}