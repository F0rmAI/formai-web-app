/**
 * Access hook of the trainer session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'

/**
 * Reads the session state.
 *
 * @returns The current session state and its actions.
 * @throws Error when used outside `AuthProvider`.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
