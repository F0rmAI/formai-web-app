/**
 * Behavioral regression tests for assignment personalization.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PersonalizeAssignmentModal, type PersonalizeAssignmentModalProps } from './PersonalizeAssignmentModal'

const sessions = [{ order: 1, label: 'Día A', exercises: [{ exerciseId: 'e1', exerciseName: 'Press banca', sets: 3, reps: 10, targetLoadKg: 40, restSeconds: 90 }] }]
function mount(overrides: Partial<PersonalizeAssignmentModalProps> = {}) {
  const onSubmit = vi.fn()
  const props = { sessions, note: null, adjustments: [], isSubmitting: false, error: null, onClose: vi.fn(), onSubmit, ...overrides }
  const view = render(<PersonalizeAssignmentModal {...props} />)
  return { ...view, onSubmit, props }
}

describe('PersonalizeAssignmentModal', () => {
  it('shows the routine defaults and submits comma decimals, zero rest and a multiline note', async () => {
    const { onSubmit } = mount()
    expect(screen.getByText('Rutina: 40 kg')).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Carga objetivo (kg)'), '12,5')
    await userEvent.type(screen.getByLabelText('Descanso (s)'), '0')
    const note = screen.getByLabelText('Nota para el cliente (opcional)')
    expect(note.tagName).toBe('TEXTAREA')
    expect(note).toHaveAttribute('maxlength', '500')
    await userEvent.type(note, 'Calienta{enter}Cuida la rodilla')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar personalización' }))
    expect(onSubmit).toHaveBeenCalledWith({ note: 'Calienta\nCuida la rodilla', adjustments: [{ sessionOrder: 1, exerciseId: 'e1', targetLoadKg: 12.5, restSeconds: 0 }] })
  })
  it('starts with saved values and removes overrides when both fields are cleared', async () => {
    const { onSubmit } = mount({ note: 'Nota', adjustments: [{ sessionOrder: 1, exerciseId: 'e1', targetLoadKg: 0, restSeconds: 60 }] })
    expect(screen.getByLabelText('Carga objetivo (kg)')).toHaveValue('0')
    await userEvent.clear(screen.getByLabelText('Carga objetivo (kg)'))
    await userEvent.clear(screen.getByLabelText('Descanso (s)'))
    await userEvent.clear(screen.getByLabelText('Nota para el cliente (opcional)'))
    await userEvent.click(screen.getByRole('button', { name: 'Guardar personalización' }))
    expect(onSubmit).toHaveBeenCalledWith({ note: '', adjustments: [] })
  })
  it.each(['-1', '1.5', 'abc', 'Infinity'])('rejects invalid rest %s without rounding', async (rest) => {
    const { onSubmit } = mount()
    await userEvent.type(screen.getByLabelText('Descanso (s)'), rest)
    expect(screen.getByRole('button', { name: 'Guardar personalización' })).toBeDisabled()
    fireEvent.submit(screen.getByLabelText('Descanso (s)').closest('form')!)
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('preserves typed values after a failed save and blocks submission while saving', async () => {
    const { rerender, props, onSubmit } = mount()
    await userEvent.type(screen.getByLabelText('Carga objetivo (kg)'), '25')
    rerender(<PersonalizeAssignmentModal {...props} error="No se pudo guardar" />)
    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument()
    expect(screen.getByLabelText('Carga objetivo (kg)')).toHaveValue('25')
    rerender(<PersonalizeAssignmentModal {...props} isSubmitting />)
    fireEvent.submit(screen.getByLabelText('Carga objetivo (kg)').closest('form')!)
    expect(onSubmit).not.toHaveBeenCalled()
  })
  it('does not submit when the routine sessions are unavailable', () => {
    const { onSubmit } = mount({ sessions: [] })
    expect(screen.getByRole('button', { name: 'Guardar personalización' })).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
