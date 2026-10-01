/**
 * Tests for the modal that edits the body profile.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { BodyProfile } from '@/types/client'
import { EditBodyProfileModal } from './EditBodyProfileModal'

const profile: BodyProfile = { goal: 'Hipertrofia', weight: 78, height: 176, restrictions: '', updatedAt: '15 sep', weightHistory: [] }

describe('EditBodyProfileModal', () => {
  it('starts from the current profile and reports the edited values', async () => {
    const onSubmit = vi.fn()
    render(<EditBodyProfileModal profile={profile} isSubmitting={false} error={null} onSubmit={onSubmit} onClose={vi.fn()} />)

    await userEvent.clear(screen.getByLabelText('Peso corporal (kg)'))
    await userEvent.type(screen.getByLabelText('Peso corporal (kg)'), '77,5')
    await userEvent.type(screen.getByLabelText('Lesiones o restricciones'), ' Hombro derecho ')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar ficha' }))

    expect(onSubmit).toHaveBeenCalledWith({ goal: 'Hipertrofia', weight: 77.5, height: 176, restrictions: 'Hombro derecho' })
  })

  it('marks a height out of range and blocks the save', async () => {
    render(<EditBodyProfileModal profile={profile} isSubmitting={false} error={null} onSubmit={vi.fn()} onClose={vi.fn()} />)

    await userEvent.clear(screen.getByLabelText('Estatura (cm)'))
    await userEvent.type(screen.getByLabelText('Estatura (cm)'), '260')

    expect(screen.getByText('La estatura debe estar entre 100 y 250 cm.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar ficha' })).toBeDisabled()
  })

  it('shows the message of a failed save', () => {
    render(
      <EditBodyProfileModal profile={profile} isSubmitting={false} error="No pudimos guardar la ficha." onSubmit={vi.fn()} onClose={vi.fn()} />,
    )

    expect(screen.getByText('No pudimos guardar la ficha.')).toBeInTheDocument()
  })
})
