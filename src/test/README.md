# `test/` — Soporte de tests

Configuración compartida por todos los tests. **No contiene tests**: cada test vive junto al
archivo que prueba (`Button.test.tsx`, `useClients.test.ts`).

## Contenido

| Archivo | Uso |
|---|---|
| `backend.ts` | `stubBackend(rutas)`: reemplaza `fetch` por un backend simulado para probar services. |
| `router.ts` | `withRouter(ruta)`: envoltorio con router en memoria; `lastLocation` guarda la última navegación. |
| `setup.ts` | Se ejecuta antes de cada archivo de test: registra los matchers de DOM y limpia el árbol renderizado. Está declarado en `vite.config.ts` (`test.setupFiles`). |

## Reglas

- Aquí van solo utilidades de test reutilizables (setup, renders con providers, fábricas de datos).
- Nada de esta carpeta se importa desde el código de la app.
