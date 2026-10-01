import { useCallback, useEffect, useMemo, useState } from 'react'
import { filterRoutinesByStatus } from '@/services/routines.contract'
import { routinesService } from '@/services/routines.service'
import type { Routine, RoutineStatusFilter } from '@/types/routine'

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [status, setStatus] = useState<RoutineStatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoutines = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setRoutines(await routinesService.list())
    } catch {
      setError('No pudimos cargar tus rutinas. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    routinesService
      .list()
      .then((result) => {
        if (active) {
          setRoutines(result)
          setError(null)
        }
      })
      .catch(() => {
        if (active) setError('No pudimos cargar tus rutinas. Inténtalo nuevamente.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredRoutines = useMemo(() => filterRoutinesByStatus(routines, status), [routines, status])

  return {
    routines: filteredRoutines,
    allRoutines: routines,
    status,
    isLoading,
    error,
    setStatus,
    refetch: loadRoutines,
  }
}
