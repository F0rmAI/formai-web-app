import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setUnauthorizedHandler } from '../services/api-client'
import { authService } from '../services/auth.service'
import type { AuthUser, SignInInput, SignUpInput } from '../types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

const STORAGE_KEY = 'formai.auth.user'

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const clearSession = useCallback(() => {
    writeStoredUser(null)
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
    })
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const login = useCallback(async (input: SignInInput) => {
    const authenticated = await authService.signIn(input)
    writeStoredUser(authenticated)
    setUser(authenticated)
    return authenticated
  }, [])

  const register = useCallback(async (input: SignUpInput) => {
    await authService.signUp(input)
    const authenticated = await authService.signIn(
      { email: input.email, password: input.password },
      input.fullName,
    )
    writeStoredUser(authenticated)
    setUser(authenticated)
    return authenticated
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.signOut()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady: true,
      login,
      register,
      logout,
      clearSession,
    }),
    [user, login, register, logout, clearSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
