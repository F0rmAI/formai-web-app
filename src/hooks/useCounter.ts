/**
 * Counter hook used by the starter view.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { useCallback, useState } from 'react'

/**
 * Keeps a numeric counter and exposes the actions that change it.
 *
 * @param initialValue - Value the counter starts with and returns to on reset.
 * @returns The current `count`, `increment` to add one and `reset` to go back to the initial value.
 *
 * @example
 * ```tsx
 * const { count, increment, reset } = useCounter();
 * ```
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => setCount((value) => value + 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])

  return { count, increment, reset }
}
