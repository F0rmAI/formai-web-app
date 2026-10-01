/// <reference types="vite/client" />

/**
 * Environment variables exposed to the client by Vite.
 */
interface ImportMetaEnv {
  /** Base URL of the backend, such as `https://example.com/api`. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
