import { createHttpExercisesService } from './exercises.http'

export { ExercisesServiceError } from './exercises.contract'
export type {
  ExercisesService,
  ExercisesServiceErrorCode,
  ListExercisesParams,
} from './exercises.contract'

/** Punto único de composición para el catálogo de ejercicios del entrenador. */
export const exercisesService = createHttpExercisesService()
