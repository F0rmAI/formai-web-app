/**
 * Environment configuration of the services layer.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Base URL of the versioned backend API, without a trailing slash. Set through `VITE_API_URL`.
 */
export const API_URL = import.meta.env.VITE_API_URL?.trim() || (import.meta.env.PROD
  ? 'https://formai-api.quedena.studio/api/v1'
  : 'http://localhost:8080/api/v1')
