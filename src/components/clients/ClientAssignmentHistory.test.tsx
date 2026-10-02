/**
 * Tests for the client assignment history.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClientAssignmentHistory } from './ClientAssignmentHistory'

describe('ClientAssignmentHistory', () => {
  it('shows an empty state for a client who never had a routine', () => {
    render(<ClientAssignmentHistory assignments={[]} />)

    expect(screen.getByText('Sin asignaciones')).toBeInTheDocument()
  })

  it('shows every assignment with dates, days and the previous-trainer fallback', () => {
    render(<ClientAssignmentHistory assignments={[
      { routineId: 'r1', routineName: 'Fuerza', startDate: '1 sep 2026', endDate: null, trainingDays: ['MONDAY', 'WEDNESDAY'], current: true },
      { routineId: 'r0', routineName: 'Rutina de otro entrenador', startDate: '1 ago 2026', endDate: '31 ago 2026', trainingDays: ['FRIDAY'], current: false },
    ]} />)

    expect(screen.getByText('Fuerza')).toBeInTheDocument()
    expect(screen.getByText('1 sep 2026 — Vigente')).toBeInTheDocument()
    expect(screen.getByText('Días de entrenamiento: Lun, Mié')).toBeInTheDocument()
    expect(screen.getByText('Rutina de otro entrenador')).toBeInTheDocument()
    expect(screen.getByText('1 ago 2026 — 31 ago 2026')).toBeInTheDocument()
  })
})
