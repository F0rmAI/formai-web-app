/**
 * Hook of the workouts of one client.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback, useRef, useState } from 'react'
import { workoutsService } from '@/services/workouts.service'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the workout sessions a client recorded in the mobile app and lets the trainer bring the
 * new ones.
 *
 * @param clientId - Identifier of the client; changing it loads the sessions of another client.
 * @returns The `sessions` loaded, newest first; the `isLoading` and `error` state; `refetch`;
 * `lastSyncedAt`, the moment of the last successful load; and `sync` (`isSyncing`), which loads
 * the sessions again and resolves with an `ActionResult` that carries how many are new.
 *
 * @example
 * ```tsx
 * const { sessions, isLoading, error, sync, isSyncing } = useClientWorkouts(clientId);
 * ```
 */
export function useClientWorkouts(clientId: string) {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const knownIds = useRef(new Set<string>())

  const load = useCallback(
    async (signal: AbortSignal) => {
      const sessions = await workoutsService.list(clientId, signal)
      knownIds.current = new Set(sessions.map((session) => session.id))
      setLastSyncedAt(new Date())
      return sessions
    },
    [clientId],
  )
  const { data, isLoading, error, refetch, setData } = useAsyncData(
    load,
    'No pudimos cargar los entrenamientos de este cliente.',
  )

  const syncAction = useCallback(async () => {
    const sessions = await workoutsService.list(clientId)
    const newCount = sessions.filter((session) => !knownIds.current.has(session.id)).length
    knownIds.current = new Set(sessions.map((session) => session.id))
    setData(() => sessions)
    setLastSyncedAt(new Date())
    return newCount
  }, [clientId, setData])
  const synchronization = useAsyncAction(syncAction, 'No pudimos sincronizar los entrenamientos.')

  return {
    sessions: data ?? [],
    isLoading,
    error,
    refetch,
    lastSyncedAt,
    sync: synchronization.run,
    isSyncing: synchronization.isRunning,
  }
}
