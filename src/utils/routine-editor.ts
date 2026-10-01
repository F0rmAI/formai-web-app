import type { EditorPrescribedExercise, Routine, RoutineEditorState, SaveRoutineInput } from '@/types/routine'

export function createLocalId(): string {
  return crypto.randomUUID()
}

export function createEmptyEditorState(): RoutineEditorState {
  return {
    name: '',
    sessions: [
      {
        localId: createLocalId(),
        label: 'Día A',
        exercises: [],
      },
    ],
  }
}

export function routineToEditorState(routine: Routine): RoutineEditorState {
  return {
    name: routine.name,
    sessions: routine.sessions.map((session) => ({
      localId: createLocalId(),
      label: session.label,
      exercises: session.exercises.map((exercise) => ({
        localId: createLocalId(),
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        targetLoadKg: exercise.targetLoadKg,
        restSeconds: exercise.restSeconds,
      })),
    })),
  }
}

export function editorStateToSaveInput(state: RoutineEditorState): SaveRoutineInput {
  return {
    name: state.name.trim(),
    sessions: state.sessions.map((session) => ({
      label: session.label.trim(),
      exercises: session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        targetLoadKg: exercise.targetLoadKg,
        restSeconds: exercise.restSeconds,
      })),
    })),
  }
}

export function validateEditorState(state: RoutineEditorState): string | null {
  if (!state.name.trim()) return 'Escribe un nombre para la rutina.'
  if (state.sessions.length === 0) return 'Agrega al menos una sesión.'
  for (const session of state.sessions) {
    if (!session.label.trim()) return 'Cada sesión necesita una etiqueta.'
    if (session.exercises.length === 0) return `“${session.label}” debe tener al menos un ejercicio.`
    for (const exercise of session.exercises) {
      if (exercise.sets <= 0 || exercise.reps <= 0) {
        return `Revisa series y repeticiones en “${exercise.exerciseName}”.`
      }
      if (exercise.targetLoadKg < 0 || exercise.restSeconds < 0) {
        return `Revisa carga y descanso en “${exercise.exerciseName}”.`
      }
    }
  }
  return null
}

export function createEditorExercise(
  exerciseId: string,
  exerciseName: string,
): EditorPrescribedExercise {
  return {
    localId: createLocalId(),
    exerciseId,
    exerciseName,
    sets: 3,
    reps: 10,
    targetLoadKg: 0,
    restSeconds: 90,
  }
}

export function defaultSessionLabel(index: number): string {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  if (index < labels.length) return `Día ${labels[index]}`
  return `Día ${index + 1}`
}
