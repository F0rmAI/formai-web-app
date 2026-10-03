/**
 * Hook of the clients list.
 *
 * @author Melina
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { clientsService } from '@/services/clients.service'
import type { ClientStatusFilter } from '@/types/client'
import { useAsyncAction } from './useAsyncAction'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the clients of the trainer with search and status filter, and registers new ones.
 *
 * @returns The `clients` loaded, the `query` and `status` filters with their setters,
 * `hasFilters` and `clearFilters`, the `isLoading` and `error` state, `refetch`, and two actions with their state:
 * `registerClient` (`isRegistering`, `registerError`, `resetRegisterError`) and `regenerateCode`
 * (`isRegenerating`, `regenerateError`, `resetRegenerateError`). Both actions resolve with an
 * `ActionResult` that carries the activation code.
 *
 * @example
 * ```tsx
 * const { clients, isLoading, error, registerClient } = useClients();
 * ```
 */
export function useClients() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ClientStatusFilter>('ALL')

  const load = useCallback((signal: AbortSignal) => clientsService.list(query, status, signal), [query, status])
  const { data, isLoading, error, refetch } = useAsyncData(load, 'No pudimos cargar tus clientes. Inténtalo nuevamente.')

  const registration = useAsyncAction(
    clientsService.register,
    'No pudimos registrar al cliente. Inténtalo nuevamente.',
  )
  const regeneration = useAsyncAction(
    clientsService.regenerateCode,
    'No pudimos generar un nuevo código. Inténtalo nuevamente.',
  )

  const { run: runRegistration } = registration
  const registerClient = useCallback(
    async (...args: Parameters<typeof clientsService.register>) => {
      const result = await runRegistration(...args)
      if (result.ok) refetch()
      return result
    },
    [runRegistration, refetch],
  )

  const { run: runRegeneration } = regeneration
  const regenerateCode = useCallback(
    async (clientId: string) => {
      const result = await runRegeneration(clientId)
      if (result.ok) refetch()
      return result
    },
    [runRegeneration, refetch],
  )

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus('ALL')
  }, [])

  return {
    clients: data ?? [],
    query,
    status,
    hasFilters: Boolean(query) || status !== 'ALL',
    isLoading,
    error,
    setQuery,
    setStatus,
    clearFilters,
    refetch,
    registerClient,
    isRegistering: registration.isRunning,
    registerError: registration.error?.message ?? null,
    resetRegisterError: registration.reset,
    regenerateCode,
    isRegenerating: regeneration.isRunning,
    regenerateError: regeneration.error?.message ?? null,
    resetRegenerateError: regeneration.reset,
  }
}
