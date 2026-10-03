/**
 * Tests for the generic write action hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceError } from '@/services/service-error'
import { useAsyncAction } from './useAsyncAction'

describe('useAsyncAction', () => {
  it('resolves with the value of the action and passes its arguments', async () => {
    const action = vi.fn().mockResolvedValue('saved')
    const { result } = renderHook(() => useAsyncAction(action, 'Failed'))

    let outcome
    await act(async () => {
      outcome = await result.current.run('a', 1)
    })

    expect(action).toHaveBeenCalledWith('a', 1)
    expect(outcome).toEqual({ ok: true, value: 'saved' })
    expect(result.current).toMatchObject({ isRunning: false, error: null })
  })

  it('captures a service error with its code instead of throwing', async () => {
    const action = vi.fn().mockRejectedValue(new ServiceError('TAKEN', 'Ya existe.'))
    const { result } = renderHook(() => useAsyncAction(action, 'Failed'))

    let outcome
    await act(async () => {
      outcome = await result.current.run()
    })

    expect(outcome).toEqual({ ok: false, error: { message: 'Ya existe.', code: 'TAKEN' } })
    expect(result.current.error).toEqual({ message: 'Ya existe.', code: 'TAKEN' })
  })

  it('uses the fallback message for an unknown failure and clears it on reset', async () => {
    const action = vi.fn().mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAsyncAction(action, 'Failed'))

    await act(async () => {
      await result.current.run()
    })
    expect(result.current.error).toEqual({ message: 'Failed' })

    act(() => result.current.reset())
    expect(result.current.error).toBeNull()
  })
})
