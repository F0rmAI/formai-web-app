/**
 * Hook of the exercise catalog.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { exercisesService } from '@/services/exercises.service'
import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the exercises of the catalog by status and exposes the actions to create, archive and
 * restore them.
 *
 * @remarks
 * An archived or restored exercise stays in the list with its new status until the list is
 * loaded again, so the trainer sees the result of the action.
 *
 * @returns The `exercises` loaded, the `status` filter with `setStatus`, the `isLoading` and
 * `error` state, `refetch`, and the actions `createExercise` (`isCreating`, `createError`,
 * `resetCreateError`), `archiveExercise` and `restoreExercise` (`isChangingStatus`). Every action
 * resolves with an `ActionResult` that carries the exercise.
 *
 * @example
 * ```tsx
 * const { exercises, isLoading, error, archiveExercise } = useExercises();
 * ```
 */
export function useExercises() {
  const [status, setStatus] = useState<ExerciseStatus>('ACTIVE')

  const load = useCallback((signal: AbortSignal) => exercisesService.list(status, signal), [status])
  const { data, isLoading, error, refetch, setData } = useAsyncData(
    load,
    'No pudimos cargar tus ejercicios. Inténtalo nuevamente.',
  )

  const creation = useAsyncAction(exercisesService.create, 'No pudimos guardar el ejercicio. Inténtalo nuevamente.')
  const archival = useAsyncAction(exercisesService.archive, 'No pudimos archivar este ejercicio. Inténtalo de nuevo.')
  const restoration = useAsyncAction(exercisesService.restore, 'No pudimos restaurar este ejercicio.')

  const { run: runCreation } = creation
  const createExercise = useCallback(
    async (input: CreateExerciseInput) => {
      const result = await runCreation(input)
      if (result.ok) refetch()
      return result
    },
    [runCreation, refetch],
  )

  /** Replaces the status of one exercise in the loaded list, keeping its routine usage. */
  const applyStatus = useCallback(
    (changed: Exercise) =>
      setData((current) =>
        current.map((exercise) => (exercise.id === changed.id ? { ...exercise, status: changed.status } : exercise)),
      ),
    [setData],
  )

  const { run: runArchival } = archival
  const archiveExercise = useCallback(
    async (exerciseId: string) => {
      const result = await runArchival(exerciseId)
      if (result.ok) applyStatus(result.value)
      return result
    },
    [runArchival, applyStatus],
  )

  const { run: runRestoration } = restoration
  const restoreExercise = useCallback(
    async (exerciseId: string) => {
      const result = await runRestoration(exerciseId)
      if (result.ok) applyStatus(result.value)
      return result
    },
    [runRestoration, applyStatus],
  )

  return {
    exercises: data ?? [],
    status,
    setStatus,
    isLoading,
    error,
    refetch,
    createExercise,
    isCreating: creation.isRunning,
    createError: creation.error?.message ?? null,
    resetCreateError: creation.reset,
    archiveExercise,
    restoreExercise,
    isChangingStatus: archival.isRunning || restoration.isRunning,
  }
}
