/**
 * Hook of the detail of one client.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useCallback } from 'react'
import { clientsService } from '@/services/clients.service'
import type { UpdateBodyProfileInput } from '@/types/client'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads one client and exposes the actions of its detail page.
 *
 * @param clientId - Identifier of the client; changing it loads another client.
 * @returns The `client` loaded (`null` until it arrives), the `isLoading` and `error` state,
 * `refetch`, and two actions with their state: `saveBodyProfile` (`isSavingProfile`,
 * `profileError`, `resetProfileError`) and `deactivate` (`isDeactivating`, `deactivateError`,
 * `resetDeactivateError`). Both actions resolve with an `ActionResult`.
 *
 * @example
 * ```tsx
 * const { client, isLoading, error, saveBodyProfile } = useClientDetail(clientId);
 * ```
 */
export function useClientDetail(clientId: string) {
  const load = useCallback((signal: AbortSignal) => clientsService.getById(clientId, signal), [clientId])
  const { data, isLoading, error, refetch } = useAsyncData(load, 'No pudimos cargar la ficha de este cliente.')

  const profile = useAsyncAction(
    clientsService.updateBodyProfile,
    'No pudimos guardar la ficha. Inténtalo nuevamente.',
  )
  const deactivation = useAsyncAction(
    clientsService.deactivate,
    'No pudimos desactivar a este cliente. Inténtalo de nuevo.',
  )

  const { run: runProfile } = profile
  const saveBodyProfile = useCallback(
    async (input: UpdateBodyProfileInput) => {
      const result = await runProfile(clientId, input)
      if (result.ok) refetch()
      return result
    },
    [runProfile, clientId, refetch],
  )

  const { run: runDeactivation } = deactivation
  const deactivate = useCallback(() => runDeactivation(clientId), [runDeactivation, clientId])

  return {
    client: data,
    isLoading,
    error,
    refetch,
    saveBodyProfile,
    isSavingProfile: profile.isRunning,
    profileError: profile.error?.message ?? null,
    resetProfileError: profile.reset,
    deactivate,
    isDeactivating: deactivation.isRunning,
    deactivateError: deactivation.error?.message ?? null,
    resetDeactivateError: deactivation.reset,
  }
}
