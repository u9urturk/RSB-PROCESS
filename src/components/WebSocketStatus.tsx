import { useWebSocketContext } from '@/context/provider/WebSocketProvider';

interface WebSocketStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function WebSocketStatus({ className = "", showDetails = false }: WebSocketStatusProps) {
  const { connected, error, reconnectAttempts, clearError } = useWebSocketContext();

  const getStatusColor = () => {
    if (error) return 'text-red-500';
    if (connected) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (error) return 'Hata';
    if (connected) return 'Bağlı';
    return reconnectAttempts > 0 ? 'Yeniden bağlanıyor...' : 'Bağlanıyor...';
  };

  const getStatusIcon = () => {
    if (error) return '🔴';
    if (connected) return '🟢';
    return '🟡';
  };

  return (
    <div className={`websocket-status ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{getStatusIcon()}</span>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {showDetails && (
          <div className="text-xs text-gray-500">
            {reconnectAttempts > 0 && (
              <span>({reconnectAttempts}/5 deneme)</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800 ml-2"
              title="Hatayı temizle"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}