/**
 * Tests for the field validators.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import { emailFormatError, passwordError } from './validation'

describe('validation', () => {
  it('accepts a well-formed email', () => {
    expect(emailFormatError(' carla@formai.app ')).toBeUndefined()
  })

  it('asks for the email when it is empty', () => {
    expect(emailFormatError('  ')).toBe('Ingresa tu correo electrónico')
  })

  it('rejects an email without domain', () => {
    expect(emailFormatError('carla@')).toBe('Ingresa un correo válido')
  })

  it('accepts a password between 8 and 128 characters with letters and numbers', () => {
    expect(passwordError('entrena2026')).toBeUndefined()
  })

  it('rejects a password without letters or without numbers', () => {
    expect(passwordError('solamenteletras')).toBeDefined()
    expect(passwordError('1234567890')).toBeDefined()
  })

  it('rejects a password outside the backend length range', () => {
    expect(passwordError('abc123')).toBeDefined()
    expect(passwordError('a'.repeat(129))).toBeDefined()
  })
})
