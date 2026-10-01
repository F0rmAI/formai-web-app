/**
 * Domain types of the exercise catalog of a trainer.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

/**
 * States of an exercise: available for new routines, or archived.
 */
export type ExerciseStatus = 'ACTIVE' | 'ARCHIVED'

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
