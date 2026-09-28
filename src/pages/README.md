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
- Cuando se agregue el router, cada ruta apunta a una página de esta carpeta.
- `HomeScreen`/`HomePage` es la pantalla de verificación de la base (título + contador) y se reemplaza al empezar las features.

## Ejemplo

```tsx
export function ClientsPage() {
  const { clients, isLoading } = useClients()

  return isLoading ? <EmptyState title="Cargando…" /> : <ClientList clients={clients} />
}
```
