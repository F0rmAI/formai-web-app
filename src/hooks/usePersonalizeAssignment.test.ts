/**
 * Behavioral regression tests for assignment personalization.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { act, renderHook } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { ServiceError } from '@/services/service-error'
import { usePersonalizeAssignment } from './usePersonalizeAssignment'
vi.mock('@/services/clients.service', () => ({ clientsService: { personalizeAssignment: vi.fn() } }))
beforeEach(() => vi.mocked(clientsService.personalizeAssignment).mockReset())
it('shares an in-flight save and reloads exactly once on success', async () => {
  let resolve!: () => void
  vi.mocked(clientsService.personalizeAssignment).mockReturnValue(new Promise<void>((done) => { resolve = done }))
  const reload = vi.fn()
  const { result } = renderHook(() => usePersonalizeAssignment('c1', reload))
  let first!: Promise<unknown>
  act(() => {
    first = result.current.personalizeAssignment({ note: '', adjustments: [] })
    result.current.personalizeAssignment({ note: 'Duplicate', adjustments: [] })
  })
  expect(result.current.isPersonalizing).toBe(true)
  expect(clientsService.personalizeAssignment).toHaveBeenCalledTimes(1)
  await act(async () => { resolve(); await first })
  expect(reload).toHaveBeenCalledTimes(1)
  expect(result.current.isPersonalizing).toBe(false)
})
it('exposes a Spanish service error without reloading and allows a retry', async () => {
  vi.mocked(clientsService.personalizeAssignment).mockRejectedValueOnce(new ServiceError('INVALID_ADJUSTMENT', 'Revisa los descansos.')).mockResolvedValueOnce(undefined)
  const reload = vi.fn()
  const { result } = renderHook(() => usePersonalizeAssignment('c1', reload))
  await act(async () => { await result.current.personalizeAssignment({ note: '', adjustments: [] }) })
  expect(result.current.personalizeError).toBe('Revisa los descansos.')
  expect(reload).not.toHaveBeenCalled()
  act(() => result.current.resetPersonalizeError())
  expect(result.current.personalizeError).toBeNull()
  await act(async () => { await result.current.personalizeAssignment({ note: 'Nueva nota', adjustments: [] }) })
  expect(reload).toHaveBeenCalledTimes(1)
})
