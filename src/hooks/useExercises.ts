/**
 * Hook of the exercise catalog.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { exercisesService } from '@/services/exercises.service'
import type { CreateExerciseInput, Exercise, ExerciseFilters, ExerciseStatus } from '@/types/exercise'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the exercises available to the trainer (global catalog plus their own) by status, muscle
 * group and origin, the standard muscle groups, and exposes the actions to create, archive,
 * restore and remove their own exercises.
 *
 * @remarks
 * An archived or restored exercise stays in the list with its new status until the list is
 * loaded again, so the trainer sees the result of the action.
 *
 * @returns The `exercises` loaded, the `status` filter with `setStatus`, the `filters` (muscle
 * group and origin) with `setFilters`, the `muscleGroups` served by the backend, the `isLoading` and
 * `error` state, `refetch`, and the actions `createExercise` (`isCreating`, `createError`,
 * `resetCreateError`), `archiveExercise` and `restoreExercise` (`isChangingStatus`), and
 * `removeExercise` (`isRemoving`). Every action resolves with an `ActionResult`.
 *
 * @example
 * ```tsx
 * const { exercises, isLoading, error, archiveExercise } = useExercises();
 * ```
 */
export function useExercises() {
  const [status, setStatus] = useState<ExerciseStatus>('ACTIVE')
  const [filters, setFilters] = useState<ExerciseFilters>({})

  const load = useCallback(
    (signal: AbortSignal) => exercisesService.list(status, signal, filters),
    [status, filters],
  )
  const { data, isLoading, error, refetch, setData } = useAsyncData(
    load,
    'No pudimos cargar tus ejercicios. Inténtalo nuevamente.',
  )

  const muscleGroups = useAsyncData(exercisesService.muscleGroups, 'No pudimos cargar los grupos musculares.')

  const creation = useAsyncAction(exercisesService.create, 'No pudimos guardar el ejercicio. Inténtalo nuevamente.')
  const archival = useAsyncAction(exercisesService.archive, 'No pudimos archivar este ejercicio. Inténtalo de nuevo.')
  const restoration = useAsyncAction(exercisesService.restore, 'No pudimos restaurar este ejercicio.')
  const removal = useAsyncAction(exercisesService.remove, 'No pudimos eliminar este ejercicio.')

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

  const { run: runRemoval } = removal
  const removeExercise = useCallback(
    async (exerciseId: string) => {
      const result = await runRemoval(exerciseId)
      if (result.ok) refetch()
      return result
    },
    [runRemoval, refetch],
  )

  return {
    exercises: data ?? [],
    status,
    setStatus,
    filters,
    setFilters,
    muscleGroups: muscleGroups.data ?? [],
    isLoadingMuscleGroups: muscleGroups.isLoading,
    muscleGroupsError: muscleGroups.error,
    retryMuscleGroups: muscleGroups.refetch,
    isLoading,
    error,
    refetch,
    createExercise,
    isCreating: creation.isRunning,
    createError: creation.error?.message ?? null,
    resetCreateError: creation.reset,
    archiveExercise,
    restoreExercise,
    removeExercise,
    isRemoving: removal.isRunning,
    isChangingStatus: archival.isRunning || restoration.isRunning,
  }
}
