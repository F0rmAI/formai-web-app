import { useCallback, useEffect, useState } from 'react'
import { clientsService } from '@/services/clients.service'
import type { ClientDetail, UpdateBodyProfileInput } from '@/types/client'

export function useClientDetail(clientId: string) {
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClient = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setClient(await clientsService.getById(clientId))
    } catch {
      setError('No pudimos cargar la ficha de este cliente.')
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    let active = true
    clientsService.getById(clientId)
      .then((result) => {
        if (active) setClient(result)
      })
      .catch(() => {
        if (active) setError('No pudimos cargar la ficha de este cliente.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [clientId])

  const updateBodyProfile = useCallback(async (input: UpdateBodyProfileInput) => {
    const updatedClient = await clientsService.updateBodyProfile(clientId, input)
    setClient(updatedClient)
  }, [clientId])

  return { client, isLoading, error, updateBodyProfile, refetch: loadClient }
}
