/**
 * Hook of the routines list.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import { routinesService } from '@/services/routines.service'
import { useAsyncData } from './useAsyncData'

/**
 * Loads the routines of the trainer with the clients that follow each one.
 *
 * @returns The `routines` loaded, the `isLoading` and `error` state, and `refetch` to reload.
 *
 * @example
 * ```tsx
 * const { routines, isLoading, error, refetch } = useRoutines();
 * ```
 */
export function useRoutines() {
  const { data, isLoading, error, refetch } = useAsyncData(
    routinesService.list,
    'No pudimos cargar tus rutinas. Inténtalo nuevamente.',
  )

  return { routines: data ?? [], isLoading, error, refetch }
}
