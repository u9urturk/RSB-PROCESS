/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Diğer environment değişkenleri buraya eklenebilir
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
