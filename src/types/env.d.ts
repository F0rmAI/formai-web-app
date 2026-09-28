/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend, p. ej. https://formai.app/api */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
