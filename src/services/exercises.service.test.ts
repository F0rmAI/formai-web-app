/**
 * Tests for the exercises service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { exercisesService } from './exercises.service'

const press = { id: 'e1', name: 'Press inclinado', muscleGroup: 'Pectoral', equipment: 'Mancuernas', status: 'ACTIVE' }
const curl = { id: 'e2', name: 'Curl de bíceps', muscleGroup: 'Bíceps', equipment: ' ', status: 'ACTIVE' }
const routines = {
  totalPages: 1,
  content: [
    { sessions: [{ exercises: [{ exerciseId: 'e1' }] }, { exercises: [{ exerciseId: 'e1' }] }] },
    { sessions: [{ exercises: [{ exerciseId: 'e1' }] }] },
  ],
}

describe('exercisesService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists the exercises of a status with the number of routines that use each one', async () => {
    const requests = stubBackend({ 'GET /v1/exercises': { content: [press, curl] }, 'GET /v1/routines': routines })

    const result = await exercisesService.list('ACTIVE')

    expect(requests[0].path).toBe('/v1/exercises?page=0&size=100&status=ACTIVE')
    expect(result).toEqual([
      { ...press, routineCount: 2 },
      { ...curl, equipment: null, routineCount: 0 },
    ])
  })

  it('still lists the exercises when the routine usage cannot be read', async () => {
    stubBackend({ 'GET /v1/exercises': { content: [press] }, 'GET /v1/routines': { status: 500 } })

    await expect(exercisesService.list('ACTIVE')).resolves.toEqual([{ ...press, routineCount: 0 }])
  })

  it('creates an exercise with trimmed values', async () => {
    const requests = stubBackend({ 'POST /v1/exercises': press })

    const created = await exercisesService.create({ name: ' Press inclinado ', muscleGroup: 'Pectoral', equipment: '' })

    expect(requests[0].body).toEqual({ name: 'Press inclinado', muscleGroup: 'Pectoral', equipment: null })
    expect(created).toMatchObject({ id: 'e1', routineCount: 0 })
  })

  it('reports a duplicate name with the message of the catalog', async () => {
    stubBackend({ 'POST /v1/exercises': { status: 409, body: { detail: 'Exercise name already exists' } } })

    await expect(exercisesService.create({ name: 'Press', muscleGroup: 'Pectoral' })).rejects.toMatchObject({
      code: 'NAME_ALREADY_EXISTS',
      message: 'Ya tienes un ejercicio con este nombre en tu catálogo.',
    })
  })

  it('archives and restores an exercise', async () => {
    const requests = stubBackend({
      'POST /v1/exercises/e1/archivals': { ...press, status: 'ARCHIVED' },
      'POST /v1/exercises/e1/restorations': press,
    })

    expect((await exercisesService.archive('e1')).status).toBe('ARCHIVED')
    expect((await exercisesService.restore('e1')).status).toBe('ACTIVE')
    expect(requests).toHaveLength(2)
  })

  it('reports a missing exercise', async () => {
    stubBackend({ 'POST /v1': { status: 404 } })

    await expect(exercisesService.archive('zz')).rejects.toMatchObject({ code: 'EXERCISE_NOT_FOUND' })
  })

  it('deletes an unused exercise with a 204 response', async () => {
    const requests = stubBackend({ 'DELETE /v1/exercises/e2': { status: 204 } })

    await expect(exercisesService.remove('e2')).resolves.toBeUndefined()
    expect(requests[0]).toMatchObject({ method: 'DELETE', path: '/v1/exercises/e2', body: undefined })
  })

  it('tells the trainer to archive an exercise used by a routine', async () => {
    stubBackend({ 'DELETE /v1/exercises/e1': { status: 409, body: { detail: 'Exercise in use' } } })

    await expect(exercisesService.remove('e1')).rejects.toMatchObject({
      code: 'EXERCISE_IN_USE',
      message: expect.stringContaining('Archívalo'),
    })
  })

  it('reports a missing exercise on delete', async () => {
    stubBackend({ 'DELETE /v1/exercises/zz': { status: 404 } })

    await expect(exercisesService.remove('zz')).rejects.toMatchObject({ code: 'EXERCISE_NOT_FOUND' })
  })
})
