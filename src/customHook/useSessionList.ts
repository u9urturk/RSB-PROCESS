import { useState, useEffect, useCallback } from 'react';
import { SessionData } from '@/types/websocket';
import { sessionApiService } from '@/api/sessionService';

export function useSessionList() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionsData = await sessionApiService.getSessions();
      setSessions(sessionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      await sessionApiService.revokeSession(sessionId);
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      
      console.log(`Session ${sessionId} revoked successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke session';
      setError(errorMessage);
      console.error('Failed to revoke session:', err);
      throw err; // Re-throw to allow UI to handle the error
    }
  }, []);

  const revokeAllOtherSessions = useCallback(async () => {
    try {
      await sessionApiService.revokeAllOtherSessions();
      
      // Keep only current session in local state
      setSessions(prev => prev.filter(s => s.current));
      
      console.log('All other sessions revoked successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke other sessions';
      setError(errorMessage);
      console.error('Failed to revoke other sessions:', err);
      throw err; // Re-throw to allow UI to handle the error
    }
  }, []);

  // İlk yüklemede session'ları getir
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Session sayıları
  const currentSession = sessions.find(s => s.current);
  const otherSessions = sessions.filter(s => !s.current);

  return {
    sessions,
    currentSession,
    otherSessions,
    loading,
    error,
    refreshSessions: fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
    clearError
  };
}