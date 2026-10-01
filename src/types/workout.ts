/**
 * Domain types of the workouts a client records and the progress derived from them.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

/**
 * States of a scheduled workout session.
 *
 * @remarks
 * - `PENDING`: scheduled and not finished yet.
 * - `COMPLETED`: every exercise was recorded.
 * - `PARTIAL`: finished with exercises left to record.
 * - `SKIPPED`: the day passed without records.
 */
export type WorkoutSessionStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'SKIPPED'

/**
 * Describes one recorded set.
 */
export interface WorkoutSet {
  /** Position of the set within the exercise, starting at `1`. */
  setNumber: number
  /** Load lifted, in kilograms. */
  loadKg: number
  /** Repetitions done. */
  reps: number
}

/**
 * Describes one exercise of a workout session with its recorded sets.
 */
export interface WorkoutExercise {
  /** Identifier of the exercise in the catalog. */
  exerciseId: string
  /** Name of the exercise. */
  exerciseName: string
  /** Sets recorded by the client, in order. */
  sets: WorkoutSet[]
}

/**
 * Describes a workout session as shown in lists.
 */
export interface WorkoutSessionSummary {
  /** Unique identifier assigned by the server. */
  id: string
  /** Day the session was scheduled for, in `YYYY-MM-DD` format. */
  scheduledFor: string
  /** Name of the routine session, such as `Día D · Hombros y core`. */
  dayLabel: string
  /** State of the session. */
  status: WorkoutSessionStatus
  /** Total volume lifted, in kilograms. */
  totalVolumeKg: number
  /** Date and time the client finished the session, in ISO 8601 format, or `null`. */
  finishedAt: string | null
}

/**
 * Describes a workout session with its exercises.
 */
export interface WorkoutSession extends WorkoutSessionSummary {
  /** Version of the routine the session was scheduled from. */
  routineVersion: number
  /** Exercises of the session, in order. */
  exercises: WorkoutExercise[]
}

/**
 * Describes how one exercise changed between the first and the last session of a period.
 */
export interface ExerciseMetric {
  /** Identifier of the exercise in the catalog. */
  exerciseId: string
  /** Name of the exercise. */
  exerciseName: string
  /** Maximum load of the first session, in kilograms. */
  firstMaxLoadKg: number
  /** Maximum load of the last session, in kilograms. */
  lastMaxLoadKg: number
  /** Volume of the first session, in kilograms. */
  firstVolumeKg: number
  /** Volume of the last session, in kilograms. */
  lastVolumeKg: number
}

/**
 * Describes the adherence of a client in a period.
 */
export interface ProgressReport {
  /** Share of scheduled sessions the client trained, from `0` to `100`. */
  adherencePercentage: number
  /** Sessions scheduled in the period. */
  scheduled: number
  /** Sessions completed. */
  completed: number
  /** Sessions finished with exercises left to record. */
  partial: number
  /** Sessions without records. */
  skipped: number
  /** Change per exercise recorded in the period. */
  exercises: ExerciseMetric[]
}

/**
 * Describes one point of the evolution chart.
 */
export interface ProgressPoint {
  /** Date of the session, in `YYYY-MM-DD` format. */
  date: string
  /** Maximum load of the session, in kilograms. */
  maxLoadKg: number
  /** Volume of the session, in kilograms. */
  volumeKg: number
}

/**
 * Describes the evolution of one exercise over time.
 */
export interface ProgressChart {
  /** Whether there are at least two sessions to compare. */
  enoughData: boolean
  /** Sessions of the exercise, oldest first. */
  points: ProgressPoint[]
}

/**
 * Lengths, in weeks, of the periods the progress view can show.
 */
export type ProgressWeeks = 4 | 8 | 12
