/**
 * Tests for the clients list hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { ServiceError } from '@/services/service-error'
import type { ActivationCode, ClientSummary } from '@/types/client'
import { useClients } from './useClients'

vi.mock('@/services/clients.service', () => ({
  clientsService: { list: vi.fn(), register: vi.fn(), regenerateCode: vi.fn() },
}))

const diego: ClientSummary = {
  id: 'c1',
  fullName: 'Diego Paredes',
  email: 'diego@correo.com',
  status: 'ACTIVE',
  currentRoutine: null,
  lastWorkout: null,
}
const code: ActivationCode = { clientId: 'c2', clientName: 'Lucía Fernández', code: 'FA-7K2Q', expiresAt: '20 sep' }

describe('useClients', () => {
  beforeEach(() => {
    vi.mocked(clientsService.list).mockReset().mockResolvedValue([diego])
    vi.mocked(clientsService.register).mockReset()
    vi.mocked(clientsService.regenerateCode).mockReset()
  })

  it('loads the clients without filters', async () => {
    const { result } = renderHook(() => useClients())

    await waitFor(() => expect(result.current.clients).toEqual([diego]))
    expect(clientsService.list).toHaveBeenCalledWith('', 'ALL', expect.any(AbortSignal))
    expect(result.current).toMatchObject({ isLoading: false, error: null, hasFilters: false })
  })

  it('loads again when the search or the status changes, and clears both filters', async () => {
    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setQuery('Die')
      result.current.setStatus('ACTIVE')
    })
    await waitFor(() => expect(clientsService.list).toHaveBeenLastCalledWith('Die', 'ACTIVE', expect.any(AbortSignal)))
    expect(result.current.hasFilters).toBe(true)

    act(() => result.current.clearFilters())
    await waitFor(() => expect(clientsService.list).toHaveBeenLastCalledWith('', 'ALL', expect.any(AbortSignal)))
  })

  it('exposes the error when the list cannot be loaded', async () => {
    vi.mocked(clientsService.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useClients())

    await waitFor(() => expect(result.current.error).toBe('No pudimos cargar tus clientes. Inténtalo nuevamente.'))
  })

  it('registers a client, returns the activation code and reloads the list', async () => {
    vi.mocked(clientsService.register).mockResolvedValue(code)
    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.registerClient({ fullName: 'Lucía Fernández' })
    })

    expect(outcome).toEqual({ ok: true, value: code })
    await waitFor(() => expect(clientsService.list).toHaveBeenCalledTimes(2))
  })

  it('exposes the message of a failed registration and clears it on reset', async () => {
    vi.mocked(clientsService.register).mockRejectedValue(new ServiceError('INVALID_CLIENT_NAME', 'El nombre no es válido.'))
    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.registerClient({ fullName: 'Diego' })
    })
    expect(result.current.registerError).toBe('El nombre no es válido.')
    expect(clientsService.list).toHaveBeenCalledTimes(1)

    act(() => result.current.resetRegisterError())
    expect(result.current.registerError).toBeNull()
  })

  it('regenerates an activation code and reloads the list', async () => {
    vi.mocked(clientsService.regenerateCode).mockResolvedValue(code)
    const { result } = renderHook(() => useClients())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.regenerateCode('c2')
    })

    expect(clientsService.regenerateCode).toHaveBeenCalledWith('c2')
    await waitFor(() => expect(clientsService.list).toHaveBeenCalledTimes(2))
  })
})
