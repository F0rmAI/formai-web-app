/**
 * Tests for the starter page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HomePage } from './HomePage'

describe('HomePage', () => {
  it('shows the product name and the counter at zero', () => {
    render(<HomePage />)

    expect(screen.getByRole('heading', { name: 'FormAI' })).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments the counter when the button is clicked', async () => {
    const user = userEvent.setup()
    render(<HomePage />)

    await user.click(screen.getByRole('button', { name: 'Incrementar' }))
    await user.click(screen.getByRole('button', { name: 'Incrementar' }))

    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
