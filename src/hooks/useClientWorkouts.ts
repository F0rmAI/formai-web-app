import { useCallback, useEffect, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import type { WorkoutSessionSummary } from '@/types/workout'

export interface SyncWorkoutsResult {
  sessions: WorkoutSessionSummary[]
  newCount: number
}

export function useClientWorkouts(clientId: string) {
  const [sessions, setSessions] = useState<WorkoutSessionSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await workoutsService.list(clientId)
      setSessions(result)
      setLastSyncedAt(new Date())
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
        if (active) {
          setSessions(result)
          setLastSyncedAt(new Date())
        }
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

  /** Refetch listado; reporta cuántas sesiones nuevas aparecieron (sync desde la app). */
  const syncSessions = useCallback(async (): Promise<SyncWorkoutsResult> => {
    setIsSyncing(true)
    setError(null)
    const previousIds = new Set(sessions.map((session) => session.id))
    try {
      const next = await workoutsService.list(clientId)
      const newCount = next.filter((session) => !previousIds.has(session.id)).length
      setSessions(next)
      setLastSyncedAt(new Date())
      return { sessions: next, newCount }
    } catch (err) {
      setError('No pudimos actualizar los entrenamientos de este cliente.')
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [clientId, sessions])

  return {
    sessions,
    isLoading,
    isSyncing,
    error,
    lastSyncedAt,
    refetch: loadSessions,
    syncSessions,
  }
}
