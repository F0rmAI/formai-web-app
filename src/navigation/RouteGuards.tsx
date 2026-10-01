/**
 * Route guards that decide access from the session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { ROUTES } from './routes'

/**
 * Renders the nested routes only with a session; otherwise redirects to the sign-in page.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.login} replace />
}

/**
 * Renders the nested routes only without a session; otherwise redirects to the clients page.
 */
export function GuestOnly() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to={ROUTES.clients} replace /> : <Outlet />
}
