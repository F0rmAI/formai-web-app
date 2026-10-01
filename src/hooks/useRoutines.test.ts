/**
 * Tests for the routines list hook.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { routinesService } from '@/services/routines.service'
import type { Routine } from '@/types/routine'
import { useRoutines } from './useRoutines'

vi.mock('@/services/routines.service', () => ({ routinesService: { list: vi.fn() } }))

const routine = { id: 'r1', name: 'Fuerza base', currentVersion: 2 } as Routine

beforeEach(() => {
  vi.mocked(routinesService.list).mockReset().mockResolvedValue([routine])
})

describe('useRoutines', () => {
  it('loads the routines', async () => {
    const { result } = renderHook(() => useRoutines())

    await waitFor(() => expect(result.current.routines).toEqual([routine]))
    expect(result.current).toMatchObject({ isLoading: false, error: null })
  })

  it('exposes the error when the routines cannot be loaded', async () => {
    vi.mocked(routinesService.list).mockRejectedValue(new Error('boom'))

    const { result } = renderHook(() => useRoutines())

    await waitFor(() => expect(result.current.error).toBe('No pudimos cargar tus rutinas. Inténtalo nuevamente.'))
  })
})
