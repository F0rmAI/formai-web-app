import { useCallback, useEffect, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import type { WorkoutSession } from '@/types/workout'

export function useWorkoutDetail(clientId: string, sessionId: string) {
  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setSession(await workoutsService.getById(clientId, sessionId))
    } catch {
      setError('No pudimos abrir este entrenamiento.')
    } finally {
      setIsLoading(false)
    }
  }, [clientId, sessionId])

  useEffect(() => {
    let active = true
    workoutsService
      .getById(clientId, sessionId)
      .then((result) => {
        if (active) setSession(result)
      })
      .catch(() => {
        if (active) setError('No pudimos abrir este entrenamiento.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [clientId, sessionId])

  return {
    session,
    isLoading,
    error,
    refetch: loadSession,
  }
}
