/**
 * Hook of the detail of one routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback } from 'react'
import { clientsService } from '@/services/clients.service'
import { routinesService } from '@/services/routines.service'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads one routine and exposes the actions of its detail page: duplicate it and assign it.
 *
 * @remarks
 * Mount the view with a `key` per routine. The clients are loaded with every status because the
 * assignment form lists them all and explains which ones cannot receive a routine.
 *
 * @param routineId - Identifier of the routine.
 * @returns The `routine` loaded (`null` until it arrives), the `isLoading` and `error` state and
 * `refetch`; the `clients` of the trainer for the assignment form; and two actions with their
 * state: `duplicate` (`isDuplicating`, `duplicateError`, `resetDuplicateError`), which resolves
 * with the new routine, and `assign` (`isAssigning`, `assignError`, `resetAssignError`). Both
 * resolve with an `ActionResult`.
 *
 * @example
 * ```tsx
 * const { routine, isLoading, error, duplicate, assign } = useRoutine(routineId);
 * ```
 */
export function useRoutine(routineId: string) {
  const load = useCallback((signal: AbortSignal) => routinesService.getById(routineId, signal), [routineId])
  const { data, isLoading, error, refetch } = useAsyncData(load, 'No pudimos cargar esta rutina. Inténtalo nuevamente.')

  const loadClients = useCallback((signal: AbortSignal) => clientsService.list('', 'ALL', signal), [])
  const clients = useAsyncData(loadClients, 'No pudimos cargar tus clientes.')

  const duplication = useAsyncAction(
    routinesService.duplicate,
    'No pudimos duplicar esta rutina. Inténtalo de nuevo.',
  )
  const assignment = useAsyncAction(routinesService.assign, 'No pudimos asignar esta rutina. Inténtalo de nuevo.')

  const { run: runDuplication } = duplication
  const duplicate = useCallback((name: string) => runDuplication(routineId, name), [runDuplication, routineId])

  const { run: runAssignment } = assignment
  const { refetch: refetchClients } = clients
  const assign = useCallback(
    async (clientIds: string[], startDate: string) => {
      const result = await runAssignment(routineId, { clientIds, startDate })
      if (result.ok) {
        refetch()
        refetchClients()
      }
      return result
    },
    [runAssignment, routineId, refetch, refetchClients],
  )

  return {
    routine: data,
    isLoading,
    error,
    refetch,
    clients: clients.data ?? [],
    duplicate,
    isDuplicating: duplication.isRunning,
    duplicateError: duplication.error?.message ?? null,
    resetDuplicateError: duplication.reset,
    assign,
    isAssigning: assignment.isRunning,
    assignError: assignment.error?.message ?? null,
    resetAssignError: assignment.reset,
  }
}
