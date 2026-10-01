import { createContext } from 'react'
import type { AuthUser, SignInInput, SignUpInput } from '../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (input: SignInInput) => Promise<AuthUser>
  register: (input: SignUpInput) => Promise<AuthUser>
  logout: () => Promise<void>
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
