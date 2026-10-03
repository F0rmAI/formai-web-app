/**
 * Context object and value type of the trainer session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { createContext } from 'react'
import type { AuthUser, SignInInput, SignUpInput } from '@/types/auth'

/**
 * Session data and actions shared across the app.
 */
export interface AuthContextValue {
  /** Signed-in user, or `null` when there is no session. */
  user: AuthUser | null
  /** Whether there is a session. */
  isAuthenticated: boolean
  /** Whether the initial session restoration is still in progress. */
  isRestoring: boolean
  /** Signs in and stores the user; rejects with the error of the service. */
  login: (input: SignInInput, fullName?: string) => Promise<AuthUser>
  /** Creates a trainer account and signs it in; rejects with the error of the service. */
  register: (input: SignUpInput) => Promise<AuthUser>
  /** Ends the session on the server and clears the stored user. */
  logout: () => Promise<void>
}

/**
 * Context that carries the session; read it through `useAuth`.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
