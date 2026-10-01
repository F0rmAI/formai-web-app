/**
 * Tests for the error shared by the resource services.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import { ApiError } from './api-client'
import { ServiceError, throwServiceError } from './service-error'

const otherwise = { code: 'UNEXPECTED', message: 'Inténtalo de nuevo.' } as const
const byStatus = { 404: { code: 'NOT_FOUND', message: 'No existe.' } } as const

/** Runs the mapper and returns what it throws. */
function mapped(error: unknown): unknown {
  try {
    throwServiceError<'NOT_FOUND' | 'UNEXPECTED'>(error, byStatus, otherwise)
  } catch (thrown) {
    return thrown
  }
}

describe('throwServiceError', () => {
  it('maps a known status to its code and message', () => {
    expect(mapped(new ApiError(404, 'Routine not found'))).toMatchObject({ code: 'NOT_FOUND', message: 'No existe.' })
  })

  it('never shows the detail sent by the backend', () => {
    const error = mapped(new ApiError(500, 'NullPointerException'))

    expect(error).toBeInstanceOf(ServiceError)
    expect(error).toMatchObject({ code: 'UNEXPECTED', message: 'Inténtalo de nuevo.' })
  })

  it('uses the fallback for a network failure', () => {
    expect(mapped(new TypeError('Failed to fetch'))).toMatchObject({ code: 'UNEXPECTED' })
  })

  it('rethrows a service error untouched', () => {
    const original = new ServiceError('NOT_FOUND', 'No existe.')

    expect(mapped(original)).toBe(original)
  })
})
