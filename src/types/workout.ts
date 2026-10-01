export type WorkoutSessionStatus = 'PENDING' | 'COMPLETED' | 'PARTIAL' | 'SKIPPED'

export interface WorkoutSet {
  setNumber: number
  loadKg: number
  reps: number
  recordedAt: string | null
}

export interface WorkoutExercise {
  exerciseId: string
  exerciseName: string
  targetSets: number
  targetReps: number
  targetLoadKg: number
  sets: WorkoutSet[]
}

export interface WorkoutSession {
  id: string
  clientId: string
  scheduledFor: string
  dayLabel: string
  routineVersion: number
  status: WorkoutSessionStatus
  totalVolumeKg: number
  finishedAt: string | null
  exercises: WorkoutExercise[]
}

export interface WorkoutSessionSummary {
  id: string
  scheduledFor: string
  dayLabel: string
  status: WorkoutSessionStatus
  totalVolumeKg: number
}

export interface RecordSetInput {
  exerciseId: string
  setNumber: number
  loadKg: number
  reps: number
}

export interface ExerciseMetric {
  exerciseId: string
  exerciseName: string
  firstMaxLoadKg: number
  lastMaxLoadKg: number
  firstVolumeKg: number
  lastVolumeKg: number
}

export interface ProgressReport {
  clientId: string
  from: string
  to: string
  adherencePercentage: number
  scheduled: number
  completed: number
  partial: number
  skipped: number
  exercises: ExerciseMetric[]
  hasData: boolean
}

export interface ProgressPoint {
  date: string
  maxLoadKg: number
  volumeKg: number
}

export interface ProgressChart {
  exerciseId: string
  weeks: 4 | 8 | 12
  enoughData: boolean
  points: ProgressPoint[]
}

export type ProgressWeeks = 4 | 8 | 12
