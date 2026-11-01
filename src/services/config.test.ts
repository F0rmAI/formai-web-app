/**
 * Behavioral regression tests for assignment personalization.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, expect, it, vi } from 'vitest'
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })
it('defaults to the local API during development', async () => {
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('PROD', false)
  expect((await import('./config')).API_URL).toBe('http://localhost:8080/api/v1')
})
it('keeps the existing public production URL without a tracked env file', async () => {
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('PROD', true)
  expect((await import('./config')).API_URL).toBe('https://formai-api.quedena.studio/api/v1')
})
it('prefers an explicit environment URL in any mode', async () => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api/v1')
  vi.stubEnv('PROD', true)
  expect((await import('./config')).API_URL).toBe('http://localhost:8080/api/v1')
})
