/**
 * Tests for the helpers of the routine form.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import type { Routine } from '@/types/routine'
import {
  createEditorExercise,
  createEditorSession,
  createEmptyEditorState,
  fieldKey,
  hasEditorErrors,
  MAX_SESSIONS,
  resizeSessions,
  toEditorState,
  toSaveInput,
  validateEditorState,
} from './routine-editor'

const routine: Routine = {
  id: 'r1',
  name: 'Fuerza base',
  status: 'DRAFT',
  currentVersion: 1,
  createdAtLabel: '1 sep 2026',
  assignedClients: [],
  sessions: [
    {
      order: 1,
      label: 'Día A',
      exercises: [{ exerciseId: 'e1', exerciseName: 'Press', sets: 4, reps: 8, targetLoadKg: 60.5, restSeconds: 120 }],
    },
  ],
}

describe('routine-editor', () => {
  it('starts a new routine with one session named after its position', () => {
    const state = createEmptyEditorState()

    expect(state.name).toBe('')
    expect(state.sessions).toHaveLength(1)
    expect(state.sessions[0].label).toBe('Día A')
    expect(createEditorSession(1).label).toBe('Día B')
  })

  it('fills the form from an existing routine and converts it back', () => {
    const state = toEditorState(routine)

    expect(state.sessions[0].exercises[0]).toMatchObject({ exerciseId: 'e1', sets: '4', targetLoadKg: '60.5' })
    expect(toSaveInput(state)).toEqual({
      name: 'Fuerza base',
      sessions: [
        { label: 'Día A', exercises: [{ exerciseId: 'e1', sets: 4, reps: 8, targetLoadKg: 60.5, restSeconds: 120 }] },
      ],
    })
  })

  it('reads a load typed with a decimal comma', () => {
    const state = toEditorState(routine)
    state.sessions[0].exercises[0].targetLoadKg = '62,5'

    expect(toSaveInput(state).sessions[0].exercises[0].targetLoadKg).toBe(62.5)
  })

  it('adds and removes sessions at the end, within the limits of a week', () => {
    const sessions = toEditorState(routine).sessions

    const grown = resizeSessions(sessions, 3)
    expect(grown.map((session) => session.label)).toEqual(['Día A', 'Día B', 'Día C'])
    expect(grown[0]).toBe(sessions[0])
    expect(resizeSessions(grown, 1)).toHaveLength(1)
    expect(resizeSessions(sessions, 0)).toHaveLength(1)
    expect(resizeSessions(sessions, 20)).toHaveLength(MAX_SESSIONS)
  })

  it('accepts a complete form', () => {
    expect(hasEditorErrors(validateEditorState(toEditorState(routine)))).toBe(false)
  })

  it('reports the missing name, exercise and numbers of a form', () => {
    const state = createEmptyEditorState()
    const exercise = state.sessions[0].exercises[0]
    exercise.sets = '0'
    exercise.reps = ''
    exercise.targetLoadKg = '-1'

    const errors = validateEditorState(state)

    expect(errors.name).toBe('Obligatorio')
    expect(errors.fields[fieldKey(exercise.localId, 'exerciseId')]).toBe('Obligatorio')
    expect(errors.fields[fieldKey(exercise.localId, 'sets')]).toBe('Mayor que 0')
    expect(errors.fields[fieldKey(exercise.localId, 'reps')]).toBe('Obligatorio')
    expect(errors.fields[fieldKey(exercise.localId, 'targetLoadKg')]).toBe('No puede ser negativo')
    expect(hasEditorErrors(errors)).toBe(true)
  })

  it('reports a session without name', () => {
    const state = toEditorState(routine)
    state.sessions[0].label = ' '

    expect(validateEditorState(state).fields[fieldKey(state.sessions[0].localId, 'label')]).toBe('Obligatorio')
  })

  it('creates exercise rows with unique identifiers', () => {
    expect(createEditorExercise().localId).not.toBe(createEditorExercise().localId)
  })
})
