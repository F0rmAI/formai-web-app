/**
 * Domain types of the routines a trainer designs and assigns.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

/**
 * Lifecycle states of a routine.
 *
 * @remarks
 * - `DRAFT`: saved but not assigned to any client.
 * - `ACTIVE`: assigned to at least one client.
 * - `CLOSED`: no longer followed by any client; kept as history.
 */
export type RoutineStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'

/**
 * Describes one exercise prescribed in a session.
 */
export interface PrescribedExercise {
  /** Identifier of the exercise in the catalog. */
  exerciseId: string
  /** Name of the exercise. */
  exerciseName: string
  /** Number of sets, greater than `0`. */
  sets: number
  /** Repetitions per set, greater than `0`. */
  reps: number
  /** Target load in kilograms. */
  targetLoadKg: number
  /** Rest between sets, in seconds. */
  restSeconds: number
}

/**
 * Describes one training day of a routine.
 */
export interface RoutineSession {
  /** Position of the session within the week, starting at `1`. */
  order: number
  /** Name of the session, such as `Día A · Empuje`. */
  label: string
  /** Exercises prescribed, in order. */
  exercises: PrescribedExercise[]
}

/**
 * Describes a routine with its current version.
 */
export interface Routine {
  /** Unique identifier assigned by the server. */
  id: string
  /** Name of the routine. */
  name: string
  /** Lifecycle state. */
  status: RoutineStatus
  /** Number of the current version, starting at `1`. */
  currentVersion: number
  /** Sessions of the current version; one per training day of the week. */
  sessions: RoutineSession[]
  /** Creation date, already formatted. */
  createdAtLabel: string
  /** Names of the clients that follow the routine today. */
  assignedClients: string[]
}

/**
 * Describes one saved version of a routine.
 */
export interface RoutineVersion {
  /** Number of the version, starting at `1`. */
  number: number
  /** Date and time the version was saved, already formatted. */
  changedAtLabel: string
  /** Name of who saved the version. */
  author: string
  /** Sessions as they were in this version. */
  sessions: RoutineSession[]
}

/**
 * Data sent to create or update a routine.
 */
export interface SaveRoutineInput {
  /** Name of the routine. */
  name: string
  /** Sessions with their prescribed exercises. */
  sessions: {
    /** Name of the session. */
    label: string
    /** Exercises prescribed, in order. */
    exercises: Omit<PrescribedExercise, 'exerciseName'>[]
  }[]
}

/**
 * Data sent to assign a routine.
 */
export interface AssignRoutineInput {
  /** Identifiers of the clients that receive the routine. */
  clientIds: string[]
  /** First day of the assignment, in `YYYY-MM-DD` format. */
  startDate: string
}

/**
 * Describes a prescribed exercise while it is edited in the routine form.
 *
 * @remarks
 * Numbers are kept as text so the fields can be empty or partially typed; they are parsed when
 * the routine is saved.
 */
export interface EditorExercise {
  /** Identifier that only exists in the form, used as list key. */
  localId: string
  /** Identifier of the exercise in the catalog; empty until one is chosen. */
  exerciseId: string
  /** Text of the sets field. */
  sets: string
  /** Text of the repetitions field. */
  reps: string
  /** Text of the load field, in kilograms. */
  targetLoadKg: string
  /** Text of the rest field, in seconds. */
  restSeconds: string
}

/**
 * Describes a session while it is edited in the routine form.
 */
export interface EditorSession {
  /** Identifier that only exists in the form, used as list key. */
  localId: string
  /** Name of the session. */
  label: string
  /** Exercises of the session, in order. */
  exercises: EditorExercise[]
}

/**
 * Describes the routine form.
 */
export interface RoutineEditorState {
  /** Name of the routine. */
  name: string
  /** Sessions of the routine, in order. */
  sessions: EditorSession[]
}

/**
 * Validation messages of the routine form, keyed by what they belong to.
 */
export interface RoutineEditorErrors {
  /** Message for the name field. */
  name?: string
  /** Messages for sessions and exercise fields, keyed by `localId` and field name. */
  fields: Record<string, string>
}
