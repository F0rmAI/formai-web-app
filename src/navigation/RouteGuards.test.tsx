/**
 * Tests for the route guards.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '@/context/auth-context'
import { GuestOnly, RequireAuth } from './RouteGuards'

/** Renders the guarded routes at a path, with or without a session. */
function renderAt(path: string, isAuthenticated: boolean) {
  const auth = { isAuthenticated, user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn() } as AuthContextValue
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<p>Sign in</p>} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/clients" element={<p>Clients</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('RouteGuards', () => {
  it('sends a visitor without session to the sign-in page', () => {
    renderAt('/clients', false)

    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('lets a signed-in trainer open a protected page', () => {
    renderAt('/clients', true)

    expect(screen.getByText('Clients')).toBeInTheDocument()
  })

  it('sends a signed-in trainer away from the sign-in page', () => {
    renderAt('/login', true)

    expect(screen.getByText('Clients')).toBeInTheDocument()
  })
})
