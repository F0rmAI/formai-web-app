/**
 * Tests for the workouts, workout detail and progress hooks of a client.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { workoutsService } from '@/services/workouts.service'
import type { ProgressReport, WorkoutSession, WorkoutSessionSummary } from '@/types/workout'
import { useClientProgress } from './useClientProgress'
import { useClientWorkouts } from './useClientWorkouts'
import { useWorkoutDetail } from './useWorkoutDetail'

vi.mock('@/services/workouts.service', () => ({
  workoutsService: { list: vi.fn(), getById: vi.fn(), getProgressReport: vi.fn(), getProgressChart: vi.fn() },
}))

const first = { id: 's1', scheduledFor: '2026-09-14' } as WorkoutSessionSummary
const second = { id: 's2', scheduledFor: '2026-09-16' } as WorkoutSessionSummary
const metric = (exerciseId: string) => ({
  exerciseId,
  exerciseName: exerciseId,
  firstMaxLoadKg: 30,
  lastMaxLoadKg: 34,
  firstVolumeKg: 100,
  lastVolumeKg: 120,
})
const report = (ids: string[]): ProgressReport => ({
  adherencePercentage: 80,
  scheduled: 5,
  completed: 4,
  partial: 0,
  skipped: 1,
  exercises: ids.map(metric),
})

beforeEach(() => {
  vi.mocked(workoutsService.list).mockReset()
  vi.mocked(workoutsService.getById).mockReset()
  vi.mocked(workoutsService.getProgressReport).mockReset()
  vi.mocked(workoutsService.getProgressChart).mockReset().mockResolvedValue({ enoughData: false, points: [] })
})

describe('useClientWorkouts', () => {
  it('loads the sessions and records when it did', async () => {
    vi.mocked(workoutsService.list).mockResolvedValue([first])

    const { result } = renderHook(() => useClientWorkouts('c1'))

    await waitFor(() => expect(result.current.sessions).toEqual([first]))
    expect(result.current.lastSyncedAt).toBeInstanceOf(Date)
  })

  it('reports how many sessions are new after a sync', async () => {
    vi.mocked(workoutsService.list).mockResolvedValueOnce([first]).mockResolvedValueOnce([second, first])
    const { result } = renderHook(() => useClientWorkouts('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.sync()
    })

    expect(outcome).toEqual({ ok: true, value: 1 })
    expect(result.current.sessions).toEqual([second, first])
  })

  it('reports a failed sync without losing the loaded sessions', async () => {
    vi.mocked(workoutsService.list).mockResolvedValueOnce([first]).mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useClientWorkouts('c1'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    let outcome
    await act(async () => {
      outcome = await result.current.sync()
    })

    expect(outcome).toMatchObject({ ok: false })
    expect(result.current.sessions).toEqual([first])
  })
})

describe('useWorkoutDetail', () => {
  it('loads the session of the client', async () => {
    const session = { id: 's1' } as WorkoutSession
    vi.mocked(workoutsService.getById).mockResolvedValue(session)

    const { result } = renderHook(() => useWorkoutDetail('c1', 's1'))

    await waitFor(() => expect(result.current.session).toBe(session))
    expect(workoutsService.getById).toHaveBeenCalledWith('c1', 's1', expect.any(AbortSignal))
  })

  it('exposes the error of a session that cannot be loaded', async () => {
    vi.mocked(workoutsService.getById).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useWorkoutDetail('c1', 'zz'))

    await waitFor(() => expect(result.current.error).toBe('No pudimos abrir este entrenamiento.'))
  })
})

describe('useClientProgress', () => {
  it('loads the report of the last 8 weeks and the chart of its first exercise', async () => {
    vi.mocked(workoutsService.getProgressReport).mockResolvedValue(report(['e1', 'e2']))

    const { result } = renderHook(() => useClientProgress('c1'))

    await waitFor(() => expect(result.current.report).not.toBeNull())
    expect(result.current).toMatchObject({ weeks: 8, exerciseId: 'e1' })
    await waitFor(() => expect(workoutsService.getProgressChart).toHaveBeenCalledWith('c1', 'e1', 8, expect.any(AbortSignal)))
  })

  it('loads the chart of the exercise the trainer picks', async () => {
    vi.mocked(workoutsService.getProgressReport).mockResolvedValue(report(['e1', 'e2']))
    const { result } = renderHook(() => useClientProgress('c1'))
    await waitFor(() => expect(result.current.report).not.toBeNull())

    act(() => result.current.setExerciseId('e2'))

    expect(result.current.exerciseId).toBe('e2')
    await waitFor(() => expect(workoutsService.getProgressChart).toHaveBeenLastCalledWith('c1', 'e2', 8, expect.any(AbortSignal)))
  })

  it('loads a longer period and falls back to the first exercise when the pick has no records', async () => {
    vi.mocked(workoutsService.getProgressReport).mockResolvedValueOnce(report(['e1', 'e2'])).mockResolvedValueOnce(report(['e3']))
    const { result } = renderHook(() => useClientProgress('c1'))
    await waitFor(() => expect(result.current.report).not.toBeNull())
    act(() => result.current.setExerciseId('e2'))

    act(() => result.current.setWeeks(12))

    await waitFor(() => expect(result.current.exerciseId).toBe('e3'))
    expect(workoutsService.getProgressReport).toHaveBeenCalledTimes(2)
  })

  it('asks for no chart when the period has no exercises', async () => {
    vi.mocked(workoutsService.getProgressReport).mockResolvedValue(report([]))

    const { result } = renderHook(() => useClientProgress('c1'))

    await waitFor(() => expect(result.current.report).not.toBeNull())
    expect(result.current.exerciseId).toBe('')
    expect(workoutsService.getProgressChart).not.toHaveBeenCalled()
  })
})
