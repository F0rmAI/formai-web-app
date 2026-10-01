export type ExerciseStatus = 'ACTIVE' | 'ARCHIVED'

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  status: ExerciseStatus
  /** Rutinas del trainer que incluyen el ejercicio (derivado en front hasta que el API lo exponga). */
  routineCount: number
}

export interface CreateExerciseInput {
  name: string
  muscleGroup: string
  equipment?: string
}
