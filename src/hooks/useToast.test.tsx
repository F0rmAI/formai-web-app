/**
 * Tests for the toast hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { lastLocation, withRouter } from '@/test/router'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows a message and hides it by itself', () => {
    const { result } = renderHook(() => useToast(), { wrapper: withRouter() })

    act(() => result.current.showToast('Guardado'))
    expect(result.current.toast).toEqual({ message: 'Guardado', tone: 'success' })

    act(() => vi.advanceTimersByTime(4000))
    expect(result.current.toast).toBeNull()
  })

  it('shows a message with the given tone and hides it on dismiss', () => {
    const { result } = renderHook(() => useToast(), { wrapper: withRouter() })

    act(() => result.current.showToast('Falló', 'error'))
    expect(result.current.toast?.tone).toBe('error')

    act(() => result.current.dismissToast())
    expect(result.current.toast).toBeNull()
  })

  it('shows the message left by the previous page and removes it from the history entry', () => {
    const wrapper = withRouter({ pathname: '/clients', state: { toast: 'Cuenta creada' } })

    const { result } = renderHook(() => useToast(), { wrapper })

    expect(result.current.toast).toEqual({ message: 'Cuenta creada', tone: 'success' })
    expect(lastLocation.state).toBeNull()
  })
})
