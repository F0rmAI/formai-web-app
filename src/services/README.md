# `services/` — Acceso al backend

Única capa que **habla con la API** de FormAI (Spring Boot detrás de Caddy en `/api`). Traduce
llamadas HTTP a funciones tipadas que consumen los hooks.

## Contenido

| Archivo | Uso |
|---|---|
| `config.ts` | URL base del backend, tomada de `VITE_API_URL` (ver `.env.example`). |
| `api-client.ts` | Cliente `fetch` único (`apiClient.get/post/put/patch/delete`) con JSON y `ApiError` tipado. Comparte una sola renovación ante un `401` o `403` inicial (`/v1/authentication/refresh`) y avisa al contexto si no puede. |
| `service-error.ts` | `ServiceError` (código de dominio + mensaje en español listo para mostrar) y `throwServiceError`, que traduce un estado HTTP a ese error. |
| `auth.service.ts` | Registro, inicio y cierre de sesión, recuperación de contraseña. |
| `clients.service.ts` | Clientes del entrenador: listado, ficha, alta, código de activación, desactivación. |
| `exercises.service.ts` | Catálogo de ejercicios: listado por estado, alta, archivar y restaurar. |
| `routines.service.ts` | Rutinas: listado, detalle, crear, editar (nueva versión), versiones, duplicar y asignar. |
| `workouts.service.ts` | Seguimiento de un cliente: entrenamientos, reporte de progreso y evolución por ejercicio. |

## Reglas

- Un archivo por recurso del backend: `<recurso>.service.ts` exporta `<recurso>Service`.
- Todas las llamadas pasan por `apiClient`; no se usa `fetch` suelto en otras capas.
- Sin estado ni React: funciones asíncronas que devuelven tipos de `types/` y aceptan `signal` para cancelar.
- Aquí se mapean los DTO del backend a los modelos del front (fechas ya formateadas, números ya convertidos).
- Los fallos se lanzan como `ServiceError` con un código del dominio. El detalle que envía el backend está en inglés y **no se muestra**: el mensaje para el usuario se define aquí.
- Cada service tiene su test (`*.service.test.ts`) contra un backend simulado (`src/test/backend.ts`).

## Ejemplo

```ts
import { apiClient } from './api-client'
import type { Client } from '@/types/client'

export const clientsService = {
  list: () => apiClient.get<Client[]>('/clients'),
  create: (input: CreateClientInput) => apiClient.post<Client>('/clients', input),
}
```
