import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/provider/NotificationProvider'
import { ConfirmProvider } from './context/provider/ConfirmProvider'
import { AuthProvider } from './context/provider/AuthProvider'
import { ProfileProvider } from './context/provider/ProfileProvider'
import { safariCSRFService } from './api/safariCsrfService'

// Initialize Safari CSRF service for Safari browsers
safariCSRFService.init();

// Safari debugging in development
if (import.meta.env.DEV) {
  import('./utils/safariDebug').then(({ SafariDebugger }) => {
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isSafari) {
      console.log('Safari detected in development - debug utilities available');
      setTimeout(() => {
        SafariDebugger.logUserAgent();
        SafariDebugger.logCookies();
      }, 1000);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProfileProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  </StrictMode>
)
