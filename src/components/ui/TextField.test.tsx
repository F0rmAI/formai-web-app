/**
 * Behavioral regression tests for assignment personalization.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { TextField } from './TextField'
it('keeps the input API for single-line controls', async () => {
  const onChange = vi.fn()
  render(<TextField label="Correo" type="email" onChange={onChange} />)
  expect(screen.getByLabelText('Correo').tagName).toBe('INPUT')
  await userEvent.type(screen.getByLabelText('Correo'), 'a')
  expect(onChange).toHaveBeenCalledTimes(1)
})
it('supports multiline values, accessible errors and a character limit', async () => {
  const onChange = vi.fn()
  render(<TextField multiline label="Nota" maxLength={500} error="Nota inválida" onChange={onChange} />)
  const field = screen.getByRole('textbox', { name: 'Nota' })
  expect(field.tagName).toBe('TEXTAREA')
  expect(field).toHaveAttribute('aria-invalid', 'true')
  expect(field).toHaveAccessibleDescription('Nota inválida')
  await userEvent.type(field, 'A{enter}B')
  expect(field).toHaveValue('A\nB')
})
