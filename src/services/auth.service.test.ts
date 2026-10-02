/**
 * Tests for the authentication service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { ApiError } from './api-client'
import { authService } from './auth.service'

describe('authService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('restores the authenticated user with one body-free refresh request', async () => {
    const user = { id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE' }
    const requests = stubBackend({ 'POST /v1/authentication/refresh': user })

    await expect(authService.restoreSession()).resolves.toEqual(user)
    expect(requests).toEqual([{ method: 'POST', path: '/v1/authentication/refresh', body: undefined }])
  })

  it('signs in to the web platform and returns the user with the given name', async () => {
    const requests = stubBackend({
      'POST /v1/authentication/sign-in': { id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE' },
    })

    const user = await authService.signIn({ email: 'carla@formai.app', password: 'entrena2026' }, 'Carla Ríos')

    expect(requests[0].body).toEqual({ email: 'carla@formai.app', password: 'entrena2026', application: 'WEB_PLATFORM' })
    expect(user).toEqual({ id: 'u1', email: 'carla@formai.app', roles: ['TRAINER'], status: 'ACTIVE', fullName: 'Carla Ríos' })
  })

  it('throws the API error for wrong credentials without trying to renew the session', async () => {
    const requests = stubBackend({ 'POST /v1/authentication/sign-in': { status: 401, body: { detail: 'Invalid credentials' } } })

    const error = await authService.signIn({ email: 'a@b.co', password: 'x' }).catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 401 })
    expect(requests).toHaveLength(1)
  })

  it('sends the sign-up, sign-out and password recovery requests', async () => {
    const requests = stubBackend({ 'POST /v1': {} })

    await authService.signUp({ fullName: 'Carla Ríos', email: 'carla@formai.app', password: 'entrena2026' })
    await authService.requestPasswordReset('carla@formai.app')
    await authService.resetPassword({ token: 't1', password: 'entrena2027' })
    await authService.signOut()

    expect(requests.map((request) => request.path)).toEqual([
      '/v1/authentication/sign-up',
      '/v1/password-reset-requests',
      '/v1/password-resets',
      '/v1/authentication/sign-out',
    ])
    expect(requests[1].body).toEqual({ email: 'carla@formai.app' })
    expect(requests[2].body).toEqual({ token: 't1', password: 'entrena2027' })
  })
})
