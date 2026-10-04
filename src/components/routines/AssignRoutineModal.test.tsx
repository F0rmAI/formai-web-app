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

/** Renders the modal with the three kinds of client and a routine of two sessions. */
function renderModal(onSubmit = vi.fn()) {
  render(
    <AssignRoutineModal
      routineName="Fuerza base"
      clients={[diego, andrea, renzo]}
      sessionCount={2}
      isSubmitting={false}
      error={null}
      onSubmit={onSubmit}
      onClose={vi.fn()}
    />,
  )
  return onSubmit
}

/** Opens the client list and ticks the client whose name matches. */
async function pickClient(name: RegExp) {
  await userEvent.click(screen.getByRole('combobox', { name: 'Clientes' }))
  await userEvent.click(screen.getByRole('option', { name }))
}

describe('AssignRoutineModal', () => {
  it('lists every client with its situation only after opening the search', async () => {
    renderModal()

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('combobox', { name: 'Clientes' }))

    expect(screen.getByRole('option', { name: /Diego Paredes tiene vigente Hipertrofia · 4 días/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Andrea Quispe invitada, aún no activa su cuenta/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Renzo Castillo inactivo/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
  })

  it('finds a client by name', async () => {
    renderModal()

    await userEvent.type(screen.getByRole('combobox', { name: 'Clientes' }), 'quis')

    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /Andrea Quispe/ })).toBeInTheDocument()
  })

  it('explains why an inactive client cannot receive the routine and blocks the assignment', async () => {
    renderModal()

    await pickClient(/Renzo Castillo/)

    expect(screen.getByText(
      'Renzo Castillo está inactivo y no puede recibir rutinas. Quítalo de la selección.',
    )).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
  })

  it('reports the selected clients, the start date and the training days', async () => {
    const onSubmit = renderModal()

    await pickClient(/Diego Paredes/)
    await userEvent.clear(screen.getByLabelText('Fecha de inicio'))
    await userEvent.type(screen.getByLabelText('Fecha de inicio'), '2026-09-21')
    await userEvent.click(screen.getByRole('button', { name: 'Lun' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mié' }))
    await userEvent.click(screen.getByRole('button', { name: 'Asignar' }))

    expect(onSubmit).toHaveBeenCalledWith([diego], '2026-09-21', ['MONDAY', 'WEDNESDAY'])
  })

  it('requires exactly one training day per session of the routine', async () => {
    renderModal()
    await pickClient(/Diego Paredes/)
    expect(screen.getByRole('alert')).toHaveTextContent('Esta rutina tiene 2 sesiones: elige 2 días.')

    await userEvent.click(screen.getByRole('button', { name: 'Lun' }))
    expect(screen.getByRole('button', { name: 'Lun' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Mié' }))
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Vie' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Esta rutina tiene 2 sesiones: elige 2 días.')
    expect(screen.getByRole('button', { name: 'Asignar' })).toBeDisabled()
  })
})
