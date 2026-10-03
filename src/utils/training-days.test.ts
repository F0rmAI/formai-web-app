/**
 * Tests for the training-day labels and formatter.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { describe, expect, it } from 'vitest'
import { formatTrainingDays, TRAINING_DAYS } from './training-days'

describe('training-days', () => {
  it('lists every weekday in backend order with its Spanish label', () => {
    expect(TRAINING_DAYS).toEqual([
      { day: 'MONDAY', label: 'Lun' },
      { day: 'TUESDAY', label: 'Mar' },
      { day: 'WEDNESDAY', label: 'Mié' },
      { day: 'THURSDAY', label: 'Jue' },
      { day: 'FRIDAY', label: 'Vie' },
      { day: 'SATURDAY', label: 'Sáb' },
      { day: 'SUNDAY', label: 'Dom' },
    ])
  })

  it('formats selected days in weekday order, regardless of input order', () => {
    expect(formatTrainingDays(['SUNDAY', 'MONDAY', 'WEDNESDAY'])).toBe('Lun, Mié, Dom')
    expect(formatTrainingDays(['MONDAY', 'MONDAY'])).toBe('Lun')
    expect(formatTrainingDays(TRAINING_DAYS.map(({ day }) => day))).toBe('Lun, Mar, Mié, Jue, Vie, Sáb, Dom')
  })

  it('returns an empty string when no day is selected', () => {
    expect(formatTrainingDays([])).toBe('')
  })
})
