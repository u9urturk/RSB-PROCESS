import { WebSocketStatus } from '@/components/WebSocketStatus';
import { SessionList } from '@/components/SessionList';
import { useWebSocketContext } from '@/context/provider/WebSocketProvider';
import { useNotification } from '@/context/provider/NotificationProvider';

export function WebSocketDemoPage() {
  const { connected } = useWebSocketContext();
  const { showNotification } = useNotification();

  // Test notification fonksiyonları
  const testSessionRevokedNotification = () => {
    showNotification('warning', 'Oturumunuz başka bir yerden sonlandırıldı! Giriş sayfasına yönlendiriliyorsunuz...', {
      countdown: 5,
      onComplete: () => {
        console.log('Session revoked notification completed!');
        showNotification('info', 'Bu sadece bir test - gerçek uygulamada giriş sayfasına yönlendirilirsiniz');
      }
    });
  };

  const testAuthErrorNotification = () => {
    showNotification('error', 'Kimlik doğrulama hatası! Giriş sayfasına yönlendiriliyorsunuz...', {
      countdown: 3,
      onComplete: () => {
        console.log('Auth error notification completed!');
        showNotification('info', 'Bu sadece bir test - gerçek uygulamada giriş sayfasına yönlendirilirsiniz');
      }
    });
  };

  const testInfoNotification = () => {
    showNotification('info', 'Bir oturumunuz sonlandırıldı');
  };

  const testSuccessNotification = () => {
    showNotification('success', 'WebSocket bağlantısı kuruldu');
  };

  return (
    <div className="websocket-demo-page min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WebSocket Session Yönetimi</h1>
              <p className="text-gray-600 mt-1">Aktif oturumlarınızı görüntüleyin ve yönetin</p>
            </div>
            <WebSocketStatus showDetails={true} />
          </div>
        </div>

        {/* Connection Status Banner */}
        {!connected && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  WebSocket bağlantısı kurulamadı. Bazı özellikler düzgün çalışmayabilir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <SessionList />
        </div>

        {/* Test Notifications Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading Bar Progress Notification Test</h3>
          <p className="text-sm text-gray-600 mb-4">
            WebSocket notification sistemini test etmek için aşağıdaki butonları kullanabilirsiniz. 
            Countdown notification'ları artık <strong>loading bar efekti</strong> ve <strong>circular progress</strong> ile geliştirildi:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-800 mb-1">Loading Bar Özellikleri:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Background gradient progress efekti</li>
                <li>• Circular progress indicator</li>
                <li>• Smooth 1 saniye geçiş animasyonları</li>
                <li>• Type-based color theming</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm text-gray-800 mb-1">Test Senaryoları:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Session Revoked: 5s countdown + warning</li>
                <li>• Auth Error: 3s countdown + error</li>
                <li>• Info: Standart notification</li>
                <li>• Success: Standart notification</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={testSessionRevokedNotification}
              className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium flex flex-col items-center gap-1"
            >
              <span>⚠️</span>
              <span>Session Revoked</span>
              <span className="text-xs opacity-80">5s Loading Bar</span>
            </button>
            
            <button
              onClick={testAuthErrorNotification}
              className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex flex-col items-center gap-1"
            >
              <span>❌</span>
              <span>Auth Error</span>
              <span className="text-xs opacity-80">3s Loading Bar</span>
            </button>
            
            <button
              onClick={testInfoNotification}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex flex-col items-center gap-1"
            >
              <span>ℹ️</span>
              <span>Info</span>
              <span className="text-xs opacity-80">Standart</span>
            </button>
            
            <button
              onClick={testSuccessNotification}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex flex-col items-center gap-1"
            >
              <span>✅</span>
              <span>Success</span>
              <span className="text-xs opacity-80">Standart</span>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">WebSocket Durumu</h3>
            <WebSocketStatus showDetails={true} />
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Güvenlik Özellikleri</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• IP masking ile gizlilik</li>
              <li>• Detaylı cihaz tanımlama</li>
              <li>• Süre bazlı oturum yönetimi</li>
              <li>• Gerçek zamanlı iptal bildirimleri</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Session Detayları</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Browser ve işletim sistemi</li>
              <li>• IP adresi (maskelenmiş)</li>
              <li>• Oluşturulma ve bitiş tarihi</li>
              <li>• Son aktivite zamanı</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}