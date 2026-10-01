import { useCallback, useEffect, useMemo, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import type { WorkoutSessionSummary } from '@/types/workout'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function useClientWorkouts(clientId: string) {
  const [sessions, setSessions] = useState<WorkoutSessionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setSessions(await workoutsService.list(clientId))
    } catch {
      setError('No pudimos cargar los entrenamientos de este cliente.')
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    let active = true
    workoutsService
      .list(clientId)
      .then((result) => {
        if (active) setSessions(result)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar los entrenamientos de este cliente.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [clientId])

  const pendingSession = useMemo(() => {
    const today = todayIso()
    return (
      sessions.find((session) => session.status === 'PENDING' && session.scheduledFor === today) ??
      sessions.find((session) => session.status === 'PENDING') ??
      null
    )
  }, [sessions])

  return {
    sessions,
    pendingSession,
    isLoading,
    error,
    refetch: loadSessions,
  }
}
