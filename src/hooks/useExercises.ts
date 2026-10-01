import { useCallback, useEffect, useState } from 'react'
import { exercisesService } from '@/services/exercises.service'
import type { CreateExerciseInput, Exercise, ExerciseStatus } from '@/types/exercise'

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [status, setStatus] = useState<ExerciseStatus>('ACTIVE')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadExercises = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setExercises(await exercisesService.list({ status }))
    } catch {
      setError('No pudimos cargar tus ejercicios. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    let active = true
    exercisesService
      .list({ status })
      .then((result) => {
        if (active) {
          setExercises(result)
          setError(null)
        }
      })
      .catch(() => {
        if (active) setError('No pudimos cargar tus ejercicios. Inténtalo nuevamente.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [status])

  const createExercise = useCallback(
    async (input: CreateExerciseInput) => {
      const created = await exercisesService.create(input)
      await loadExercises()
      return created
    },
    [loadExercises],
  )

  const archiveExercise = useCallback(
    async (exerciseId: string) => {
      const archived = await exercisesService.archive(exerciseId)
      await loadExercises()
      return archived
    },
    [loadExercises],
  )

  const restoreExercise = useCallback(
    async (exerciseId: string) => {
      const restored = await exercisesService.restore(exerciseId)
      await loadExercises()
      return restored
    },
    [loadExercises],
  )

  return {
    exercises,
    status,
    isLoading,
    error,
    setStatus,
    createExercise,
    archiveExercise,
    restoreExercise,
    refetch: loadExercises,
  }
}
