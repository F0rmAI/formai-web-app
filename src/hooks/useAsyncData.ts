/**
 * Generic hook that loads data and exposes the request state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ServiceError } from '@/services/service-error'

/** Result of the last finished request. */
interface Settled<T> {
  request: unknown
  data: T | null
  error: string | null
}

/**
 * Loads data with a service call and exposes the request state.
 *
 * @remarks
 * The request is cancelled when the component unmounts or when `load` changes. While a new
 * request is running the previous data stays available, so a list does not blink when its filters
 * change. A view that shows one resource must be mounted with a `key` per resource, so it never
 * shows the data of the previous one.
 *
 * @typeParam T - Shape of the loaded data.
 * @param load - Service call that receives the abort signal; memoize it with `useCallback`, since a
 * new function triggers a new request.
 * @param fallbackMessage - Text exposed as `error` when the failure carries no message to show.
 * @returns The `data` loaded (`null` until the first response), the `isLoading` and `error`
 * state, `refetch` to reload and `setData` to apply a local change.
 *
 * @example
 * ```tsx
 * const load = useCallback((signal: AbortSignal) => itemsService.list(signal), []);
 * const { data, isLoading, error, refetch } = useAsyncData(load, 'Could not load the items.');
 * ```
 */
export function useAsyncData<T>(load: (signal: AbortSignal) => Promise<T>, fallbackMessage: string) {
  const [reloads, setReloads] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>({ request: null, data: null, error: null })
  // One object per request: its identity tells whether the settled result is the current one.
  const request = useMemo(() => ({ load, reloads }), [load, reloads])

  useEffect(() => {
    const controller = new AbortController()
    request
      .load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ request, data, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof ServiceError ? error.message : fallbackMessage
        setSettled((previous) => ({ request, data: previous.data, error: message }))
      })
    return () => controller.abort()
  }, [request, fallbackMessage])

  const refetch = useCallback(() => setReloads((count) => count + 1), [])

  const setData = useCallback(
    (update: (current: T) => T) =>
      setSettled((previous) => (previous.data === null ? previous : { ...previous, data: update(previous.data) })),
    [],
  )

  const isCurrent = settled.request === request
  return {
    data: settled.data,
    isLoading: !isCurrent,
    error: isCurrent ? settled.error : null,
    refetch,
    setData,
  }
}
