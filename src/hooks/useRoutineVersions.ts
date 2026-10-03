/**
 * Hook of the version history of one routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback, useMemo } from 'react'
import { useAuth } from '@/context/useAuth'
import { routinesService } from '@/services/routines.service'
import { useAsyncData } from './useAsyncData'

/**
 * Loads one routine with its saved versions.
 *
 * @remarks
 * Mount the view with a `key` per routine. The backend reports the author of a version as a user
 * id; the versions saved by the signed-in trainer show the name of the trainer instead.
 *
 * @param routineId - Identifier of the routine.
 * @returns The `routine` and its `versions`, newest first (`null` and empty until they arrive);
 * the `isLoading` and `error` state; and `refetch` to reload.
 *
 * @example
 * ```tsx
 * const { routine, versions, isLoading, error } = useRoutineVersions(routineId);
 * ```
 */
export function useRoutineVersions(routineId: string) {
  const load = useCallback(
    async (signal: AbortSignal) => {
      const [routine, versions] = await Promise.all([
        routinesService.getById(routineId, signal),
        routinesService.getVersions(routineId, signal),
      ])
      return { routine, versions }
    },
    [routineId],
  )
  const { data, isLoading, error, refetch } = useAsyncData(load, 'No pudimos cargar el historial de versiones.')

  const { user } = useAuth()
  const versions = useMemo(() => {
    const ownName = user?.fullName ?? user?.email.split('@')[0]
    return (data?.versions ?? []).map((version) =>
      user && ownName && version.author === user.id ? { ...version, author: ownName } : version,
    )
  }, [data, user])

  return { routine: data?.routine ?? null, versions, isLoading, error, refetch }
}
