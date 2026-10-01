/**
 * Tests for the clients page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clientsService } from '@/services/clients.service'
import { ServiceError } from '@/services/service-error'
import { lastLocation, withRouter } from '@/test/router'
import type { ClientSummary } from '@/types/client'
import { ClientsPage } from './ClientsPage'

vi.mock('@/services/clients.service', () => ({
  clientsService: { list: vi.fn(), register: vi.fn(), regenerateCode: vi.fn() },
}))

const diego: ClientSummary = {
  id: 'c1',
  fullName: 'Diego Paredes',
  email: 'diego@correo.com',
  status: 'ACTIVE',
  currentRoutine: 'Hipertrofia · 4 días',
  lastWorkout: 'Mié 16 sep 2026',
}
const andrea: ClientSummary = { ...diego, id: 'c2', fullName: 'Andrea Quispe', email: 'andrea@correo.com', status: 'INVITATION_EXPIRED', currentRoutine: null, lastWorkout: null }

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.mocked(clientsService.list).mockReset().mockResolvedValue([diego, andrea])
    vi.mocked(clientsService.register).mockReset()
    vi.mocked(clientsService.regenerateCode).mockReset()
  })

  it('lists the clients with their status, routine and last workout', async () => {
    render(<ClientsPage />, { wrapper: withRouter('/clients') })

    const table = await screen.findByRole('table', { name: 'Clientes' })
    expect(within(table).getByText('Diego Paredes')).toBeInTheDocument()
    expect(within(table).getByText('Hipertrofia · 4 días')).toBeInTheDocument()
    expect(within(table).getByText('Código vencido')).toBeInTheDocument()
  })

  it('invites to register the first client when there are none', async () => {
    vi.mocked(clientsService.list).mockResolvedValue([])

    render(<ClientsPage />, { wrapper: withRouter('/clients') })

    expect(await screen.findByText('Aún no tienes clientes')).toBeInTheDocument()
    expect(screen.queryByLabelText('Buscar por nombre')).not.toBeInTheDocument()
  })

  it('shows the error with a way to retry', async () => {
    vi.mocked(clientsService.list).mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce([diego])
    render(<ClientsPage />, { wrapper: withRouter('/clients') })

    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('table', { name: 'Clientes' })).toBeInTheDocument()
  })

  it('registers a client and shows the activation code', async () => {
    vi.mocked(clientsService.register).mockResolvedValue({ clientId: 'c3', clientName: 'Lucía Fernández', code: 'FA-7K2Q', expiresAt: '20 de septiembre de 2026, 10:30' })
    render(<ClientsPage />, { wrapper: withRouter('/clients') })
    await screen.findByRole('table', { name: 'Clientes' })

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo cliente' }))
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Lucía Fernández')
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'lucia@correo.com')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar y generar código' }))

    const dialog = await screen.findByRole('dialog', { name: 'Lucía Fernández fue registrada' })
    expect(within(dialog).getByText('FA-7K2Q')).toBeInTheDocument()
    expect(clientsService.register).toHaveBeenCalledWith({ fullName: 'Lucía Fernández', email: 'lucia@correo.com' })
  })

  it('keeps the form open and explains a duplicate email', async () => {
    vi.mocked(clientsService.register).mockRejectedValue(
      new ServiceError('EMAIL_ALREADY_EXISTS', 'Este correo ya pertenece a uno de tus clientes (Diego Paredes).'),
    )
    render(<ClientsPage />, { wrapper: withRouter('/clients') })
    await screen.findByRole('table', { name: 'Clientes' })

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo cliente' }))
    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Diego Paredes')
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'diego@correo.com')
    await userEvent.click(screen.getByRole('button', { name: 'Registrar y generar código' }))

    expect(await screen.findByText('Este correo ya pertenece a uno de tus clientes (Diego Paredes).')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Nuevo cliente' })).toBeInTheDocument()
  })

  it('regenerates an expired activation code', async () => {
    vi.mocked(clientsService.regenerateCode).mockResolvedValue({ clientId: 'c2', clientName: 'Andrea Quispe', code: 'FA-Q9M3', expiresAt: '20 de septiembre de 2026, 11:40' })
    render(<ClientsPage />, { wrapper: withRouter('/clients') })

    await userEvent.click(await screen.findByRole('button', { name: 'Regenerar código de Andrea Quispe' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generar nuevo código' }))

    expect(await screen.findByRole('dialog', { name: 'Nuevo código para Andrea Quispe' })).toBeInTheDocument()
  })

  it('opens the page of a client', async () => {
    render(<ClientsPage />, { wrapper: withRouter('/clients') })

    await userEvent.click(await screen.findByRole('button', { name: 'Abrir ficha de Diego Paredes' }))

    expect(lastLocation.pathname).toBe('/clients/c1')
  })
})
