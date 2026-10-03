/**
 * Tests for the generic data loading hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceError } from '@/services/service-error'
import { useAsyncData } from './useAsyncData'

describe('useAsyncData', () => {
  it('exposes the loading state and then the data', async () => {
    const load = vi.fn().mockResolvedValue(['a'])

    const { result } = renderHook(() => useAsyncData(load, 'Failed'))

    expect(result.current).toMatchObject({ data: null, isLoading: true, error: null })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toEqual(['a'])
  })

  it('exposes the message of a service error and the fallback for any other failure', async () => {
    const failing = vi.fn().mockRejectedValue(new ServiceError('X', 'No existe.'))
    const crashing = vi.fn().mockRejectedValue(new Error('boom'))

    const first = renderHook(() => useAsyncData(failing, 'Failed'))
    const second = renderHook(() => useAsyncData(crashing, 'Failed'))

    await waitFor(() => expect(first.result.current.error).toBe('No existe.'))
    await waitFor(() => expect(second.result.current.error).toBe('Failed'))
  })

  it('loads again on refetch and keeps the previous data meanwhile', async () => {
    const load = vi.fn().mockResolvedValueOnce(['a']).mockResolvedValueOnce(['a', 'b'])
    const { result } = renderHook(() => useAsyncData(load, 'Failed'))
    await waitFor(() => expect(result.current.data).toEqual(['a']))

    act(() => result.current.refetch())

    expect(result.current).toMatchObject({ data: ['a'], isLoading: true })
    await waitFor(() => expect(result.current.data).toEqual(['a', 'b']))
  })

  it('cancels the request when the component unmounts', async () => {
    let signal: AbortSignal | undefined
    const load = vi.fn((received: AbortSignal) => {
      signal = received
      return new Promise<string[]>(() => {})
    })

    const { unmount } = renderHook(() => useAsyncData(load, 'Failed'))
    unmount()

    expect(signal?.aborted).toBe(true)
  })

  it('applies a local change to the loaded data', async () => {
    const load = vi.fn().mockResolvedValue([1, 2])
    const { result } = renderHook(() => useAsyncData<number[]>(load, 'Failed'))
    await waitFor(() => expect(result.current.data).toEqual([1, 2]))

    act(() => result.current.setData((current) => current.filter((value) => value !== 1)))

    expect(result.current.data).toEqual([2])
  })
})
