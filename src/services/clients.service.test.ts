/**
 * Tests for the clients service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { clientsService } from './clients.service'

const HOUR = 60 * 60 * 1000
const recently = new Date(Date.now() - HOUR).toISOString()
const longAgo = new Date(Date.now() - 100 * HOUR).toISOString()

const clients = [
  { id: 'c1', fullName: 'Diego Paredes', email: 'diego@correo.com', status: 'ACTIVE', registeredAt: longAgo },
  { id: 'c2', fullName: 'Andrea Quispe', email: 'andrea@correo.com', status: 'INVITED', registeredAt: longAgo },
  { id: 'c3', fullName: 'Lucía Fernández', email: 'lucia@correo.com', status: 'INVITED', registeredAt: recently },
]
const overviews = [{ clientId: 'c1', activeRoutineName: 'Hipertrofia · 4 días', lastWorkoutOn: '2026-09-16' }]

describe('clientsService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists the clients with their routine, last workout and derived invitation status', async () => {
    const requests = stubBackend({ 'GET /v1/clients': { content: clients }, 'GET /v1/client-overviews': { content: overviews } })

    const result = await clientsService.list(' Die ', 'ALL')

    expect(requests[0].path).toBe('/v1/clients?page=0&size=100&search=Die')
    expect(result.map((client) => client.status)).toEqual(['ACTIVE', 'INVITATION_EXPIRED', 'INVITED'])
    expect(result[0]).toMatchObject({ currentRoutine: 'Hipertrofia · 4 días', lastWorkout: 'Mié 16 sep 2026' })
    expect(result[1]).toMatchObject({ currentRoutine: null, lastWorkout: null })
  })

  it('asks the backend for invited clients and keeps only the expired ones', async () => {
    const requests = stubBackend({ 'GET /v1/clients': { content: clients.slice(1) }, 'GET /v1/client-overviews': { content: [] } })

    const result = await clientsService.list('', 'INVITATION_EXPIRED')

    expect(requests[0].path).toContain('status=INVITED')
    expect(result.map((client) => client.id)).toEqual(['c2'])
  })

  it('reports an unexpected failure with a message ready to show', async () => {
    stubBackend({ 'GET /v1': { status: 500, body: { detail: 'Boom' } } })

    await expect(clientsService.list()).rejects.toMatchObject({ code: 'UNEXPECTED', message: expect.stringContaining('No pudimos') })
  })

  it('builds the detail of a client with its profile and current routine', async () => {
    stubBackend({
      'GET /v1/clients/c1': clients[0],
      'GET /v1/clients/c1/body-profile': {
        goal: 'Hipertrofia',
        heightCm: 176,
        weightKg: 78,
        restrictions: null,
        weightHistory: [
          { weightKg: 79.5, recordedOn: '2026-09-01' },
          { weightKg: 78, recordedOn: '2026-09-15' },
        ],
      },
      'GET /v1/clients/c1/assignments': [
        { routineId: 'r0', routineName: 'Resistencia', startDate: '2026-08-01', current: false },
        { routineId: 'r1', routineName: 'Hipertrofia · 4 días', startDate: '2026-09-01', current: true },
      ],
      'GET /v1/routines/r1': { currentVersion: 2 },
      'GET /v1/client-overviews': { content: overviews },
    })

    const detail = await clientsService.getById('c1')

    expect(detail.bodyProfile).toMatchObject({ goal: 'Hipertrofia', weight: 78, height: 176, restrictions: '', updatedAt: '15 sep' })
    expect(detail.bodyProfile.weightHistory).toEqual([
      { date: '15 sep 2026', weight: 78 },
      { date: '1 sep 2026', weight: 79.5 },
    ])
    expect(detail.routine).toEqual({ id: 'r1', name: 'Hipertrofia · 4 días', assignedSince: '1 de septiembre de 2026', version: 2 })
  })

  it('treats a client without body profile or routine as empty, not as an error', async () => {
    stubBackend({
      'GET /v1/clients/c2': clients[1],
      'GET /v1/clients/c2/body-profile': { status: 404 },
      'GET /v1/clients/c2/assignments': [],
      'GET /v1/client-overviews': { content: [] },
    })

    const detail = await clientsService.getById('c2')

    expect(detail.bodyProfile).toMatchObject({ goal: '', weight: 0, weightHistory: [] })
    expect(detail.routine).toBeNull()
  })

  it('reports a client outside the portfolio as not found', async () => {
    stubBackend({ 'GET /v1': { status: 404 } })

    await expect(clientsService.getById('zz')).rejects.toMatchObject({ code: 'CLIENT_NOT_FOUND' })
  })

  it('registers a client and returns the activation code with its expiration formatted', async () => {
    const requests = stubBackend({
      'POST /v1/clients': { id: 'c9', fullName: 'Lucía Fernández', activationCode: 'FA-7K2Q', activationCodeExpiresAt: '2026-09-20T10:30:00' },
    })

    const code = await clientsService.register({ fullName: 'Lucía Fernández', email: 'lucia@correo.com' })

    expect(requests[0].body).toEqual({ fullName: 'Lucía Fernández', email: 'lucia@correo.com' })
    expect(code).toEqual({ clientId: 'c9', clientName: 'Lucía Fernández', code: 'FA-7K2Q', expiresAt: '20 de septiembre de 2026, 10:30' })
  })

  it('names the client that already uses the email', async () => {
    stubBackend({ 'POST /v1/clients': { status: 409 }, 'GET /v1/clients': { content: clients } })

    await expect(clientsService.register({ fullName: 'Otro', email: 'DIEGO@correo.com' })).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Este correo ya pertenece a uno de tus clientes (Diego Paredes).',
    })
  })

  it('regenerates the activation code, after which the client counts as invited again', async () => {
    const expiresAt = new Date(Date.now() + 72 * HOUR).toISOString()
    stubBackend({
      'POST /v1/clients/c2/activation-codes': { clientId: 'c2', activationCode: 'FA-Q9M3', expiresAt },
      'GET /v1/clients/c2': clients[1],
      'GET /v1/clients?': { content: [clients[1]] },
      'GET /v1/client-overviews': { content: [] },
    })

    const code = await clientsService.regenerateCode('c2')
    const [client] = await clientsService.list()

    expect(code).toMatchObject({ clientId: 'c2', clientName: 'Andrea Quispe', code: 'FA-Q9M3' })
    expect(client.status).toBe('INVITED')
  })

  it('sends the body profile with the field names of the backend', async () => {
    const requests = stubBackend({ 'PUT /v1/clients/c1/body-profile': {} })

    await clientsService.updateBodyProfile('c1', { goal: 'Fuerza', weight: 77.5, height: 176, restrictions: '' })

    expect(requests[0].body).toEqual({ goal: 'Fuerza', heightCm: 176, weightKg: 77.5, restrictions: null })
  })

  it('reports a rejected body profile', async () => {
    stubBackend({ 'PUT /v1': { status: 422 } })

    await expect(
      clientsService.updateBodyProfile('c1', { goal: 'Fuerza', weight: 1, height: 1, restrictions: '' }),
    ).rejects.toMatchObject({ code: 'INVALID_BODY_PROFILE' })
  })

  it('deactivates a client', async () => {
    const requests = stubBackend({ 'POST /v1/clients/c1/deactivations': {} })

    await clientsService.deactivate('c1')

    expect(requests[0]).toMatchObject({ method: 'POST', path: '/v1/clients/c1/deactivations' })
  })
})
