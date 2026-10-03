/**
 * Hook of the detail of one workout session.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import { useCallback } from 'react'
import { workoutsService } from '@/services/workouts.service'
import { useAsyncData } from './useAsyncData'

/**
 * Loads one workout session of a client with its exercises and recorded sets.
 *
 * @param clientId - Identifier of the client.
 * @param sessionId - Identifier of the session; changing it loads another session.
 * @returns The `session` loaded (`null` until it arrives), the `isLoading` and `error` state, and
 * `refetch` to reload.
 *
 * @example
 * ```tsx
 * const { session, isLoading, error, refetch } = useWorkoutDetail(clientId, sessionId);
 * ```
 */
export function useWorkoutDetail(clientId: string, sessionId: string) {
  const load = useCallback(
    (signal: AbortSignal) => workoutsService.getById(clientId, sessionId, signal),
    [clientId, sessionId],
  )
  const { data, isLoading, error, refetch } = useAsyncData(load, 'No pudimos abrir este entrenamiento.')

  return { session: data, isLoading, error, refetch }
}
