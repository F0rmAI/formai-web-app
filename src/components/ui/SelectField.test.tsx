/**
 * Tests for the select field primitive.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from './SelectField'

const options = [
  { value: 'ACTIVE', label: 'Activos' },
  { value: 'ARCHIVED', label: 'Archivados' },
]

describe('SelectField', () => {
  it('reports the value of the option the user selects', async () => {
    const onChange = vi.fn()
    render(<SelectField label="Estado" value="ACTIVE" options={options} onChange={onChange} />)

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'Archivados')

    expect(onChange).toHaveBeenCalledWith('ARCHIVED')
  })

  it('shows the placeholder while nothing is selected and the error message', () => {
    render(<SelectField label="Ejercicio" value="" options={options} onChange={vi.fn()} placeholder="Elige uno" error="Obligatorio" />)

    expect(screen.getByLabelText('Ejercicio')).toHaveDisplayValue('Elige uno')
    expect(screen.getByLabelText('Ejercicio')).toBeInvalid()
    expect(screen.getByText('Obligatorio')).toBeInTheDocument()
  })
})
