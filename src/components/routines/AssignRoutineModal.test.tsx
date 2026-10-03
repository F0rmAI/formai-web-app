/**
 * Tests for the modal that assigns a routine.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ClientSummary } from '@/types/client'
import { AssignRoutineModal } from './AssignRoutineModal'

const client = (id: string, fullName: string, status: ClientSummary['status'], currentRoutine: string | null = null): ClientSummary => ({
  id,
  fullName,
  email: `${id}@correo.com`,
  status,
  currentRoutine,
  lastWorkout: null,
})
const diego = client('c1', 'Diego Paredes', 'ACTIVE', 'Hipertrofia · 4 días')
const andrea = client('c2', 'Andrea Quispe', 'INVITED')
const renzo = client('c3', 'Renzo Castillo', 'INACTIVE')

/** Renders the modal with the three kinds of client. */
function renderModal(onSubmit = vi.fn()) {
  render(
    <AssignRoutineModal
      routineName="Fuerza base"
      clients={[diego, andrea, renzo]}
      isSubmitting={false}
      error={null}
      onSubmit={onSubmit}
      onClose={vi.fn()}
    />,
  )
  return onSubmit
}

describe('AssignRoutineModal', () => {
  it('lists every client with its situation', () => {
    renderModal()

    expect(screen.getByLabelText('Diego Paredes · tiene vigente Hipertrofia · 4 días')).toBeInTheDocument()
    expect(screen.getByLabelText('Andrea Quispe · invitada, aún no activa su cuenta')).toBeInTheDocument()
    expect(screen.getByLabelText('Renzo Castillo · inactivo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
  })

  it('explains why an inactive client cannot receive the routine and blocks the assignment', async () => {
    renderModal()

    await userEvent.click(screen.getByLabelText(/Renzo Castillo/))

    expect(screen.getByText(
      'Renzo Castillo está inactivo y no puede recibir rutinas. Quítalo de la selección.',
    )).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
  })

  it('reports the selected clients and the start date', async () => {
    const onSubmit = renderModal()

    await userEvent.click(screen.getByLabelText(/Diego Paredes/))
    await userEvent.clear(screen.getByLabelText('Fecha de inicio'))
    await userEvent.type(screen.getByLabelText('Fecha de inicio'), '2026-09-21')
    await userEvent.click(screen.getByRole('button', { name: 'Lun' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mié' }))
    await userEvent.click(screen.getByRole('button', { name: 'Asignar' }))

    expect(onSubmit).toHaveBeenCalledWith([diego], '2026-09-21', ['MONDAY', 'WEDNESDAY'])
  })

  it('requires a selected training day and exposes toggles as pressed buttons', async () => {
    renderModal()
    await userEvent.click(screen.getByLabelText(/Diego Paredes/))
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona al menos un día de entrenamiento.')
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Lun' }))
    expect(screen.getByRole('button', { name: 'Lun' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeEnabled()
  })
})
