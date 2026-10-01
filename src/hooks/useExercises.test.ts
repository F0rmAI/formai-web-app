/**
 * Tests for the exercise catalog hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exercisesService } from '@/services/exercises.service'
import { ServiceError } from '@/services/service-error'
import type { Exercise } from '@/types/exercise'
import { useExercises } from './useExercises'

vi.mock('@/services/exercises.service', () => ({
  exercisesService: { list: vi.fn(), create: vi.fn(), archive: vi.fn(), restore: vi.fn() },
}))

const press: Exercise = { id: 'e1', name: 'Press', muscleGroup: 'Pectoral', equipment: null, status: 'ACTIVE', routineCount: 2 }

describe('useExercises', () => {
  beforeEach(() => {
    vi.mocked(exercisesService.list).mockReset().mockResolvedValue([press])
    vi.mocked(exercisesService.create).mockReset()
    vi.mocked(exercisesService.archive).mockReset()
    vi.mocked(exercisesService.restore).mockReset()
  })

  it('loads the active exercises and reloads when the status changes', async () => {
    const { result } = renderHook(() => useExercises())
    await waitFor(() => expect(result.current.exercises).toEqual([press]))
    expect(exercisesService.list).toHaveBeenCalledWith('ACTIVE', expect.any(AbortSignal))

    act(() => result.current.setStatus('ARCHIVED'))

    await waitFor(() => expect(exercisesService.list).toHaveBeenLastCalledWith('ARCHIVED', expect.any(AbortSignal)))
  })

  it('creates an exercise and reloads the list', async () => {
    vi.mocked(exercisesService.create).mockResolvedValue(press)
    const { result } = renderHook(() => useExercises())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.createExercise({ name: 'Press', muscleGroup: 'Pectoral' })
    })

    expect(outcome).toEqual({ ok: true, value: press })
    await waitFor(() => expect(exercisesService.list).toHaveBeenCalledTimes(2))
  })

  it('exposes the message of a duplicate name', async () => {
    vi.mocked(exercisesService.create).mockRejectedValue(new ServiceError('NAME_ALREADY_EXISTS', 'Ya tienes ese nombre.'))
    const { result } = renderHook(() => useExercises())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createExercise({ name: 'Press', muscleGroup: 'Pectoral' })
    })

    expect(result.current.createError).toBe('Ya tienes ese nombre.')
  })

  it('keeps an archived exercise in the list with its new status and its routine usage', async () => {
    vi.mocked(exercisesService.archive).mockResolvedValue({ ...press, status: 'ARCHIVED', routineCount: 0 })
    const { result } = renderHook(() => useExercises())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.archiveExercise('e1')
    })

    expect(result.current.exercises).toEqual([{ ...press, status: 'ARCHIVED' }])
    expect(exercisesService.list).toHaveBeenCalledTimes(1)
  })

  it('restores an exercise and reports a failed restore', async () => {
    vi.mocked(exercisesService.restore).mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(press)
    const { result } = renderHook(() => useExercises())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let failed
    let restored
    await act(async () => {
      failed = await result.current.restoreExercise('e1')
      restored = await result.current.restoreExercise('e1')
    })

    expect(failed).toEqual({ ok: false, error: { message: 'No pudimos restaurar este ejercicio.' } })
    expect(restored).toMatchObject({ ok: true })
  })
})
