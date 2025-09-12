import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { NotificationProvider } from './context/provider/NotificationProvider'
import { ConfirmProvider } from './context/provider/ConfirmProvider'
import { AuthProvider } from './context/provider/AuthProvider'
import { ProfileProvider } from './context/provider/ProfileProvider'

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
