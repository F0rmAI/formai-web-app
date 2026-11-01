/**
 * Tests for the multi-select combobox primitive.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Combobox } from './Combobox'

const options = [
  { value: 'a', label: 'Andrés Rojas', description: 'sin rutina vigente' },
  { value: 'b', label: 'Beatriz Lima' },
  { value: 'c', label: 'Carla Soto' },
]

/** Keeps the selection in state, as a parent form does. */
function Harness() {
  const [value, setValue] = useState<string[]>([])
  return <Combobox label="Clientes" options={options} value={value} onChange={setValue} />
}

describe('Combobox', () => {
  it('opens the list on focus and closes it with Escape', async () => {
    render(<Harness />)
    const input = screen.getByRole('combobox', { name: 'Clientes' })

    await userEvent.click(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('option')).toHaveLength(3)

    await userEvent.keyboard('{Escape}')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('filters by name ignoring accents and case', async () => {
    render(<Harness />)

    await userEvent.type(screen.getByRole('combobox'), 'ANDRES')

    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: /Andrés Rojas/ })).toBeInTheDocument()
  })

  it('ticks options with the mouse or the keyboard and shows them as removable chips', async () => {
    render(<Harness />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: /Beatriz Lima/ }))
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}')

    expect(screen.getByRole('option', { name: /Beatriz Lima/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Carla Soto/ })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Beatriz Lima' }))
    expect(screen.queryByRole('button', { name: 'Quitar Beatriz Lima' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quitar Carla Soto' })).toBeInTheDocument()
  })

  it('says so when nothing matches', async () => {
    render(<Harness />)

    await userEvent.type(screen.getByRole('combobox'), 'zzz')

    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })
  it('keeps the list stable until the outside click completes and lets the control receive it', async () => {
    const user = userEvent.setup()
    const clicked = vi.fn()
    render(<><Harness /><button onClick={clicked}>Día siguiente</button></>)
    await userEvent.click(screen.getByRole('combobox'))
    const button = screen.getByRole('button', { name: 'Día siguiente' })
    await user.pointer({ target: button, keys: '[MouseLeft>]' })
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await user.pointer({ target: button, keys: '[/MouseLeft]' })
    expect(clicked).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes when keyboard focus leaves with Tab', async () => {
    render(<><Harness /><button>Siguiente</button></>)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.tab()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveFocus()
  })

})
