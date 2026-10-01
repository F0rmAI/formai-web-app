/**
 * Generic hook that runs a write action and exposes its state.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'
import { ServiceError } from '@/services/service-error'

/**
 * Describes why an action failed.
 */
export interface ActionError {
  /** Text ready to show to the user. */
  message: string
  /** Domain code reported by the service, when there is one. */
  code?: string
}

/**
 * Outcome of an action: the value it resolved with, or why it failed.
 *
 * @typeParam T - Value the action resolves with.
 */
export type ActionResult<T> = { ok: true; value: T } | { ok: false; error: ActionError }

/**
 * Runs a write action of a service and exposes whether it is running and why it failed.
 *
 * @remarks
 * The failure is captured, never thrown, so pages and components need no `try/catch`.
 *
 * @typeParam TArgs - Arguments of the action.
 * @typeParam TResult - Value the action resolves with.
 * @param action - Service call to run; memoize it with `useCallback`.
 * @param fallbackMessage - Text exposed in `error` when the failure carries no message to show.
 * @returns `run`, which resolves with an {@link ActionResult}; the `isRunning` and `error` state;
 * and `reset` to clear the error.
 *
 * @example
 * ```tsx
 * const { run, isRunning, error } = useAsyncAction(itemsService.create, 'Could not save the item.');
 * const result = await run(input);
 * if (result.ok) close();
 * ```
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  fallbackMessage: string,
) {
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<ActionError | null>(null)

  const run = useCallback(
    async (...args: TArgs): Promise<ActionResult<TResult>> => {
      setIsRunning(true)
      setError(null)
      try {
        return { ok: true, value: await action(...args) }
      } catch (caught) {
        const failure: ActionError =
          caught instanceof ServiceError ? { message: caught.message, code: caught.code } : { message: fallbackMessage }
        setError(failure)
        return { ok: false, error: failure }
      } finally {
        setIsRunning(false)
      }
    },
    [action, fallbackMessage],
  )

  const reset = useCallback(() => setError(null), [])

  return { run, isRunning, error, reset }
}
