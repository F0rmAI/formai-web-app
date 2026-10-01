import { createHttpWorkoutsService } from './workouts.http'

export { WorkoutsServiceError } from './workouts.contract'
export type { WorkoutsService, WorkoutsServiceErrorCode } from './workouts.contract'

/** Punto único de composición para seguimiento de entrenamientos (formai-api). */
export const workoutsService = createHttpWorkoutsService()
