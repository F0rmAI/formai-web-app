# `navigation/` — Rutas y guards

Configuración de la navegación: las rutas de la app y los guards que deciden el acceso según la
sesión. `App.tsx` monta los providers y renderiza `AppRoutes`.

| Archivo | Uso |
|---|---|
| `routes.ts` | `ROUTES`: todas las rutas en un solo lugar. Páginas y guards navegan con estas constantes, nunca con cadenas sueltas. |
| `RouteGuards.tsx` | `RequireAuth` (solo con sesión) y `GuestOnly` (solo sin sesión). |
| `TrainerLayout.tsx` | Marco de las páginas del entrenador: `AppShell` con la sesión y la navegación lateral. |
| `AppRoutes.tsx` | Árbol de rutas: públicas, de invitado y protegidas. |

## Reglas

- Las rutas protegidas se resuelven aquí, no dentro de cada página.
- Es la única carpeta, junto con `pages/` y `hooks/`, que usa `react-router-dom`.
- Puede leer `context/` a través de su hook (`useAuth`); no llama a `services/`.
