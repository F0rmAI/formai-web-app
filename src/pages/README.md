# `pages/` — Páginas

Cada archivo es una **página completa** de la app: compone componentes de
`components/` y obtiene datos y acciones de `hooks/`. Es el punto donde se une la UI con el estado.

```
App
 │
 ▼
Pages
 │
 ├──────────► Components
 │
 ▼
Hooks
 │
 ▼
Services
 │
 ▼
Backend/API
```

## Reglas

- Nombre `<Nombre>Page.tsx` (p. ej. `ClientsPage.tsx`), exportado por nombre.
- **No llama a `services/` directamente**: usa un hook (`useClients`, `useTodayWorkout`…).
- Mantiene el markup de alto nivel; si un bloque se repite o crece, se extrae a `components/`.
- Cada ruta de `navigation/AppRoutes.tsx` apunta a una página de esta carpeta; las rutas se escriben con `ROUTES`, nunca a mano.
- Las pestañas de un cliente (`ClientProfilePage`, `ClientWorkoutsPage`, `ClientProgressPage`) se renderizan dentro de `ClientLayoutPage`, que carga al cliente una vez y se lo entrega con `useClientOutlet`.
- Sin `try/catch` de red ni colores o medidas sueltas: los estados de carga, error y vacío usan `LoadingState` y `EmptyState`.

## Ejemplo

```tsx
export function ClientsPage() {
  const { clients, isLoading } = useClients()

  return isLoading ? <EmptyState title="Cargando…" /> : <ClientList clients={clients} />
}
```
