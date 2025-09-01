/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_BASE_URL_PROD: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_WITH_CREDENTIALS: 'true' | 'false'
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}