export type RoutineStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'

export type RoutineStatusFilter = 'ALL' | RoutineStatus

export interface PrescribedExercise {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  targetLoadKg: number
  restSeconds: number
}

export interface RoutineSession {
  order: number
  label: string
  exercises: PrescribedExercise[]
}

export interface Routine {
  id: string
  name: string
  status: RoutineStatus
  currentVersion: number
  sessions: RoutineSession[]
  createdAt: string
  createdAtLabel: string
}

export interface RoutineVersion {
  number: number
  changedAt: string
  changedAtLabel: string
  author: string
  sessions: RoutineSession[]
}

export interface RoutineAssignment {
  clientId: string
  routineId: string
  routineName: string
  startDate: string
  endDate: string | null
  current: boolean
}

export interface SaveRoutineInput {
  name: string
  sessions: {
    label: string
    exercises: {
      exerciseId: string
      sets: number
      reps: number
      targetLoadKg: number
      restSeconds: number
    }[]
  }[]
}

export interface DuplicateRoutineInput {
  name: string
}

export interface AssignRoutineInput {
  clientIds: string[]
  startDate: string
}

/** Estado local del editor con ids temporales para sesiones y ejercicios. */
export interface EditorPrescribedExercise {
  localId: string
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  targetLoadKg: number
  restSeconds: number
}

export interface EditorSession {
  localId: string
  label: string
  exercises: EditorPrescribedExercise[]
}

export interface RoutineEditorState {
  name: string
  sessions: EditorSession[]
}
