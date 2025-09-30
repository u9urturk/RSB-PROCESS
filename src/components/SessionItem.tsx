import { SessionData } from '@/types/websocket';
import { useSessionActions } from '@/customHook/useSessionActions';

interface SessionItemProps {
  session: SessionData;
  onRevoke?: () => void;
}

export function SessionItem({ session, onRevoke }: SessionItemProps) {
  const { formatSessionInfo, safeRevokeSession } = useSessionActions();
  const sessionInfo = formatSessionInfo(session);

  const handleRevoke = async () => {
    if (session.current) return; 
    
    const success = await safeRevokeSession(session.sessionId, sessionInfo.deviceName);
    if (success && onRevoke) {
      onRevoke();
    }
  };

  return (
    <div className={`session-item relative transition-all duration-200 hover:shadow-md ${session.current ? 'current' : ''} flex items-start justify-between p-5 border rounded-lg mb-3 ${
      session.current 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-blue-100 shadow-sm' 
        : sessionInfo.isActive 
          ? 'bg-white border-gray-200 hover:border-gray-300' 
          : 'bg-gray-50 border-gray-300'
    }`}>
      <div className="session-info flex-1 min-w-0">
        {/* Device Name & Status */}
        <div className="device-info flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Browser Icon */}
            <span className="text-lg">
              {getBrowserIcon(sessionInfo.browser)}
            </span>
            <span className="font-medium text-gray-900 truncate">
              {sessionInfo.deviceName}
            </span>
          </div>
          
          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {session.current && (
              <span className="current-badge px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Şu anki oturum
              </span>
            )}
            
            {!sessionInfo.isActive && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                {sessionInfo.isExpired ? 'Süresi dolmuş' : 'Pasif'}
              </span>
            )}
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-1 text-sm text-gray-600">
          {/* Last Activity */}
          <div className="flex items-center gap-4">
            <span>🕒 Son aktivite: </span>
            <span title={sessionInfo.lastActivity} className="font-medium">
              {sessionInfo.lastActivityRelative}
            </span>
          </div>
          
          {/* IP Address */}
          <div className="flex items-center gap-4">
            <span>🌐 IP: </span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {sessionInfo.ip}
            </span>
          </div>
          
          {/* OS Info */}
          <div className="flex items-center gap-4">
            <span>💻 Sistem: </span>
            <span>{sessionInfo.fullDeviceInfo}</span>
          </div>
          
          {/* Expiry Time */}
          {sessionInfo.timeUntilExpiry && (
            <div className="flex items-center gap-4">
              <span>⏰ </span>
              <span className={sessionInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                {sessionInfo.timeUntilExpiry}
              </span>
            </div>
          )}
          
          {/* Revoked Reason */}
          {sessionInfo.revokedReason && (
            <div className="flex items-center gap-4">
              <span>❌ İptal nedeni: </span>
              <span className="text-red-600">{sessionInfo.revokedReason}</span>
            </div>
          )}
        </div>

        {/* Session ID (collapsed by default) */}
        <div className="session-id text-xs text-gray-400 mt-2 font-mono">
          ID: {session.sessionId.slice(0, 12)}...
        </div>
      </div>
      
      {/* Action Button */}
      {!session.current && onRevoke && sessionInfo.isActive && (
        <button 
          onClick={handleRevoke}
          className="revoke-button ml-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 flex-shrink-0"
        >
          Oturumu Kapat
        </button>
      )}
    </div>
  );
}

// Browser icon helper
function getBrowserIcon(browser: string): string {
  const browserIcons: Record<string, string> = {
    Chrome: '🌐',
    Firefox: '🦊',
    Safari: '🧭',
    Edge: '🔷',
    Opera: '🎭',
    Internet: '📱', // Internet Explorer/Mobile
    default: '💻'
  };
  
  return browserIcons[browser] || browserIcons.default;
}
