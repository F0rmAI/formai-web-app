/**
 * Tests for the client detail layout.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { ServiceError } from '@/services/service-error'
import type { ClientDetail } from '@/types/client'
import { ClientLayoutPage } from './ClientLayoutPage'

vi.mock('@/services/clients.service', () => ({
  clientsService: { getById: vi.fn(), rename: vi.fn(), updateBodyProfile: vi.fn(), deactivate: vi.fn() },
}))

const client: ClientDetail = {
  id: 'c1', fullName: 'Andrea Quispe', email: null, status: 'INVITED', currentRoutine: null,
  lastWorkout: null, activeSince: '1 de octubre de 2026', routine: null,
  bodyProfile: { goal: '', weight: 0, height: 0, restrictions: '', updatedAt: '', weightHistory: [] },
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/clients/c1']}>
      <Routes><Route path="/clients/:clientId" element={<ClientLayoutPage />} /></Routes>
    </MemoryRouter>,
  )
}

describe('ClientLayoutPage', () => {
  beforeEach(() => {
    vi.mocked(clientsService.getById).mockReset().mockResolvedValue(client)
    vi.mocked(clientsService.rename).mockReset()
  })

  it('shows the null email and updates the heading after a rename', async () => {
    vi.mocked(clientsService.rename).mockResolvedValue({ id: 'c1', fullName: 'Andrea Ramos', email: null, status: 'INVITED', registeredAt: '2026-10-01' })
    vi.mocked(clientsService.getById).mockResolvedValueOnce(client).mockResolvedValue({ ...client, fullName: 'Andrea Ramos' })
    renderLayout()

    expect(await screen.findByText(/Aún sin correo · Aún no activa su cuenta/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar nombre' })
    await userEvent.clear(within(dialog).getByLabelText('Nombre completo'))
    await userEvent.type(within(dialog).getByLabelText('Nombre completo'), 'Andrea Ramos')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar nombre' }))

    expect(await screen.findByRole('heading', { name: 'Andrea Ramos' })).toBeInTheDocument()
    expect(clientsService.rename).toHaveBeenCalledWith('c1', 'Andrea Ramos')
    expect(screen.getByText('Nombre actualizado')).toBeInTheDocument()
  })

  it('keeps the editor open and shows a rename error', async () => {
    vi.mocked(clientsService.rename).mockRejectedValue(new ServiceError('INVALID_CLIENT_NAME', 'Nombre inválido.'))
    renderLayout()
    await screen.findByRole('button', { name: 'Editar nombre' })
    await userEvent.click(screen.getByRole('button', { name: 'Editar nombre' }))
    const dialog = screen.getByRole('dialog', { name: 'Editar nombre' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar nombre' }))

    expect(await within(dialog).findByText('Nombre inválido.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Nombre completo')).toHaveAttribute('maxLength', '120')
  })
})
