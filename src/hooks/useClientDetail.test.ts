/**
 * Tests for the client detail hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { ServiceError } from '@/services/service-error'
import type { ClientDetail } from '@/types/client'
import { useClientDetail } from './useClientDetail'

vi.mock('@/services/clients.service', () => ({
  clientsService: { getById: vi.fn(), rename: vi.fn(), updateBodyProfile: vi.fn(), deactivate: vi.fn() },
}))

const client = { id: 'c1', fullName: 'Diego Paredes' } as ClientDetail
const profile = { goal: 'Fuerza', weight: 78, height: 176, restrictions: '' }

describe('useClientDetail', () => {
  beforeEach(() => {
    vi.mocked(clientsService.getById).mockReset().mockResolvedValue(client)
    vi.mocked(clientsService.rename).mockReset().mockResolvedValue({ id: 'c1', fullName: 'Diego Paredes', email: null, status: 'ACTIVE', registeredAt: '2026-10-01' })
    vi.mocked(clientsService.updateBodyProfile).mockReset().mockResolvedValue()
    vi.mocked(clientsService.deactivate).mockReset().mockResolvedValue()
  })

  it('loads the client', async () => {
    const { result } = renderHook(() => useClientDetail('c1'))

    await waitFor(() => expect(result.current.client).toBe(client))
    expect(clientsService.getById).toHaveBeenCalledWith('c1', expect.any(AbortSignal))
  })

  it('exposes the error of a client that cannot be loaded', async () => {
    vi.mocked(clientsService.getById).mockRejectedValue(new ServiceError('CLIENT_NOT_FOUND', 'No se encontró.'))

    const { result } = renderHook(() => useClientDetail('zz'))

    await waitFor(() => expect(result.current.error).toBe('No se encontró.'))
    expect(result.current.client).toBeNull()
  })

  it('saves the body profile and reloads the client', async () => {
    const { result } = renderHook(() => useClientDetail('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.saveBodyProfile(profile)
    })

    expect(clientsService.updateBodyProfile).toHaveBeenCalledWith('c1', profile)
    expect(outcome).toMatchObject({ ok: true })
    await waitFor(() => expect(clientsService.getById).toHaveBeenCalledTimes(2))
  })

  it('exposes the message of a rejected body profile', async () => {
    vi.mocked(clientsService.updateBodyProfile).mockRejectedValue(new ServiceError('INVALID_BODY_PROFILE', 'No es válido.'))
    const { result } = renderHook(() => useClientDetail('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.saveBodyProfile(profile)
    })

    expect(result.current.profileError).toBe('No es válido.')
  })

  it('renames a client and reloads the header data', async () => {
    const { result } = renderHook(() => useClientDetail('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => {
      expect(await result.current.rename('Diego Ramos')).toMatchObject({ ok: true })
    })
    expect(clientsService.rename).toHaveBeenCalledWith('c1', 'Diego Ramos')
    await waitFor(() => expect(clientsService.getById).toHaveBeenCalledTimes(2))
  })

  it('shows a rename error without reloading the client', async () => {
    vi.mocked(clientsService.rename).mockRejectedValue(new ServiceError('INVALID_CLIENT_NAME', 'Nombre inválido.'))
    const { result } = renderHook(() => useClientDetail('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    await act(async () => { await result.current.rename('') })
    expect(result.current.renameError).toBe('Nombre inválido.')
    expect(clientsService.getById).toHaveBeenCalledTimes(1)
  })

  it('deactivates the client', async () => {
    const { result } = renderHook(() => useClientDetail('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.deactivate()
    })

    expect(clientsService.deactivate).toHaveBeenCalledWith('c1')
    expect(outcome).toMatchObject({ ok: true })
  })
})
