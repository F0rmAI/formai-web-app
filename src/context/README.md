# `context/` — Estado global compartido

Providers de React Context para el **estado que comparten varias páginas**: sesión del usuario,
rol (Entrenador / Administrador / Cliente), preferencias, toasts globales.

## Reglas

- Solo estado verdaderamente global. Si lo usa una sola página, va en un hook.
- Un archivo por contexto: `AuthContext.tsx` exporta `AuthProvider` y el hook `useAuth()`.
- El provider se monta en `App.tsx`.
- La lógica de red se delega en `services/` (el contexto solo guarda el resultado).

## Ejemplo

```tsx
const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
```

La base aún no tiene contextos: se crean con la primera feature que los necesite (p. ej. autenticación).
