/**
 * Tests for the exercise catalog page.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exercisesService } from '@/services/exercises.service'
import { ServiceError } from '@/services/service-error'
import { withRouter } from '@/test/router'
import type { Exercise } from '@/types/exercise'
import { ExercisesPage } from './ExercisesPage'

vi.mock('@/services/exercises.service', () => ({
  exercisesService: { list: vi.fn(), create: vi.fn(), archive: vi.fn(), restore: vi.fn(), remove: vi.fn() },
}))

const unused: Exercise = { id: 'e1', name: 'Press', muscleGroup: 'Pectoral', equipment: null, status: 'ACTIVE', routineCount: 0 }
const used: Exercise = { ...unused, id: 'e2', name: 'Curl', routineCount: 2 }
const archived: Exercise = { ...unused, id: 'e3', name: 'Remo', status: 'ARCHIVED' }

describe('ExercisesPage', () => {
  beforeEach(() => {
    vi.mocked(exercisesService.list).mockReset().mockResolvedValue([unused, used, archived])
    vi.mocked(exercisesService.remove).mockReset()
  })

  it('offers delete only for unused active exercises and confirms it', async () => {
    vi.mocked(exercisesService.remove).mockResolvedValue()
    render(<ExercisesPage />, { wrapper: withRouter('/exercises') })
    await screen.findByRole('table', { name: 'Ejercicios' })

    expect(screen.getByRole('button', { name: 'Eliminar Press' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar Curl' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar Remo' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Restaurar Remo' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Press' }))
    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar Press?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar ejercicio' }))
    expect(exercisesService.remove).toHaveBeenCalledWith('e1')
    expect(await screen.findByText('Ejercicio eliminado del catálogo')).toBeInTheDocument()
    expect(exercisesService.list).toHaveBeenCalledTimes(2)
  })

  it('shows the archive guidance when the backend reports a conflict', async () => {
    vi.mocked(exercisesService.remove).mockRejectedValue(new ServiceError('EXERCISE_IN_USE', 'Archívalo en lugar de eliminarlo.'))
    render(<ExercisesPage />, { wrapper: withRouter('/exercises') })
    await screen.findByRole('button', { name: 'Eliminar Press' })
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar Press' }))
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Eliminar ejercicio' }))

    expect(await screen.findByText('Archívalo en lugar de eliminarlo.')).toBeInTheDocument()
    expect(exercisesService.list).toHaveBeenCalledTimes(1)
  })
})
