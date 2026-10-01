/**
 * Tests for the counter hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('starts at zero by default', () => {
    const { result } = renderHook(() => useCounter())

    expect(result.current.count).toBe(0)
  })

  it('adds one on increment', () => {
    const { result } = renderHook(() => useCounter(5))

    act(() => result.current.increment())

    expect(result.current.count).toBe(6)
  })

  it('goes back to the initial value on reset', () => {
    const { result } = renderHook(() => useCounter(2))

    act(() => result.current.increment())
    act(() => result.current.reset())

    expect(result.current.count).toBe(2)
  })
})
