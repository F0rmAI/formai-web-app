import { useCallback, useState } from 'react'

/** Contador simple: ejemplo del flujo Page → Hook de la arquitectura base. */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => setCount((value) => value + 1), [])
  const reset = useCallback(() => setCount(initialValue), [initialValue])

  return { count, increment, reset }
}
