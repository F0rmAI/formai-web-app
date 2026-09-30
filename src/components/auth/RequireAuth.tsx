import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

/** Rutas autenticadas: redirige a login si no hay sesión. */
export function RequireAuth() {
  const { isAuthenticated, isReady } = useAuth()
  const location = useLocation()

  if (!isReady) return null
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Rutas de invitado: si hay sesión, va a clientes. */
export function GuestOnly() {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) return null
  if (isAuthenticated) return <Navigate to="/clients" replace />
  return <Outlet />
}
