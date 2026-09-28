/** URL base del backend (Spring Boot detrás de Caddy en `/api`). Se define en `.env`. */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
