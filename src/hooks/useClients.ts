import { useCallback, useEffect, useState } from 'react'
import { clientsService } from '@/services/clients.service'
import type { ActivationCode, ClientStatusFilter, ClientSummary, RegisterClientInput } from '@/types/client'

export function useClients() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ClientStatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setClients(await clientsService.list(query, status))
    } catch {
      setError('No pudimos cargar tus clientes. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [query, status])

  useEffect(() => {
    let active = true
    clientsService.list(query, status)
      .then((result) => {
        if (active) setClients(result)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar tus clientes. Inténtalo nuevamente.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, status])

  const registerClient = useCallback(async (input: RegisterClientInput) => {
    const code = await clientsService.register(input)
    await loadClients()
    return code
  }, [loadClients])

  const regenerateCode = useCallback(async (clientId: string): Promise<ActivationCode> => {
    const code = await clientsService.regenerateCode(clientId)
    await loadClients()
    return code
  }, [loadClients])

  const clearFilters = useCallback(() => {
    setQuery('')
    setStatus('ALL')
  }, [])

  return {
    clients,
    query,
    status,
    isLoading,
    error,
    setQuery,
    setStatus,
    clearFilters,
    registerClient,
    regenerateCode,
    refetch: loadClients,
  }
}
