/**
 * Tests for the routines service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { routinesService } from './routines.service'

const session = {
  order: 1,
  label: 'Día A',
  exercises: [{ exerciseId: 'e1', exerciseName: 'Press', sets: 4, reps: 8, targetLoadKg: '60.50', restSeconds: 120 }],
}
const routine = { id: 'r1', name: 'Fuerza base', status: 'ACTIVE', currentVersion: 2, sessions: [session], createdAt: '2026-09-01T10:00:00' }
const draft = { ...routine, id: 'r2', name: 'Copia', status: 'SOMETHING_NEW', currentVersion: 1 }
const clientRoutes = {
  'GET /v1/clients?': { content: [{ id: 'c1', fullName: 'Diego Paredes', status: 'ACTIVE' }] },
  'GET /v1/clients/c1/assignments': [
    { clientId: 'c1', routineId: 'r1', routineName: 'Fuerza base', startDate: '2026-09-01', endDate: null, trainingDays: ['MONDAY'], current: true },
    { clientId: 'c1', routineId: 'r2', routineName: 'Copia', startDate: '2026-08-01', endDate: '2026-08-31', trainingDays: ['TUESDAY'], current: false },
  ],
}

describe('routinesService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists every page of routines with the clients that follow each one', async () => {
    const requests = stubBackend({
      ...clientRoutes,
      'GET /v1/routines?page=0': { content: [routine], totalPages: 2 },
      'GET /v1/routines?page=1': { content: [draft], totalPages: 2 },
    })

    const result = await routinesService.list()

    expect(requests.filter((request) => request.path.startsWith('/v1/routines'))).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 'r1', status: 'ACTIVE', createdAtLabel: '1 sep 2026', assignedClients: ['Diego Paredes'] })
    expect(result[0].sessions[0].exercises[0].targetLoadKg).toBe(60.5)
    expect(result[1]).toMatchObject({ id: 'r2', status: 'DRAFT', assignedClients: [] })
  })

  it('still lists the routines when the clients cannot be read', async () => {
    stubBackend({ 'GET /v1/routines': { content: [routine], totalPages: 1 }, 'GET /v1/clients': { status: 500 } })

    await expect(routinesService.list()).resolves.toMatchObject([{ id: 'r1', assignedClients: [] }])
  })

  it('reports a missing routine', async () => {
    stubBackend({ ...clientRoutes, 'GET /v1/routines/zz': { status: 404 } })

    await expect(routinesService.getById('zz')).rejects.toMatchObject({ code: 'ROUTINE_NOT_FOUND' })
  })

  it('creates and updates a routine with the given data', async () => {
    const requests = stubBackend({ ...clientRoutes, 'POST /v1/routines': draft, 'PUT /v1/routines/r1': routine })
    const input = { name: 'Fuerza base', sessions: [{ label: 'Día A', exercises: [{ exerciseId: 'e1', sets: 4, reps: 8, targetLoadKg: 60.5, restSeconds: 120 }] }] }

    const created = await routinesService.create(input)
    const updated = await routinesService.update('r1', input)

    expect(requests[0]).toMatchObject({ method: 'POST', path: '/v1/routines', body: input })
    expect(created.id).toBe('r2')
    expect(updated).toMatchObject({ id: 'r1', currentVersion: 2, assignedClients: ['Diego Paredes'] })
  })

  it('reports rejected routine data as a validation failure', async () => {
    stubBackend({ 'POST /v1/routines': { status: 422, body: { detail: 'Sets must be positive' } } })

    await expect(routinesService.create({ name: 'x', sessions: [] })).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('lists the versions newest first with their date formatted', async () => {
    stubBackend({
      'GET /v1/routines/r1/versions': [
        { number: 1, changedAt: '2026-08-18T20:40:00', author: 'Carla Ríos', sessions: [session] },
        { number: 2, changedAt: '2026-09-01T09:15:00', author: 'Carla Ríos', sessions: [session] },
      ],
    })

    const versions = await routinesService.getVersions('r1')

    expect(versions.map((version) => version.number)).toEqual([2, 1])
    expect(versions[0]).toMatchObject({ changedAtLabel: '1 sep 2026, 9:15', author: 'Carla Ríos' })
  })

  it('duplicates a routine with the trimmed name', async () => {
    const requests = stubBackend({ 'POST /v1/routines/r1/duplicates': draft })

    const copy = await routinesService.duplicate('r1', ' Copia ')

    expect(requests[0].body).toEqual({ name: 'Copia' })
    expect(copy.id).toBe('r2')
  })

  it('assigns a routine to clients from a start date', async () => {
    const requests = stubBackend({ 'POST /v1/routines/r1/assignments': [] })

    await routinesService.assign('r1', { clientIds: ['c1'], startDate: '2026-09-21', trainingDays: ['MONDAY', 'WEDNESDAY'] })

    expect(requests[0].body).toEqual({ clientIds: ['c1'], startDate: '2026-09-21', trainingDays: ['MONDAY', 'WEDNESDAY'] })
  })

  it('reports a client that cannot receive routines', async () => {
    stubBackend({ 'POST /v1/routines/r1/assignments': { status: 422 } })

    await expect(routinesService.assign('r1', { clientIds: ['c3'], startDate: '2026-09-21', trainingDays: ['MONDAY'] })).rejects.toMatchObject({
      code: 'CLIENT_NOT_ASSIGNABLE',
    })
  })

  it.each([
    [400, 'VALIDATION'],
    [403, 'ROUTINE_NOT_FOUND'],
    [404, 'ROUTINE_NOT_FOUND'],
    [422, 'CLIENT_NOT_ASSIGNABLE'],
    [500, 'UNEXPECTED'],
  ])('maps failed assignment status %i and warns about partial success', async (status, code) => {
    stubBackend({ 'POST /v1/routines/r1/assignments': { status, body: { detail: 'Backend detail' } } })

    await expect(routinesService.assign('r1', { clientIds: ['c1'], startDate: '2026-09-21', trainingDays: ['MONDAY'] }))
      .rejects.toMatchObject({ code, message: expect.stringContaining('solo a algunos clientes') })
  })
})
