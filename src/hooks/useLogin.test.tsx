/**
 * Tests for the access form hooks: sign in, sign up, recover and reset the password.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '@/context/auth-context'
import { ApiError } from '@/services/api-client'
import { authService } from '@/services/auth.service'
import { lastLocation, withRouter } from '@/test/router'
import type { AuthUser } from '@/types/auth'
import { useForgotPassword } from './useForgotPassword'
import { useLogin } from './useLogin'
import { useRegister } from './useRegister'
import { useResetPassword } from './useResetPassword'

vi.mock('@/services/auth.service', () => ({
  authService: { requestPasswordReset: vi.fn(), resetPassword: vi.fn() },
}))

const user: AuthUser = { id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE' }
const auth: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  isRestoring: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}

/** Builds a wrapper with the session context and a router that starts at the given entry. */
function withSession(entry: Parameters<typeof withRouter>[0] = '/login') {
  const Router = withRouter(entry)
  return function SessionWrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={auth}>
        <Router>{children}</Router>
      </AuthContext.Provider>
    )
  }
}

beforeEach(() => {
  vi.mocked(auth.login).mockReset().mockResolvedValue(user)
  vi.mocked(auth.register).mockReset().mockResolvedValue(user)
  vi.mocked(authService.requestPasswordReset).mockReset().mockResolvedValue()
  vi.mocked(authService.resetPassword).mockReset().mockResolvedValue()
})

describe('useLogin', () => {
  it('validates the fields before calling the backend', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: withSession() })

    await act(() => result.current.submit())

    expect(result.current.errors).toEqual({ email: 'Ingresa tu correo electrónico', password: 'Ingresa tu contraseña' })
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('signs in with the trimmed email and goes to the clients page', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper: withSession() })
    act(() => {
      result.current.update('email', ' carla@formai.app ')
      result.current.update('password', 'entrena2026')
    })

    await act(() => result.current.submit())

    expect(auth.login).toHaveBeenCalledWith({ email: 'carla@formai.app', password: 'entrena2026' })
    expect(lastLocation.pathname).toBe('/clients')
  })

  it.each([
    [400, 'Revisa el correo y la contraseña e inténtalo de nuevo.'],
    [401, 'Correo o contraseña incorrectos. Inténtalo de nuevo.'],
    [429, 'Tu cuenta está bloqueada por varios intentos fallidos. Inténtalo más tarde.'],
    [500, 'No pudimos iniciar sesión. Inténtalo de nuevo.'],
  ])('shows the message of a %i response under the password', async (status, message) => {
    vi.mocked(auth.login).mockRejectedValue(new ApiError(status, 'Invalid credentials'))
    const { result } = renderHook(() => useLogin(), { wrapper: withSession() })
    act(() => {
      result.current.update('email', 'carla@formai.app')
      result.current.update('password', 'x')
    })

    await act(() => result.current.submit())

    expect(result.current.errors.password).toBe(message)
    expect(result.current.isSubmitting).toBe(false)
  })

  it('sends a client account to the page that explains it', async () => {
    vi.mocked(auth.login).mockRejectedValue(new ApiError(403, 'Application not allowed'))
    const { result } = renderHook(() => useLogin(), { wrapper: withSession() })
    act(() => {
      result.current.update('email', 'diego@correo.com')
      result.current.update('password', 'cliente2026')
    })

    await act(() => result.current.submit())

    expect(lastLocation.pathname).toBe('/access-app')
  })

  it('shows the unlock time from the sign-in problem body', async () => {
    vi.mocked(auth.login).mockRejectedValue(new ApiError(429, 'Locked', { lockedUntil: '2026-10-02T18:30:00Z' }))
    const { result } = renderHook(() => useLogin(), { wrapper: withSession() })
    act(() => { result.current.update('email', 'carla@formai.app'); result.current.update('password', 'entrena2026') })

    await act(() => result.current.submit())

    expect(result.current.errors.password).toContain('2/10/26')
    expect(result.current.errors.password).toContain('13:30')
  })
})

describe('useRegister', () => {
  it('rejects a name longer than the backend limit', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: withSession('/register') })
    act(() => {
      result.current.update('fullName', 'A'.repeat(121))
      result.current.update('email', 'carla@formai.app')
      result.current.update('password', 'entrena2026')
    })

    await act(() => result.current.submit())

    expect(result.current.errors.fullName).toBe('El nombre completo debe tener 120 caracteres como máximo.')
    expect(auth.register).not.toHaveBeenCalled()
  })
  /** Fills the form with valid values, overriding the given ones. */
  function fill(result: { current: ReturnType<typeof useRegister> }, password = 'entrena2026') {
    act(() => {
      result.current.update('fullName', 'Carla Ríos')
      result.current.update('email', 'carla@formai.app')
      result.current.update('password', password)
    })
  }

  it('rejects a password longer than 128 characters before calling the backend', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: withSession('/register') })
    fill(result, 'a'.repeat(129))

    await act(() => result.current.submit())

    expect(result.current.errors.password).toBe('Debe tener entre 8 y 128 caracteres e incluir letras y números.')
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('creates the account and leaves a welcome message for the clients page', async () => {
    const { result } = renderHook(() => useRegister(), { wrapper: withSession('/register') })
    fill(result)

    await act(() => result.current.submit())

    expect(auth.register).toHaveBeenCalledWith({ fullName: 'Carla Ríos', email: 'carla@formai.app', password: 'entrena2026' })
    expect(lastLocation).toMatchObject({ pathname: '/clients', state: { toast: 'Cuenta creada. ¡Bienvenida a FormAI, Carla!' } })
  })

  it('shows that the email is not available', async () => {
    vi.mocked(auth.register).mockRejectedValue(new ApiError(409, 'Email already registered'))
    const { result } = renderHook(() => useRegister(), { wrapper: withSession('/register') })
    fill(result)

    await act(() => result.current.submit())

    expect(result.current.errors.email).toBe('Este correo no está disponible. Usa otro o inicia sesión.')
  })

  it.each([
    [400, 'Revisa los datos ingresados e inténtalo de nuevo.'],
    [422, 'La contraseña debe tener entre 8 y 128 caracteres.'],
  ])('maps sign-up status %i to a Spanish validation message', async (status, message) => {
    vi.mocked(auth.register).mockRejectedValue(new ApiError(status, 'Backend detail'))
    const { result } = renderHook(() => useRegister(), { wrapper: withSession('/register') })
    fill(result)

    await act(() => result.current.submit())

    expect(result.current.errors.password).toBe(message)
  })
})

describe('useForgotPassword', () => {
  it('asks for the link and goes to the confirmation page', async () => {
    const { result } = renderHook(() => useForgotPassword(), { wrapper: withSession('/forgot-password') })
    act(() => result.current.updateEmail('carla@formai.app'))

    await act(() => result.current.submit())

    expect(authService.requestPasswordReset).toHaveBeenCalledWith('carla@formai.app')
    expect(lastLocation).toMatchObject({ pathname: '/forgot-password/sent', state: {} })
  })

  it('confirms that a new link was sent when the form was opened from an expired link', async () => {
    const wrapper = withSession({ pathname: '/forgot-password', state: { renewal: true } })
    const { result } = renderHook(() => useForgotPassword(), { wrapper })
    act(() => result.current.updateEmail('carla@formai.app'))

    await act(() => result.current.submit())

    expect(lastLocation.state).toEqual({ toast: 'Te enviamos un nuevo enlace' })
  })

  it('shows an invalid email and a failed request', async () => {
    vi.mocked(authService.requestPasswordReset).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useForgotPassword(), { wrapper: withSession('/forgot-password') })

    await act(() => result.current.submit())
    expect(result.current.error).toBe('Ingresa tu correo electrónico')

    act(() => result.current.updateEmail('carla@formai.app'))
    await act(() => result.current.submit())
    expect(result.current.error).toBe('No pudimos enviar el enlace. Inténtalo de nuevo.')
  })
})

describe('useResetPassword', () => {
  it('treats a link without token as expired', () => {
    const { result } = renderHook(() => useResetPassword(null), { wrapper: withSession('/password-reset') })

    expect(result.current.isLinkExpired).toBe(true)
  })

  it('requires both passwords to match', async () => {
    const { result } = renderHook(() => useResetPassword('t1'), { wrapper: withSession('/password-reset') })
    act(() => {
      result.current.update('password', 'entrena2027')
      result.current.update('confirmPassword', 'entrena2028')
    })

    await act(() => result.current.submit())

    expect(result.current.errors.confirmPassword).toBe('Las contraseñas no coinciden')
    expect(authService.resetPassword).not.toHaveBeenCalled()
  })

  it('saves the password and leaves a confirmation for the sign-in page', async () => {
    const { result } = renderHook(() => useResetPassword('t1'), { wrapper: withSession('/password-reset') })
    act(() => {
      result.current.update('password', 'entrena2027')
      result.current.update('confirmPassword', 'entrena2027')
    })

    await act(() => result.current.submit())

    expect(authService.resetPassword).toHaveBeenCalledWith({ token: 't1', password: 'entrena2027' })
    expect(lastLocation).toMatchObject({ pathname: '/login', state: { toast: 'Contraseña actualizada' } })
  })

  it('marks the link as expired when the backend rejects the token', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new ApiError(422, 'Invalid or expired token'))
    const { result } = renderHook(() => useResetPassword('old'), { wrapper: withSession('/password-reset') })
    act(() => {
      result.current.update('password', 'entrena2027')
      result.current.update('confirmPassword', 'entrena2027')
    })

    await act(() => result.current.submit())

    expect(result.current.isLinkExpired).toBe(true)
  })

  it('maps a blank reset field without claiming the link expired', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(new ApiError(400, 'Validation failure'))
    const { result } = renderHook(() => useResetPassword('t1'), { wrapper: withSession('/password-reset') })
    act(() => { result.current.update('password', 'entrena2027'); result.current.update('confirmPassword', 'entrena2027') })

    await act(() => result.current.submit())

    expect(result.current.isLinkExpired).toBe(false)
    expect(result.current.errors.confirmPassword).toBe('Completa los campos obligatorios e inténtalo de nuevo.')
  })
})
