/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly APP_VERSION: string
  readonly GIT_SHA: string
  readonly VITE_FEATURE_REALTIME_LOGOUT: boolean

  // Diğer environment değişkenleri buraya eklenebilir
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
