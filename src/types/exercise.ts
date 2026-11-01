/**
 * Domain types of the exercise catalog: the global exercises plus the trainer's own ones.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

/**
 * States of an exercise: available for new routines, or archived.
 */
export type ExerciseStatus = 'ACTIVE' | 'ARCHIVED'

/**
 * Where an exercise comes from: the global catalog shared by every trainer (read-only), or the
 * trainer's own exercises.
 */
export type ExerciseOrigin = 'GLOBAL' | 'OWN'

/**
 * Optional filters of the exercise list; a missing filter keeps every value.
 */
export interface ExerciseFilters {
  /** Muscle group to keep, one of the standard ones served by the backend. */
  muscleGroup?: string
  /** Origin to keep. */
  origin?: ExerciseOrigin
}

/**
 * Describes an exercise of the catalog.
 */
export interface Exercise {
  /** Unique identifier assigned by the server. */
  id: string
  /** Name of the exercise, unique within the catalog. */
  name: string
  /** Main muscle group it works. */
  muscleGroup: string
  /** Equipment or machine it needs, or `null` when it needs none. */
  equipment: string | null
  /** Whether it can be used in new routines. */
  status: ExerciseStatus
  /** Global catalog (read-only) or the trainer's own exercise. */
  origin: ExerciseOrigin
  /** Number of routines of the trainer that prescribe the exercise. */
  routineCount: number
}

/**
 * Data needed to create an exercise.
 */
export interface CreateExerciseInput {
  /** Name of the exercise. */
  name: string
  /** Main muscle group it works. */
  muscleGroup: string
  /** Equipment or machine it needs. */
  equipment?: string
}
