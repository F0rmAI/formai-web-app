# `context/` — Estado global compartido

Providers de React Context para el **estado que comparten varias páginas**: sesión del usuario,
rol (Entrenador / Administrador / Cliente), preferencias, toasts globales.

## Reglas

- Solo estado verdaderamente global. Si lo usa una sola página, va en un hook.
- La sesión vive en tres archivos, para que el archivo del provider solo exporte un componente (fast refresh): `auth-context.ts` (objeto de contexto y tipo), `AuthProvider.tsx` (provider) y `useAuth.ts` (hook de acceso).
- El provider se monta en `App.tsx`.
- La lógica de red se delega en `services/` (el contexto solo guarda el resultado).

## Ejemplo

```tsx
const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
```

`AuthProvider` guarda solo el perfil público del usuario en `sessionStorage` para sobrevivir a una recarga; la credencial viaja en cookies `httpOnly` que la página no puede leer.
