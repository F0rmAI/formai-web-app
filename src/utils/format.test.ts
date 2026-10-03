/**
 * Tests for the formatting helpers.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import {
  firstName,
  formatCount,
  formatDate,
  formatDateTime,
  formatKg,
  formatNumber,
  formatTime,
  parseDate,
  toIsoDate,
} from './format'

describe('format', () => {
  it('parses a date without time as a local day', () => {
    expect(parseDate('2026-09-15')?.getDate()).toBe(15)
  })

  it('returns null for an empty or invalid date', () => {
    expect(parseDate(null)).toBeNull()
    expect(parseDate('not a date')).toBeNull()
  })

  it('formats a date in every layout', () => {
    expect(formatDate('2026-09-15', 'day')).toBe('15 sep')
    expect(formatDate('2026-09-15')).toBe('15 sep 2026')
    expect(formatDate('2026-09-15', 'long')).toBe('15 de septiembre de 2026')
    expect(formatDate('2026-09-16', 'weekday')).toBe('Mié 16 sep 2026')
    expect(formatDate('2026-09-16', 'full')).toBe('Miércoles 16 de septiembre de 2026')
  })

  it('returns an empty text for a missing date', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDateTime(null)).toBe('')
  })

  it('formats the time without a leading zero in the hour', () => {
    expect(formatTime('2026-09-16T07:05:00')).toBe('7:05')
    expect(formatDateTime('2026-09-01T09:15:00')).toBe('1 sep 2026, 9:15')
  })

  it('groups thousands with a space and uses a decimal comma', () => {
    expect(formatNumber(3625)).toBe('3 625')
    expect(formatNumber(78, 1)).toBe('78,0')
    expect(formatNumber(-1200.5, 1)).toBe('-1 200,5')
  })

  it('formats a weight with one decimal only when it is not whole', () => {
    expect(formatKg(3625)).toBe('3 625 kg')
    expect(formatKg(12.5)).toBe('12,5 kg')
    expect(formatKg(78, 1)).toBe('78,0 kg')
  })

  it('picks the singular or the plural noun', () => {
    expect(formatCount(1, 'rutina', 'rutinas')).toBe('1 rutina')
    expect(formatCount(0, 'rutina', 'rutinas')).toBe('0 rutinas')
  })

  it('returns the first word of a full name', () => {
    expect(firstName('  Diego Paredes ')).toBe('Diego')
  })

  it('formats a date for date inputs in local time', () => {
    expect(toIsoDate(new Date(2026, 8, 5))).toBe('2026-09-05')
  })
})
