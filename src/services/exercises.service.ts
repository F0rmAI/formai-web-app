/**
 * Service for the exercise catalog: the global exercises plus the trainer's own ones.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type { CreateExerciseInput, Exercise, ExerciseFilters, ExerciseStatus } from '@/types/exercise'
import { apiClient } from './api-client'
import { type ErrorMapping, throwServiceError } from './service-error'

/**
 * Codes reported by {@link exercisesService}.
 *
 * @remarks
 * - `NAME_ALREADY_EXISTS`: the global catalog or the trainer's own exercises already have that name.
 * - `INVALID_MUSCLE_GROUP`: the muscle group is not one of the standard ones.
 * - `EXERCISE_NOT_FOUND`: the exercise does not exist or belongs to another trainer.
 * - `EXERCISE_IN_USE`: a routine uses the exercise; archive it instead.
 * - `UNEXPECTED`: any other failure.
 */
export type ExercisesErrorCode =
  | 'NAME_ALREADY_EXISTS'
  | 'INVALID_MUSCLE_GROUP'
  | 'EXERCISE_NOT_FOUND'
  | 'EXERCISE_IN_USE'
  | 'UNEXPECTED'

/** Largest page the backend serves. */
const PAGE_SIZE = 100

interface ExerciseResource {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  status: string
  origin: string
  routineCount: number
}

interface ExercisePageResource {
  content: ExerciseResource[]
  totalPages: number
}

function toExercise(resource: ExerciseResource): Exercise {
  return {
    id: resource.id,
    name: resource.name,
    muscleGroup: resource.muscleGroup,
    equipment: resource.equipment?.trim() || null,
    status: resource.status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
    origin: resource.origin === 'GLOBAL' ? 'GLOBAL' : 'OWN',
    routineCount: resource.routineCount ?? 0,
  }
}

function toListPath(status: ExerciseStatus, filters: ExerciseFilters, page: number): string {
  const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE), status })
  if (filters.muscleGroup) params.set('muscleGroup', filters.muscleGroup)
  if (filters.origin) params.set('origin', filters.origin)
  return `/exercises?${params.toString()}`
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
   * Fetches every exercise available to the trainer with the given status: the global catalog
   * and their own exercises, each with the number of their routines that prescribe it.
   *
   * @param status - Status to keep.
   * @param signal - Signal used to cancel the request.
   * @param filters - Optional muscle group and origin to keep.
   * @returns The matching exercises sorted by name; an empty array when there are none.
   * @throws {@link ServiceError} with an {@link ExercisesErrorCode} when the request fails.
   */
  async list(status: ExerciseStatus, signal?: AbortSignal, filters: ExerciseFilters = {}): Promise<Exercise[]> {
    try {
      const exercises: Exercise[] = []
      let totalPages = 1
      for (let page = 0; page < totalPages; page += 1) {
        const result = await apiClient.get<ExercisePageResource>(toListPath(status, filters, page), { signal })
        totalPages = Math.max(result.totalPages, 1)
        exercises.push(...result.content.map(toExercise))
      }
      return exercises
    } catch (error) {
      throwServiceError(error, {}, UNEXPECTED)
    }
  },

  /**
   * Fetches the standard muscle groups an exercise is filed under.
   *
   * @param signal - Signal used to cancel the request.
   * @returns The muscle groups in display order.
   * @throws {@link ServiceError} with code `UNEXPECTED` when the request fails.
   */
  async muscleGroups(signal?: AbortSignal): Promise<string[]> {
    try {
      return await apiClient.get<string[]>('/muscle-groups', { signal })
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
        {
          409: {
            code: 'NAME_ALREADY_EXISTS',
            message: 'Ya existe un ejercicio con este nombre en el catálogo global o en tus ejercicios.',
          },
          422: { code: 'INVALID_MUSCLE_GROUP', message: 'Elige uno de los grupos musculares de la lista.' },
        },
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
