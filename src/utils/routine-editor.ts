/**
 * Helpers of the routine form: building, converting and validating its state.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import type {
  EditorExercise,
  EditorSession,
  Routine,
  RoutineEditorErrors,
  RoutineEditorState,
  SaveRoutineInput,
} from '@/types/routine'

/** Most training days a week can have. */
export const MAX_SESSIONS = 7

/** Letters used to name the sessions of a new routine. */
const SESSION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

/** Builds an identifier that only exists in the form. */
function createLocalId(): string {
  return crypto.randomUUID()
}

/**
 * Builds the key of a field message in {@link RoutineEditorErrors}.
 *
 * @param localId - Identifier of the session or of the exercise in the form.
 * @param field - Name of the field.
 * @returns The key of the message.
 *
 * @example
 * ```ts
 * fieldKey('a1', 'sets'); // 'a1.sets'
 * ```
 */
export function fieldKey(localId: string, field: keyof EditorExercise | 'label'): string {
  return `${localId}.${field}`
}

/**
 * Builds an empty exercise row with the usual prescription.
 *
 * @returns An exercise row without a chosen exercise.
 *
 * @example
 * ```ts
 * createEditorExercise().sets; // '3'
 * ```
 */
export function createEditorExercise(): EditorExercise {
  return { localId: createLocalId(), exerciseId: '', sets: '3', reps: '10', targetLoadKg: '0', restSeconds: '90' }
}

/**
 * Builds an empty session named after its position in the week.
 *
 * @param index - Position of the session, starting at `0`.
 * @returns A session with one empty exercise row.
 *
 * @example
 * ```ts
 * createEditorSession(1).exercises.length; // 1
 * ```
 */
export function createEditorSession(index: number): EditorSession {
  return {
    localId: createLocalId(),
    label: `Día ${SESSION_LETTERS[index] ?? index + 1}`,
    exercises: [createEditorExercise()],
  }
}

/**
 * Builds the form of a new routine, with one session.
 *
 * @returns The initial state of the form.
 *
 * @example
 * ```ts
 * createEmptyEditorState().sessions.length; // 1
 * ```
 */
export function createEmptyEditorState(): RoutineEditorState {
  return { name: '', sessions: [createEditorSession(0)] }
}

/**
 * Builds the form of an existing routine.
 *
 * @param routine - Routine to edit.
 * @returns The state of the form filled with the current version of the routine.
 *
 * @example
 * ```ts
 * toEditorState(routine).name; // routine.name
 * ```
 */
export function toEditorState(routine: Routine): RoutineEditorState {
  return {
    name: routine.name,
    sessions: routine.sessions.map((session) => ({
      localId: createLocalId(),
      label: session.label,
      exercises: session.exercises.map((exercise) => ({
        localId: createLocalId(),
        exerciseId: exercise.exerciseId,
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        targetLoadKg: String(exercise.targetLoadKg),
        restSeconds: String(exercise.restSeconds),
      })),
    })),
  }
}

/**
 * Adds or removes sessions at the end so the routine has the given number of them.
 *
 * @param sessions - Current sessions of the form.
 * @param count - Sessions per week wanted; clamped between `1` and {@link MAX_SESSIONS}.
 * @returns The sessions, with new empty ones appended or the last ones removed.
 *
 * @example
 * ```ts
 * resizeSessions(sessions, 3).length; // 3
 * ```
 */
export function resizeSessions(sessions: EditorSession[], count: number): EditorSession[] {
  const target = Math.min(MAX_SESSIONS, Math.max(1, Math.trunc(count) || 1))
  if (target <= sessions.length) return sessions.slice(0, target)
  const added = Array.from({ length: target - sessions.length }, (_, offset) =>
    createEditorSession(sessions.length + offset),
  )
  return [...sessions, ...added]
}

/** Reads a number typed with a comma or a dot; an empty text is not a number. */
function toNumber(value: string): number {
  return value.trim() === '' ? Number.NaN : Number(value.replace(',', '.'))
}

/**
 * Validates the routine form.
 *
 * @param state - State of the form.
 * @returns The messages to show; `fields` is empty and `name` is undefined when the form is valid.
 *
 * @example
 * ```ts
 * validateEditorState({ name: '', sessions: [] }).name; // 'Obligatorio'
 * ```
 */
export function validateEditorState(state: RoutineEditorState): RoutineEditorErrors {
  const fields: Record<string, string> = {}
  for (const session of state.sessions) {
    if (!session.label.trim()) fields[fieldKey(session.localId, 'label')] = 'Obligatorio'
    for (const exercise of session.exercises) {
      if (!exercise.exerciseId) fields[fieldKey(exercise.localId, 'exerciseId')] = 'Obligatorio'
      for (const field of ['sets', 'reps'] as const) {
        const value = toNumber(exercise[field])
        if (Number.isNaN(value)) fields[fieldKey(exercise.localId, field)] = 'Obligatorio'
        else if (!Number.isInteger(value) || value <= 0) fields[fieldKey(exercise.localId, field)] = 'Mayor que 0'
      }
      for (const field of ['targetLoadKg', 'restSeconds'] as const) {
        const value = toNumber(exercise[field])
        if (Number.isNaN(value)) fields[fieldKey(exercise.localId, field)] = 'Obligatorio'
        else if (value < 0) fields[fieldKey(exercise.localId, field)] = 'No puede ser negativo'
      }
    }
  }
  return { name: state.name.trim() ? undefined : 'Obligatorio', fields }
}

/**
 * Tells whether a validation result has any message.
 *
 * @param errors - Result of {@link validateEditorState}.
 * @returns `true` when the form cannot be saved.
 *
 * @example
 * ```ts
 * hasEditorErrors({ fields: {} }); // false
 * ```
 */
export function hasEditorErrors(errors: RoutineEditorErrors): boolean {
  return Boolean(errors.name) || Object.keys(errors.fields).length > 0
}

/**
 * Converts a valid form into the data the backend expects.
 *
 * @param state - State of the form, already validated.
 * @returns The name and the sessions with their numbers parsed.
 *
 * @example
 * ```ts
 * toSaveInput(state).sessions[0].exercises[0].sets; // 4
 * ```
 */
export function toSaveInput(state: RoutineEditorState): SaveRoutineInput {
  return {
    name: state.name.trim(),
    sessions: state.sessions.map((session) => ({
      label: session.label.trim(),
      exercises: session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: toNumber(exercise.sets),
        reps: toNumber(exercise.reps),
        targetLoadKg: toNumber(exercise.targetLoadKg),
        restSeconds: Math.trunc(toNumber(exercise.restSeconds)),
      })),
    })),
  }
}
