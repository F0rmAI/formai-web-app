import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'
import { ApiError, apiClient } from './api-client'
import {
  ExercisesServiceError,
  type ExercisesService,
  type ListExercisesParams,
} from './exercises.contract'

interface ExerciseResource {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  machineId: string | null
  status: string
}

interface ExercisePageResource {
  content: ExerciseResource[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface PrescribedExerciseResource {
  exerciseId: string
}

interface RoutineSessionResource {
  exercises: PrescribedExerciseResource[]
}

interface RoutineResource {
  id: string
  sessions: RoutineSessionResource[]
}

interface RoutinePageResource {
  content: RoutineResource[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const PAGE_SIZE = 100

function mapStatus(status: string): ExerciseStatus {
  return status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE'
}

function mapExercise(dto: ExerciseResource, routineCount = 0): Exercise {
  return {
    id: dto.id,
    name: dto.name,
    muscleGroup: dto.muscleGroup,
    equipment: dto.equipment?.trim() ? dto.equipment : null,
    status: mapStatus(dto.status),
    routineCount,
  }
}

/**
 * Workaround temporal: el API no expone routineCount en ExerciseResource.
 * Contamos rutinas distintas que incluyen cada exerciseId en la versión actual.
 */
async function fetchRoutineUsageByExerciseId(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  let page = 0
  let totalPages = 1

  while (page < totalPages) {
    const result = await apiClient.get<RoutinePageResource>(
      `/v1/routines?page=${page}&size=${PAGE_SIZE}`,
    )
    totalPages = Math.max(result.totalPages, 1)

    for (const routine of result.content) {
      const usedInRoutine = new Set<string>()
      for (const session of routine.sessions ?? []) {
        for (const prescribed of session.exercises ?? []) {
          if (prescribed.exerciseId) usedInRoutine.add(String(prescribed.exerciseId))
        }
      }
      for (const exerciseId of usedInRoutine) {
        counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1)
      }
    }

    page += 1
  }

  return counts
}

function userFacingMessage(error: ApiError, fallback: string): string {
  return error.message.trim() || fallback
}

function mapApiError(error: unknown, fallbackCode: ExercisesServiceError['code']): never {
  if (error instanceof ExercisesServiceError) throw error
  if (error instanceof ApiError) {
    if (error.status === 404) {
      throw new ExercisesServiceError('EXERCISE_NOT_FOUND', userFacingMessage(error, 'No encontramos ese ejercicio.'))
    }
    if (error.status === 409) {
      throw new ExercisesServiceError(
        'NAME_ALREADY_EXISTS',
        userFacingMessage(error, 'Ya tienes un ejercicio con este nombre.'),
      )
    }
    throw new ExercisesServiceError(
      fallbackCode,
      userFacingMessage(error, 'No pudimos completar la operación. Inténtalo de nuevo.'),
    )
  }
  throw new ExercisesServiceError(fallbackCode, 'No pudimos completar la operación. Inténtalo de nuevo.')
}

export function createHttpExercisesService(): ExercisesService {
  return {
    async list(params: ListExercisesParams = {}) {
      const page = params.page ?? 0
      const size = params.size ?? PAGE_SIZE
      const search = new URLSearchParams({
        page: String(page),
        size: String(size),
      })
      if (params.status) search.set('status', params.status)

      try {
        const [result, usage] = await Promise.all([
          apiClient.get<ExercisePageResource>(`/v1/exercises?${search.toString()}`),
          fetchRoutineUsageByExerciseId().catch(() => new Map<string, number>()),
        ])
        return result.content.map((dto) => mapExercise(dto, usage.get(dto.id) ?? 0))
      } catch (error) {
        mapApiError(error, 'UNEXPECTED')
      }
    },

    async create(input: CreateExerciseInput) {
      try {
        const created = await apiClient.post<ExerciseResource>('/v1/exercises', {
          name: input.name.trim(),
          muscleGroup: input.muscleGroup.trim(),
          equipment: input.equipment?.trim() || null,
        })
        return mapExercise(created, 0)
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          throw new ExercisesServiceError(
            'NAME_ALREADY_EXISTS',
            userFacingMessage(error, 'Ya tienes un ejercicio con este nombre.'),
          )
        }
        mapApiError(error, 'UNEXPECTED')
      }
    },

    async archive(exerciseId: string) {
      try {
        const archived = await apiClient.post<ExerciseResource>(`/v1/exercises/${exerciseId}/archivals`)
        return mapExercise(archived)
      } catch (error) {
        mapApiError(error, 'EXERCISE_NOT_FOUND')
      }
    },

    async restore(exerciseId: string) {
      try {
        const restored = await apiClient.post<ExerciseResource>(`/v1/exercises/${exerciseId}/restorations`)
        return mapExercise(restored)
      } catch (error) {
        mapApiError(error, 'EXERCISE_NOT_FOUND')
      }
    },
  }
}
