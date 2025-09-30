import { useSessionList } from '@/customHook/useSessionList';
import { useSessionActions } from '@/customHook/useSessionActions';
import { SessionItem } from './SessionItem';

export function SessionList() {
  const { 
    sessions, 
    currentSession,
    otherSessions,
    loading, 
    error, 
    refreshSessions,
    clearError
  } = useSessionList();
  
  const { 
    safeRevokeAllOtherSessions,
    hasOtherSessions
  } = useSessionActions();

  const handleRevokeAllOthers = async () => {
    const success = await safeRevokeAllOtherSessions();
    if (success) {
      // Session listesini yenile
      refreshSessions();
    }
  };

  const handleRefresh = () => {
    refreshSessions();
    clearError();
  };

  if (loading) {
    return (
      <div className="session-list p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Oturumlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-list p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Hata</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <div className="ml-auto">
              <button 
                onClick={handleRefresh}
                className="text-red-800 hover:text-red-900 text-sm font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-list p-6">
      {/* Header */}
      <div className="session-list-header flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Aktif Oturumlar ({sessions.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Hesabınıza giriş yapılmış tüm cihazları görüntüleyin ve yönetin
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            🔄 Yenile
          </button>
          
          {hasOtherSessions && (
            <button 
              onClick={handleRevokeAllOthers}
              className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
            >
              Diğer Tüm Oturumları Kapat ({otherSessions.length})
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="session-list-items">
        {sessions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Oturum bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">Herhangi bir aktif oturum görünmüyor.</p>
          </div>
        ) : (
          <>
            {/* Current Session */}
            {currentSession && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mevcut Oturum</h4>
                <SessionItem
                  key={currentSession.sessionId}
                  session={currentSession}
                />
              </div>
            )}

            {/* Other Sessions */}
            {otherSessions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Diğer Oturumlar</h4>
                {otherSessions.map(session => (
                  <SessionItem
                    key={session.sessionId}
                    session={session}
                    onRevoke={refreshSessions}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Info Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Güvenlik için, tanımadığınız cihazlardaki oturumları kapatmanız önerilir. 
              Şüpheli aktivite fark ederseniz tüm diğer oturumları kapatabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}