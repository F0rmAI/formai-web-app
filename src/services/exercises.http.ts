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

const PAGE_SIZE = 100

function mapStatus(status: string): ExerciseStatus {
  return status === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE'
}

function mapExercise(dto: ExerciseResource): Exercise {
  return {
    id: dto.id,
    name: dto.name,
    muscleGroup: dto.muscleGroup,
    equipment: dto.equipment?.trim() ? dto.equipment : null,
    status: mapStatus(dto.status),
  }
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
        const result = await apiClient.get<ExercisePageResource>(`/v1/exercises?${search.toString()}`)
        return result.content.map(mapExercise)
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
        return mapExercise(created)
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
