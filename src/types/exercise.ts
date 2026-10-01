export type ExerciseStatus = 'ACTIVE' | 'ARCHIVED'

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  status: ExerciseStatus
}

export interface CreateExerciseInput {
  name: string
  muscleGroup: string
  equipment?: string
}
