/**
 * Test helper that renders hooks and components inside a router.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { createElement, useEffect, type ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'

/** Last location reached by the router of the current test. */
export const lastLocation: { pathname: string; state: unknown } = { pathname: '', state: null }

/** Records the location on every navigation so tests can assert on it. */
function LocationProbe() {
  const location = useLocation()
  useEffect(() => {
    Object.assign(lastLocation, { pathname: location.pathname, state: location.state })
  }, [location])
  return null
}

/**
 * Builds a wrapper that provides an in-memory router.
 *
 * @param initialEntry - Path, or path with navigation state, the router starts at.
 * @returns The wrapper component to pass to `render` or `renderHook`.
 */
export function withRouter(initialEntry: string | { pathname: string; state?: unknown } = '/') {
  return function RouterWrapper({ children }: { children: ReactNode }) {
    return createElement(MemoryRouter, { initialEntries: [initialEntry] }, createElement(LocationProbe), children)
  }
}
