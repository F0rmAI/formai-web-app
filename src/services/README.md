# `services/` — Acceso al backend

Única capa que **habla con la API** de FormAI (Spring Boot detrás de Caddy en `/api`). Traduce
llamadas HTTP a funciones tipadas que consumen los hooks.

## Contenido base

| Archivo | Uso |
|---|---|
| `config.ts` | URL base del backend. La URL base se toma de `VITE_API_URL` (ver `.env.example`). |
| `api-client.ts` | Cliente `fetch` único (`apiClient.get/post/put/patch/delete`) con JSON y `ApiError` tipado. |
| `clients.contract.ts` | Contrato estable y errores de clientes, compartidos por cualquier adaptador. |
| `clients.service.ts` | Punto de composición que selecciona el adaptador consumido por los hooks. |

## Reglas

- Un archivo por recurso o bounded context del backend: `clients.service.ts`, `routines.service.ts`, `machines.service.ts`…
- Todas las llamadas pasan por `apiClient`; no se usa `fetch` suelto en otras capas.
- Sin estado ni React: funciones puras y asíncronas que devuelven tipos de `types/`.
- Aquí se mapean los DTO del backend a los modelos del front si difieren.
- Los datos de prueba viven exclusivamente en `src/mocks/`; páginas, componentes y hooks no los importan.
- Para integrar el backend se crea un adaptador HTTP que implemente `ClientsService` y se cambia únicamente el punto de composición de `clients.service.ts`.

## Ejemplo

```ts
import { apiClient } from './api-client'
import type { Client } from '@/types/client'

export const clientsService = {
  list: () => apiClient.get<Client[]>('/clients'),
  create: (input: CreateClientInput) => apiClient.post<Client>('/clients', input),
}
```
