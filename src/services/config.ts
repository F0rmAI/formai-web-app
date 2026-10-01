/**
 * Environment configuration of the services layer.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

/**
 * Base URL of the backend, without a trailing slash. Set through `VITE_API_URL`.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
