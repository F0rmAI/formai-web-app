import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'

export type ExercisesServiceErrorCode =
  | 'NAME_ALREADY_EXISTS'
  | 'EXERCISE_NOT_FOUND'
  | 'UNEXPECTED'

/**
 * Error estable de la capa de ejercicios.
 * Los adaptadores traducen errores HTTP a estos códigos.
 */
export class ExercisesServiceError extends Error {
  readonly code: ExercisesServiceErrorCode

  constructor(code: ExercisesServiceErrorCode, message: string) {
    super(message)
    this.name = 'ExercisesServiceError'
    this.code = code
  }
}

export interface ListExercisesParams {
  status?: ExerciseStatus
  page?: number
  size?: number
}

/** Contrato que consumen los hooks. */
export interface ExercisesService {
  list(params?: ListExercisesParams): Promise<Exercise[]>
  create(input: CreateExerciseInput): Promise<Exercise>
  archive(exerciseId: string): Promise<Exercise>
  restore(exerciseId: string): Promise<Exercise>
}
