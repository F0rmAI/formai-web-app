/**
 * Tests for the routine form hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exercisesService } from '@/services/exercises.service'
import { routinesService } from '@/services/routines.service'
import { ServiceError } from '@/services/service-error'
import type { Routine } from '@/types/routine'
import { useRoutineEditor } from './useRoutineEditor'

vi.mock('@/services/routines.service', () => ({
  routinesService: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
}))
vi.mock('@/services/exercises.service', () => ({ exercisesService: { list: vi.fn() } }))

const routine: Routine = {
  id: 'r1',
  name: 'Fuerza base',
  status: 'ACTIVE',
  currentVersion: 2,
  createdAtLabel: '1 sep 2026',
  assignedClients: ['Diego Paredes'],
  sessions: [
    {
      order: 1,
      label: 'Día A',
      exercises: [{ exerciseId: 'e1', exerciseName: 'Press', sets: 4, reps: 8, targetLoadKg: 60, restSeconds: 120 }],
    },
  ],
}

describe('useRoutineEditor', () => {
  beforeEach(() => {
    vi.mocked(routinesService.getById).mockReset().mockResolvedValue(routine)
    vi.mocked(routinesService.create).mockReset()
    vi.mocked(routinesService.update).mockReset()
    vi.mocked(exercisesService.list).mockReset().mockResolvedValue([])
  })

  it('starts a new routine with an empty form and loads the active exercises', async () => {
    const { result } = renderHook(() => useRoutineEditor())

    await waitFor(() => expect(result.current.state).not.toBeNull())
    expect(result.current.routine).toBeNull()
    expect(result.current.state).toMatchObject({ name: '', sessions: [{ label: 'Día A' }] })
    expect(exercisesService.list).toHaveBeenCalledWith('ACTIVE', expect.any(AbortSignal))
    expect(routinesService.getById).not.toHaveBeenCalled()
  })

  it('fills the form from the routine being edited', async () => {
    const { result } = renderHook(() => useRoutineEditor('r1'))

    await waitFor(() => expect(result.current.routine).toBe(routine))
    expect(result.current.state?.sessions[0].exercises[0]).toMatchObject({ exerciseId: 'e1', sets: '4' })
  })

  it('exposes the error of a routine that cannot be loaded', async () => {
    vi.mocked(routinesService.getById).mockRejectedValue(new ServiceError('ROUTINE_NOT_FOUND', 'No encontramos esa rutina.'))

    const { result } = renderHook(() => useRoutineEditor('zz'))

    await waitFor(() => expect(result.current.loadError).toBe('No encontramos esa rutina.'))
    expect(result.current.state).toBeNull()
  })

  it('edits the name, the sessions and the exercise rows', async () => {
    const { result } = renderHook(() => useRoutineEditor('r1'))
    await waitFor(() => expect(result.current.state).not.toBeNull())

    act(() => {
      result.current.setName('Fuerza base · 2 días')
      result.current.setSessionCount(2)
    })
    const [sessionA, sessionB] = result.current.state?.sessions ?? []
    act(() => {
      result.current.updateSession(sessionB.localId, (session) => ({ ...session, label: 'Día B · Piernas' }))
      result.current.updateExercise(sessionA.localId, sessionA.exercises[0].localId, { sets: '5' })
      result.current.addExercise(sessionA.localId)
    })

    expect(result.current.state?.name).toBe('Fuerza base · 2 días')
    expect(result.current.state?.sessions[1].label).toBe('Día B · Piernas')
    expect(result.current.state?.sessions[0].exercises).toHaveLength(2)
    expect(result.current.state?.sessions[0].exercises[0].sets).toBe('5')

    const added = result.current.state?.sessions[0].exercises[1]
    act(() => result.current.removeExercise(sessionA.localId, added?.localId ?? ''))
    expect(result.current.state?.sessions[0].exercises).toHaveLength(1)
  })

  it('does not save an invalid form and shows messages that follow the edits', async () => {
    const { result } = renderHook(() => useRoutineEditor())
    await waitFor(() => expect(result.current.state).not.toBeNull())
    expect(result.current.errors.name).toBeUndefined()

    let outcome
    await act(async () => {
      outcome = await result.current.save()
    })

    expect(outcome).toMatchObject({ ok: false })
    expect(routinesService.create).not.toHaveBeenCalled()
    expect(result.current.errors.name).toBe('Obligatorio')

    act(() => result.current.setName('Fuerza base'))
    expect(result.current.errors.name).toBeUndefined()
  })

  it('updates the routine with the parsed form and resolves with the saved routine', async () => {
    const saved = { ...routine, currentVersion: 3 }
    vi.mocked(routinesService.update).mockResolvedValue(saved)
    const { result } = renderHook(() => useRoutineEditor('r1'))
    await waitFor(() => expect(result.current.state).not.toBeNull())

    let outcome
    await act(async () => {
      outcome = await result.current.save()
    })

    expect(routinesService.update).toHaveBeenCalledWith('r1', {
      name: 'Fuerza base',
      sessions: [{ label: 'Día A', exercises: [{ exerciseId: 'e1', sets: 4, reps: 8, targetLoadKg: 60, restSeconds: 120 }] }],
    })
    expect(outcome).toEqual({ ok: true, value: saved })
  })

  it('exposes the message of a save rejected by the server', async () => {
    vi.mocked(routinesService.update).mockRejectedValue(new ServiceError('VALIDATION', 'Revisa los datos.'))
    const { result } = renderHook(() => useRoutineEditor('r1'))
    await waitFor(() => expect(result.current.state).not.toBeNull())

    await act(async () => {
      await result.current.save()
    })

    expect(result.current.saveError).toBe('Revisa los datos.')
  })
})
