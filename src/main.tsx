import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/provider/AuthProvider.tsx'
import { NotificationProvider } from './context/provider/NotificationProvider.tsx'
import { ConfirmProvider } from './context/provider/ConfirmProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <AuthProvider>
          <ConfirmProvider>
            <div className="scale-[0.75] origin-top-left w-[133.33vw] h-[133.33vh]">
              <App />
            </div>
          </ConfirmProvider>
        </AuthProvider>
      </BrowserRouter>
    </NotificationProvider>
  </StrictMode>
)
