/**
 * Tests for the exercises service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { exercisesService } from './exercises.service'

const press = {
  id: 'e1',
  name: 'Press inclinado',
  muscleGroup: 'Pectoral',
  equipment: 'Mancuernas',
  status: 'ACTIVE',
  origin: 'OWN',
  routineCount: 2,
}
const curl = {
  id: 'e2',
  name: 'Curl de bíceps',
  muscleGroup: 'Bíceps',
  equipment: ' ',
  status: 'ACTIVE',
  origin: 'GLOBAL',
  routineCount: 0,
}

describe('exercisesService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists the global and own exercises of a status with the usage the backend reports', async () => {
    const requests = stubBackend({ 'GET /exercises': { content: [press, curl], totalPages: 1 } })

    const result = await exercisesService.list('ACTIVE')

    expect(requests).toHaveLength(1)
    expect(requests[0].path).toBe('/exercises?page=0&size=100&status=ACTIVE')
    expect(result).toEqual([press, { ...curl, equipment: null }])
  })

  it('sends the muscle group and origin filters', async () => {
    const requests = stubBackend({ 'GET /exercises': { content: [curl], totalPages: 1 } })

    await exercisesService.list('ACTIVE', undefined, { muscleGroup: 'Bíceps', origin: 'GLOBAL' })

    expect(requests[0].path).toBe('/exercises?page=0&size=100&status=ACTIVE&muscleGroup=B%C3%ADceps&origin=GLOBAL')
  })

  it('reads the standard muscle groups from the backend', async () => {
    stubBackend({ 'GET /muscle-groups': ['Pectoral', 'Espalda'] })

    await expect(exercisesService.muscleGroups()).resolves.toEqual(['Pectoral', 'Espalda'])
  })

  it('creates an exercise with trimmed values', async () => {
    const requests = stubBackend({ 'POST /exercises': press })

    const created = await exercisesService.create({ name: ' Press inclinado ', muscleGroup: 'Pectoral', equipment: '' })

    expect(requests[0].body).toEqual({ name: 'Press inclinado', muscleGroup: 'Pectoral', equipment: null })
    expect(created).toMatchObject({ id: 'e1', origin: 'OWN' })
  })

  it('reports a duplicate name with the message of the catalog', async () => {
    stubBackend({ 'POST /exercises': { status: 409, body: { detail: 'Exercise name already exists' } } })

    await expect(exercisesService.create({ name: 'Press', muscleGroup: 'Pectoral' })).rejects.toMatchObject({
      code: 'NAME_ALREADY_EXISTS',
      message: 'Ya existe un ejercicio con este nombre en el catálogo global o en tus ejercicios.',
    })
  })

  it('archives and restores an exercise', async () => {
    const requests = stubBackend({
      'POST /exercises/e1/archivals': { ...press, status: 'ARCHIVED' },
      'POST /exercises/e1/restorations': press,
    })

    expect((await exercisesService.archive('e1')).status).toBe('ARCHIVED')
    expect((await exercisesService.restore('e1')).status).toBe('ACTIVE')
    expect(requests).toHaveLength(2)
  })

  it('reports a missing exercise', async () => {
    stubBackend({ 'POST /': { status: 404 } })

    await expect(exercisesService.archive('zz')).rejects.toMatchObject({ code: 'EXERCISE_NOT_FOUND' })
  })

  it('deletes an unused exercise with a 204 response', async () => {
    const requests = stubBackend({ 'DELETE /exercises/e2': { status: 204 } })

    await expect(exercisesService.remove('e2')).resolves.toBeUndefined()
    expect(requests[0]).toMatchObject({ method: 'DELETE', path: '/exercises/e2', body: undefined })
  })

  it('tells the trainer to archive an exercise used by a routine', async () => {
    stubBackend({ 'DELETE /exercises/e1': { status: 409, body: { detail: 'Exercise in use' } } })

    await expect(exercisesService.remove('e1')).rejects.toMatchObject({
      code: 'EXERCISE_IN_USE',
      message: expect.stringContaining('Archívalo'),
    })
  })

  it('reports a missing exercise on delete', async () => {
    stubBackend({ 'DELETE /exercises/zz': { status: 404 } })

    await expect(exercisesService.remove('zz')).rejects.toMatchObject({ code: 'EXERCISE_NOT_FOUND' })
  })
})
