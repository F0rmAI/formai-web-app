/**
 * Provider of the trainer session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '@/services/api-client'
import { authService } from '@/services/auth.service'
import type { AuthUser, SignInInput, SignUpInput } from '@/types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

/** Key of the signed-in user in the session storage. */
const STORAGE_KEY = 'formai.auth.user'

// Only the public profile of the user is stored, to survive a reload. The credential lives in
// httpOnly cookies that the page cannot read.
function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else sessionStorage.removeItem(STORAGE_KEY)
}

/**
 * Provides the session state to the component tree.
 *
 * @remarks
 * Clears the session when the HTTP client reports that it expired and could not be renewed.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialUser] = useState(readStoredUser)
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [isRestoring, setIsRestoring] = useState(!initialUser)

  const store = useCallback((next: AuthUser | null) => {
    writeStoredUser(next)
    setUser(next)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => store(null))
    return () => setUnauthorizedHandler(null)
  }, [store])

  useEffect(() => {
    if (initialUser) return
    let active = true
    void authService.restoreSession().then((restored) => {
      if (active && restored) store(restored)
    }).finally(() => {
      if (active) setIsRestoring(false)
    })
    return () => { active = false }
  }, [initialUser, store])

  const login = useCallback(
    async (input: SignInInput, fullName?: string) => {
      const authenticated = await authService.signIn(input, fullName)
      store(authenticated)
      return authenticated
    },
    [store],
  )

  const register = useCallback(
    async (input: SignUpInput) => {
      await authService.signUp(input)
      return login({ email: input.email, password: input.password }, input.fullName)
    },
    [login],
  )

  const logout = useCallback(async () => {
    try {
      await authService.signOut()
    } finally {
      store(null)
    }
  }, [store])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), isRestoring, login, register, logout }),
    [user, isRestoring, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
