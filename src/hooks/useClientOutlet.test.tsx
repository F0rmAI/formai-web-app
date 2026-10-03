/**
 * Tests for the hook that reads the client of the client pages frame.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ClientDetail } from '@/types/client'
import { useClientOutlet, type ClientOutletContext } from './useClientOutlet'

describe('useClientOutlet', () => {
  it('reads the context provided by the parent route', () => {
    const context = { client: { id: 'c1', fullName: 'Diego Paredes' } as ClientDetail } as ClientOutletContext
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MemoryRouter>
        <Routes>
          <Route element={<Outlet context={context} />}>
            <Route index element={children} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const { result } = renderHook(() => useClientOutlet(), { wrapper })

    expect(result.current.client.fullName).toBe('Diego Paredes')
  })
})
