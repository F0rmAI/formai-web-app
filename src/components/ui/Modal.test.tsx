/**
 * Tests for the modal primitive.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false} title="Nuevo cliente" icon="person_add" onClose={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a dialog named and described by its title and description, with content and actions', () => {
    render(
      <Modal open title="Nuevo cliente" description="Registra sus datos." icon="person_add" onClose={vi.fn()} actions={<button>Guardar</button>}>
        <p>Formulario</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Nuevo cliente' })
    expect(dialog).toHaveAccessibleDescription('Registra sus datos.')
    expect(screen.getByText('Formulario')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('closes with Escape and with the backdrop, but not with a click inside', async () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Nuevo cliente" icon="person_add" onClose={onClose}>
        <p>Formulario</p>
      </Modal>,
    )

    await userEvent.click(screen.getByText('Formulario'))
    expect(onClose).not.toHaveBeenCalled()

    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
