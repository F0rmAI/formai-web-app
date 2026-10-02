/**
 * Tests for the routines list, routine detail and routine versions hooks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { routinesService } from '@/services/routines.service'
import { ServiceError } from '@/services/service-error'
import type { Routine, RoutineVersion } from '@/types/routine'
import { useRoutine } from './useRoutine'
import { useRoutines } from './useRoutines'
import { useRoutineVersions } from './useRoutineVersions'

vi.mock('@/services/routines.service', () => ({
  routinesService: { list: vi.fn(), getById: vi.fn(), getVersions: vi.fn(), duplicate: vi.fn(), assign: vi.fn() },
}))
vi.mock('@/services/clients.service', () => ({ clientsService: { list: vi.fn(), getCurrentAssignment: vi.fn() } }))
vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'carla@formai.app', fullName: 'Carla Ríos' } }),
}))

const routine = { id: 'r1', name: 'Fuerza base', currentVersion: 2 } as Routine
const copy = { id: 'r2', name: 'Copia de Fuerza base' } as Routine

beforeEach(() => {
  vi.mocked(routinesService.list).mockReset().mockResolvedValue([routine])
  vi.mocked(routinesService.getById).mockReset().mockResolvedValue(routine)
  vi.mocked(routinesService.getVersions).mockReset()
  vi.mocked(routinesService.duplicate).mockReset()
  vi.mocked(routinesService.assign).mockReset()
  vi.mocked(clientsService.list).mockReset().mockResolvedValue([])
  vi.mocked(clientsService.getCurrentAssignment).mockReset().mockResolvedValue(null)
})

describe('useRoutines', () => {
  it('loads the routines', async () => {
    const { result } = renderHook(() => useRoutines())

    await waitFor(() => expect(result.current.routines).toEqual([routine]))
    expect(result.current).toMatchObject({ isLoading: false, error: null })
  })

  it('exposes the error when the routines cannot be loaded', async () => {
    vi.mocked(routinesService.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useRoutines())

    await waitFor(() => expect(result.current.error).toBe('No pudimos cargar tus rutinas. Inténtalo nuevamente.'))
  })
})

describe('useRoutine', () => {
  it('checks current assignment ids only for selected clients', async () => {
    vi.mocked(clientsService.getCurrentAssignment).mockResolvedValue({ routineId: 'r2', routineName: 'Otra rutina' })
    const { result } = renderHook(() => useRoutine('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => { outcome = await result.current.inspectAssignments(['c1']) })

    expect(clientsService.getCurrentAssignment).toHaveBeenCalledTimes(1)
    expect(clientsService.getCurrentAssignment).toHaveBeenCalledWith('c1')
    expect(outcome).toMatchObject({ ok: true, value: [{ clientId: 'c1', current: { routineId: 'r2' } }] })
  })
  it('loads the routine and every client of the trainer', async () => {
    const { result } = renderHook(() => useRoutine('r1'))

    await waitFor(() => expect(result.current.routine).toBe(routine))
    expect(clientsService.list).toHaveBeenCalledWith('', 'ALL', expect.any(AbortSignal))
  })

  it('duplicates the routine and resolves with the copy', async () => {
    vi.mocked(routinesService.duplicate).mockResolvedValue(copy)
    const { result } = renderHook(() => useRoutine('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.duplicate('Copia de Fuerza base')
    })

    expect(routinesService.duplicate).toHaveBeenCalledWith('r1', 'Copia de Fuerza base')
    expect(outcome).toEqual({ ok: true, value: copy })
  })

  it('assigns the routine and reloads it with its clients', async () => {
    vi.mocked(routinesService.assign).mockResolvedValue()
    const { result } = renderHook(() => useRoutine('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.assign(['c1'], '2026-09-21', ['MONDAY'])
    })

    expect(routinesService.assign).toHaveBeenCalledWith('r1', { clientIds: ['c1'], startDate: '2026-09-21', trainingDays: ['MONDAY'] })
    await waitFor(() => expect(routinesService.getById).toHaveBeenCalledTimes(2))
    expect(clientsService.list).toHaveBeenCalledTimes(2)
  })

  it('exposes the message of a failed assignment', async () => {
    vi.mocked(routinesService.assign).mockRejectedValue(new ServiceError('CLIENT_NOT_ASSIGNABLE', 'No puede recibir rutinas.'))
    const { result } = renderHook(() => useRoutine('r1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.assign(['c3'], '2026-09-21', ['MONDAY'])
    })

    expect(result.current.assignError).toBe('No puede recibir rutinas.')
    await waitFor(() => expect(routinesService.getById).toHaveBeenCalledTimes(2))
  })
})

describe('useRoutineVersions', () => {
  it('loads the routine with its versions and names the versions saved by the trainer', async () => {
    const versions = [
      { number: 2, author: 'u1' },
      { number: 1, author: 'someone-else' },
    ] as RoutineVersion[]
    vi.mocked(routinesService.getVersions).mockResolvedValue(versions)

    const { result } = renderHook(() => useRoutineVersions('r1'))

    await waitFor(() => expect(result.current.versions).toHaveLength(2))
    expect(result.current.versions.map((version) => version.author)).toEqual(['Carla Ríos', 'someone-else'])
    expect(result.current.routine).toBe(routine)
  })

  it('exposes the error when the history cannot be loaded', async () => {
    vi.mocked(routinesService.getVersions).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useRoutineVersions('r1'))

    await waitFor(() => expect(result.current.error).toBe('No pudimos cargar el historial de versiones.'))
    expect(result.current.versions).toEqual([])
  })
})
