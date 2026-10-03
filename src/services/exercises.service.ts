/**
 * Service for the exercise catalog of a trainer.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'
import { apiClient } from './api-client'
import { type ErrorMapping, throwServiceError } from './service-error'

/**
 * Codes reported by {@link exercisesService}.
 *
 * @remarks
 * - `NAME_ALREADY_EXISTS`: the catalog already has an exercise with that name.
 * - `EXERCISE_NOT_FOUND`: the exercise does not exist or belongs to another trainer.
 * - `EXERCISE_IN_USE`: a routine uses the exercise; archive it instead.
 * - `UNEXPECTED`: any other failure.
 */
export type ExercisesErrorCode = 'NAME_ALREADY_EXISTS' | 'EXERCISE_NOT_FOUND' | 'EXERCISE_IN_USE' | 'UNEXPECTED'

/** Page size that fits the whole catalog of a trainer in one request. */
const PAGE_SIZE = 100

interface ExerciseResource {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  status: string
}

interface ExercisePageResource {
  content: ExerciseResource[]
}

interface RoutineUsageResource {
  sessions: { exercises: { exerciseId: string }[] }[]
}

interface RoutineUsagePageResource {
  content: RoutineUsageResource[]
  totalPages: number
}

function toExercise(resource: ExerciseResource, routineCount = 0): Exercise {
  return {
    id: resource.id,
    name: resource.name,
    muscleGroup: resource.muscleGroup,
    equipment: resource.equipment?.trim() || null,
    status: resource.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
    routineCount,
  }
}

// The exercise resource does not report its usage, so it is counted from the routines of the
// trainer: one per routine whose current version prescribes the exercise.
async function countRoutinesByExercise(signal?: AbortSignal): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  let totalPages = 1
  for (let page = 0; page < totalPages; page += 1) {
    const result = await apiClient.get<RoutineUsagePageResource>(`/routines?page=${page}&size=${PAGE_SIZE}`, {
      signal,
    })
    totalPages = Math.max(result.totalPages, 1)
    for (const routine of result.content) {
      const used = new Set(routine.sessions.flatMap((session) => session.exercises.map((item) => item.exerciseId)))
      for (const exerciseId of used) counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1)
    }
  }
  return counts
}

const NOT_FOUND: ErrorMapping<ExercisesErrorCode> = {
  code: 'EXERCISE_NOT_FOUND',
  message: 'No encontramos ese ejercicio.',
}
const UNEXPECTED: ErrorMapping<ExercisesErrorCode> = {
  code: 'UNEXPECTED',
  message: 'No pudimos completar la operación. Inténtalo de nuevo.',
}

/**
 * Calls the exercise endpoints of the backend.
 */
export const exercisesService = {
  /**
   * Fetches the exercises of the catalog with the given status.
   *
   * @param status - Status to keep.
   * @param signal - Signal used to cancel the request.
   * @returns The matching exercises with their routine usage; an empty array when there are none.
   * @throws {@link ServiceError} with an {@link ExercisesErrorCode} when the request fails.
   */
  async list(status: ExerciseStatus, signal?: AbortSignal): Promise<Exercise[]> {
    try {
      const [exercises, usage] = await Promise.all([
        apiClient.get<ExercisePageResource>(`/exercises?page=0&size=${PAGE_SIZE}&status=${status}`, { signal }),
        countRoutinesByExercise(signal).catch(() => new Map<string, number>()),
      ])
      return exercises.content.map((resource) => toExercise(resource, usage.get(resource.id) ?? 0))
    } catch (error) {
      throwServiceError(error, {}, UNEXPECTED)
    }
  },

  /**
   * Adds an exercise to the catalog.
   *
   * @param input - Name, muscle group and optional equipment.
   * @returns The exercise as stored by the server.
   * @throws {@link ServiceError} with code `NAME_ALREADY_EXISTS` when the name is taken.
   */
  async create(input: CreateExerciseInput): Promise<Exercise> {
    try {
      const created = await apiClient.post<ExerciseResource>('/exercises', {
        name: input.name.trim(),
        muscleGroup: input.muscleGroup.trim(),
        equipment: input.equipment?.trim() || null,
      })
      return toExercise(created)
    } catch (error) {
      throwServiceError<ExercisesErrorCode>(
        error,
        { 409: { code: 'NAME_ALREADY_EXISTS', message: 'Ya tienes un ejercicio con este nombre en tu catálogo.' } },
        UNEXPECTED,
      )
    }
  },

  /**
   * Archives an exercise so it no longer shows up when building routines.
   *
   * @param exerciseId - Identifier of the exercise.
   * @returns The archived exercise.
   * @throws {@link ServiceError} with code `EXERCISE_NOT_FOUND` when the exercise is not in the catalog.
   */
  async archive(exerciseId: string): Promise<Exercise> {
    try {
      return toExercise(await apiClient.post<ExerciseResource>(`/exercises/${exerciseId}/archivals`))
    } catch (error) {
      throwServiceError(error, { 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Restores an archived exercise.
   *
   * @param exerciseId - Identifier of the exercise.
   * @returns The restored exercise.
   * @throws {@link ServiceError} with code `EXERCISE_NOT_FOUND` when the exercise is not in the catalog.
   */
  async restore(exerciseId: string): Promise<Exercise> {
    try {
      return toExercise(await apiClient.post<ExerciseResource>(`/exercises/${exerciseId}/restorations`))
    } catch (error) {
      throwServiceError(error, { 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Deletes an exercise that no routine uses.
   *
   * @param exerciseId - Identifier of the exercise.
   * @throws {@link ServiceError} with code `EXERCISE_IN_USE` or `EXERCISE_NOT_FOUND`.
   */
  async remove(exerciseId: string): Promise<void> {
    try {
      await apiClient.delete(`/exercises/${exerciseId}`)
    } catch (error) {
      throwServiceError<ExercisesErrorCode>(error, {
        404: NOT_FOUND,
        409: { code: 'EXERCISE_IN_USE', message: 'Este ejercicio se usa en una rutina. Archívalo en lugar de eliminarlo.' },
      }, UNEXPECTED)
    }
  },
}
