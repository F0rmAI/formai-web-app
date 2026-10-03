/**
 * Tests for the session provider and its access hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from '@/services/auth.service'
import type { AuthUser } from '@/types/auth'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

vi.mock('@/services/auth.service', () => ({
  authService: { restoreSession: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() },
}))

const user: AuthUser = { id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE' }

describe('AuthProvider', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.mocked(authService.restoreSession).mockReset().mockResolvedValue(null)
    vi.mocked(authService.signIn).mockReset().mockResolvedValue(user)
    vi.mocked(authService.signUp).mockReset().mockResolvedValue()
    vi.mocked(authService.signOut).mockReset().mockResolvedValue()
  })

  it('starts restoring when no user is stored and stays signed out if it fails', async () => {
    let finish!: (value: AuthUser | null) => void
    vi.mocked(authService.restoreSession).mockReturnValue(new Promise((resolve) => { finish = resolve }))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    expect(result.current).toMatchObject({ user: null, isAuthenticated: false, isRestoring: true })
    await act(async () => { finish(null) })
    expect(result.current.isRestoring).toBe(false)
  })

  it('restores and stores the user when a refresh cookie is valid', async () => {
    vi.mocked(authService.restoreSession).mockResolvedValue(user)
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await waitFor(() => expect(result.current.isRestoring).toBe(false))
    expect(result.current).toMatchObject({ user, isAuthenticated: true })
    expect(JSON.parse(sessionStorage.getItem('formai.auth.user') ?? 'null')).toEqual(user)
  })

  it('keeps a stored user without requesting restoration', () => {
    sessionStorage.setItem('formai.auth.user', JSON.stringify(user))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    expect(result.current).toMatchObject({ user, isAuthenticated: true, isRestoring: false })
    expect(authService.restoreSession).not.toHaveBeenCalled()
  })

  it('signs in and keeps the user after a reload', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.login({ email: 'carla@formai.app', password: 'entrena2026' })
    })
    expect(result.current).toMatchObject({ user, isAuthenticated: true })

    const reloaded = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(reloaded.result.current.user).toEqual(user)
  })

  it('creates the account and signs it in with the name typed', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.register({ fullName: 'Carla Ríos', email: 'carla@formai.app', password: 'entrena2026' })
    })

    expect(authService.signUp).toHaveBeenCalledOnce()
    expect(authService.signIn).toHaveBeenCalledWith({ email: 'carla@formai.app', password: 'entrena2026' }, 'Carla Ríos')
  })

  it('clears the session on sign out even when the request fails', async () => {
    vi.mocked(authService.signOut).mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    await act(async () => {
      await result.current.login({ email: 'carla@formai.app', password: 'entrena2026' })
    })

    await act(async () => {
      await result.current.logout().catch(() => undefined)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(sessionStorage.length).toBe(0)
  })

  it('throws a clear error outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside <AuthProvider>')
    consoleError.mockRestore()
  })
})
