/**
 * Hook of the routine form.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { exercisesService } from '@/services/exercises.service'
import { routinesService } from '@/services/routines.service'
import type { EditorExercise, EditorSession, Routine, RoutineEditorErrors, RoutineEditorState } from '@/types/routine'
import {
  createEditorExercise,
  createEmptyEditorState,
  hasEditorErrors,
  resizeSessions,
  toEditorState,
  toSaveInput,
  validateEditorState,
} from '@/utils/routine-editor'
import { useAsyncAction, type ActionResult } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/** Validation result of a form without messages. */
const NO_ERRORS: RoutineEditorErrors = { fields: {} }

/**
 * Holds the form that creates or edits a routine, loads what it needs and saves it.
 *
 * @remarks
 * Mount the view with a `key` per routine, so the form of one routine never shows in another.
 * Saving validates first; an invalid form resolves with a failure and, from then on, `errors`
 * follows every change of the form.
 *
 * @param routineId - Identifier of the routine to edit; omit it to create a routine.
 * @returns The `routine` being edited (`null` for a new one); the form `state` and its `errors`;
 * the active `exercises` of the catalog; the `isLoading` and `loadError` state of the initial
 * load; the `isSaving` and `saveError` state; the setters `setName`, `setSessionCount`,
 * `updateSession`, `updateExercise`, `addExercise` and `removeExercise`; and `save`, which
 * resolves with an `ActionResult` that carries the saved routine.
 *
 * @example
 * ```tsx
 * const { state, errors, setName, save, isSaving } = useRoutineEditor(routineId);
 * ```
 */
export function useRoutineEditor(routineId?: string) {
  const [edited, setEdited] = useState<RoutineEditorState | null>(null)
  const [hasTriedToSave, setHasTriedToSave] = useState(false)

  const load = useCallback(
    async (signal: AbortSignal): Promise<{ routine: Routine | null; initial: RoutineEditorState }> => {
      if (!routineId) return { routine: null, initial: createEmptyEditorState() }
      const routine = await routinesService.getById(routineId, signal)
      return { routine, initial: toEditorState(routine) }
    },
    [routineId],
  )
  const loaded = useAsyncData(load, 'No pudimos cargar esta rutina. Inténtalo nuevamente.')

  const loadCatalog = useCallback((signal: AbortSignal) => exercisesService.list('ACTIVE', signal), [])
  const catalog = useAsyncData(loadCatalog, 'No pudimos cargar tus ejercicios.')

  // The form starts from the loaded routine and, once the trainer changes it, keeps the edits.
  const state = edited ?? loaded.data?.initial ?? null
  // Messages appear after the first attempt to save and then follow every change.
  const errors = hasTriedToSave && state ? validateEditorState(state) : NO_ERRORS

  const change = useCallback(
    (update: (current: RoutineEditorState) => RoutineEditorState) =>
      setEdited((current) => {
        const base = current ?? loaded.data?.initial
        return base ? update(base) : current
      }),
    [loaded.data],
  )

  const setName = useCallback((name: string) => change((current) => ({ ...current, name })), [change])

  const setSessionCount = useCallback(
    (count: number) => change((current) => ({ ...current, sessions: resizeSessions(current.sessions, count) })),
    [change],
  )

  const updateSession = useCallback(
    (sessionId: string, update: (session: EditorSession) => EditorSession) =>
      change((current) => ({
        ...current,
        sessions: current.sessions.map((session) => (session.localId === sessionId ? update(session) : session)),
      })),
    [change],
  )

  const updateExercise = useCallback(
    (sessionId: string, exerciseId: string, patch: Partial<EditorExercise>) =>
      updateSession(sessionId, (session) => ({
        ...session,
        exercises: session.exercises.map((exercise) =>
          exercise.localId === exerciseId ? { ...exercise, ...patch } : exercise,
        ),
      })),
    [updateSession],
  )

  const addExercise = useCallback(
    (sessionId: string) =>
      updateSession(sessionId, (session) => ({ ...session, exercises: [...session.exercises, createEditorExercise()] })),
    [updateSession],
  )

  const removeExercise = useCallback(
    (sessionId: string, exerciseId: string) =>
      updateSession(sessionId, (session) => ({
        ...session,
        exercises: session.exercises.filter((exercise) => exercise.localId !== exerciseId),
      })),
    [updateSession],
  )

  const saveAction = useCallback(
    (current: RoutineEditorState) =>
      routineId ? routinesService.update(routineId, toSaveInput(current)) : routinesService.create(toSaveInput(current)),
    [routineId],
  )
  const saving = useAsyncAction(saveAction, 'No pudimos guardar la rutina. Inténtalo de nuevo.')

  const { run: runSave } = saving
  const save = useCallback(async (): Promise<ActionResult<Routine>> => {
    const invalid = { ok: false, error: { message: 'Revisa los campos marcados.', code: 'VALIDATION' } } as const
    if (!state) return invalid
    setHasTriedToSave(true)
    return hasEditorErrors(validateEditorState(state)) ? invalid : runSave(state)
  }, [state, runSave])

  return {
    routine: loaded.data?.routine ?? null,
    state,
    errors,
    exercises: catalog.data ?? [],
    isLoading: loaded.isLoading,
    loadError: loaded.error,
    isSaving: saving.isRunning,
    saveError: saving.error?.message ?? null,
    setName,
    setSessionCount,
    updateSession,
    updateExercise,
    addExercise,
    removeExercise,
    save,
  }
}
