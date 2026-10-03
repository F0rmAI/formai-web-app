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
  { id: 'c2', fullName: 'Andrea Quispe', email: null, status: 'INVITED', registeredAt: longAgo },
  { id: 'c3', fullName: 'Lucía Fernández', email: null, status: 'INVITED', registeredAt: recently },
]
const overviews = [{ clientId: 'c1', activeRoutineName: 'Hipertrofia · 4 días', lastWorkoutOn: '2026-09-16' }]

describe('clientsService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists the clients with their routine, last workout and derived invitation status', async () => {
    const requests = stubBackend({ 'GET /clients': { content: clients }, 'GET /client-overviews': { content: overviews } })

    const result = await clientsService.list(' Die ', 'ALL')

    expect(requests[0].path).toBe('/clients?page=0&size=100&search=Die')
    expect(result.map((client) => client.status)).toEqual(['ACTIVE', 'INVITATION_EXPIRED', 'INVITED'])
    expect(result[0]).toMatchObject({ currentRoutine: 'Hipertrofia · 4 días', lastWorkout: 'Mié 16 sep 2026' })
    expect(result[1]).toMatchObject({ email: null, currentRoutine: null, lastWorkout: null })
  })

  it('asks the backend for invited clients and keeps only the expired ones', async () => {
    const requests = stubBackend({ 'GET /clients': { content: clients.slice(1) }, 'GET /client-overviews': { content: [] } })

    const result = await clientsService.list('', 'INVITATION_EXPIRED')

    expect(requests[0].path).toContain('status=INVITED')
    expect(result.map((client) => client.id)).toEqual(['c2'])
  })

  it('reports an unexpected failure with a message ready to show', async () => {
    stubBackend({ 'GET /': { status: 500, body: { detail: 'Boom' } } })

    await expect(clientsService.list()).rejects.toMatchObject({ code: 'UNEXPECTED', message: expect.stringContaining('No pudimos') })
  })

  it('builds the detail of a client with its profile and current routine', async () => {
    stubBackend({
      'GET /clients/c1': clients[0],
      'GET /clients/c1/body-profile': {
        goal: 'Hipertrofia',
        heightCm: 176,
        weightKg: 78,
        restrictions: null,
        weightHistory: [
          { weightKg: 79.5, recordedOn: '2026-09-01' },
          { weightKg: 78, recordedOn: '2026-09-15' },
        ],
      },
      'GET /clients/c1/assignments': [
        { clientId: 'c1', routineId: 'r1', routineName: 'Hipertrofia · 4 días', startDate: '2026-09-01', endDate: null, trainingDays: ['MONDAY', 'WEDNESDAY'], current: true },
        { clientId: 'c1', routineId: 'r0', routineName: null, startDate: '2026-08-01', endDate: '2026-08-31', trainingDays: ['TUESDAY'], current: false },
      ],
      'GET /routines/r1': { currentVersion: 2 },
      'GET /client-overviews': { content: overviews },
    })

    const detail = await clientsService.getById('c1')

    expect(detail.bodyProfile).toMatchObject({ goal: 'Hipertrofia', weight: 78, height: 176, restrictions: '', updatedAt: '15 sep' })
    expect(detail.bodyProfile.weightHistory).toEqual([
      { date: '15 sep 2026', weight: 78 },
      { date: '1 sep 2026', weight: 79.5 },
    ])
    expect(detail.routine).toEqual({ id: 'r1', name: 'Hipertrofia · 4 días', assignedSince: '1 de septiembre de 2026', version: 2, trainingDays: ['MONDAY', 'WEDNESDAY'] })
    expect(detail.assignments).toMatchObject([
      { routineName: 'Hipertrofia · 4 días', endDate: null, current: true },
      { routineName: 'Rutina de otro entrenador', endDate: '31 ago 2026', trainingDays: ['TUESDAY'] },
    ])
  })

  it('treats a client without body profile or routine as empty, not as an error', async () => {
    stubBackend({
      'GET /clients/c2': clients[1],
      'GET /clients/c2/body-profile': { status: 404 },
      'GET /clients/c2/assignments': [],
      'GET /client-overviews': { content: [] },
    })

    const detail = await clientsService.getById('c2')

    expect(detail.bodyProfile).toMatchObject({ goal: '', weight: 0, weightHistory: [] })
    expect(detail.routine).toBeNull()
    expect(detail.assignments).toEqual([])
  })

  it('reports a client outside the portfolio as not found', async () => {
    stubBackend({ 'GET /': { status: 404 } })

    await expect(clientsService.getById('zz')).rejects.toMatchObject({ code: 'CLIENT_NOT_FOUND' })
  })

  it('reads the current assignment id and maps a forbidden composition response', async () => {
    const requests = stubBackend({
      'GET /clients/c1/assignments': [{ routineId: 'r2', routineName: 'Otra rutina', current: true }],
      'GET /clients/c9/assignments': { status: 403 },
    })

    await expect(clientsService.getCurrentAssignment('c1')).resolves.toEqual({ routineId: 'r2', routineName: 'Otra rutina' })
    await expect(clientsService.getCurrentAssignment('c9')).rejects.toMatchObject({ code: 'CLIENT_NOT_FOUND' })
    expect(requests.filter((request) => request.path.includes('/assignments'))).toHaveLength(2)
  })

  it('registers a client and returns the activation code with its expiration formatted', async () => {
    const requests = stubBackend({
      'POST /clients': { id: 'c9', fullName: 'Lucía Fernández', status: 'INVITED', activationCode: 'FA-7K2Q', activationCodeExpiresAt: '2026-09-20T10:30:00' },
    })

    const code = await clientsService.register({ fullName: 'Lucía Fernández' })

    expect(requests[0].body).toEqual({ fullName: 'Lucía Fernández' })
    expect(code).toEqual({ clientId: 'c9', clientName: 'Lucía Fernández', code: 'FA-7K2Q', expiresAt: '20 de septiembre de 2026, 10:30' })
  })

  it('reports an invalid registration name', async () => {
    stubBackend({ 'POST /clients': { status: 400 } })

    await expect(clientsService.register({ fullName: '' })).rejects.toMatchObject({
      code: 'INVALID_CLIENT_NAME',
      message: expect.stringContaining('120'),
    })
  })

  it('renames a client and sends only the full name', async () => {
    const updated = { ...clients[0], fullName: 'Diego Ramos' }
    const requests = stubBackend({ 'PUT /clients/c1': updated })

    await expect(clientsService.rename('c1', ' Diego Ramos ')).resolves.toEqual(updated)
    expect(requests[0]).toMatchObject({ method: 'PUT', path: '/clients/c1', body: { fullName: 'Diego Ramos' } })
  })

  it.each([400, 403, 404])('maps rename status %i to a Spanish service error', async (status) => {
    stubBackend({ 'PUT /clients/c1': { status, body: { detail: 'Backend detail' } } })

    await expect(clientsService.rename('c1', 'Diego')).rejects.toMatchObject({
      code: status === 400 ? 'INVALID_CLIENT_NAME' : 'CLIENT_NOT_FOUND',
      message: expect.not.stringContaining('Backend detail'),
    })
  })

  it('regenerates the activation code, after which the client counts as invited again', async () => {
    const expiresAt = new Date(Date.now() + 72 * HOUR).toISOString()
    stubBackend({
      'POST /clients/c2/activation-codes': { clientId: 'c2', activationCode: 'FA-Q9M3', expiresAt },
      'GET /clients/c2': clients[1],
      'GET /clients?': { content: [clients[1]] },
      'GET /client-overviews': { content: [] },
    })

    const code = await clientsService.regenerateCode('c2')
    const [client] = await clientsService.list()

    expect(code).toMatchObject({ clientId: 'c2', clientName: 'Andrea Quispe', code: 'FA-Q9M3' })
    expect(client.status).toBe('INVITED')
  })

  it('explains that an activated client cannot receive another code', async () => {
    stubBackend({ 'POST /clients/c1/activation-codes': { status: 409, body: { detail: 'Account active' } } })

    await expect(clientsService.regenerateCode('c1')).rejects.toMatchObject({
      code: 'ALREADY_ACTIVATED', message: 'Este cliente ya activó su cuenta y no necesita otro código.',
    })
  })

  it('sends the body profile with the field names of the backend', async () => {
    const requests = stubBackend({ 'PUT /clients/c1/body-profile': {} })

    await clientsService.updateBodyProfile('c1', { goal: 'Fuerza', weight: 77.5, height: 176, restrictions: '' })

    expect(requests[0].body).toEqual({ goal: 'Fuerza', heightCm: 176, weightKg: 77.5, restrictions: null })
  })

  it('reports a rejected body profile', async () => {
    stubBackend({ 'PUT /': { status: 422 } })

    await expect(
      clientsService.updateBodyProfile('c1', { goal: 'Fuerza', weight: 1, height: 1, restrictions: '' }),
    ).rejects.toMatchObject({ code: 'INVALID_BODY_PROFILE' })
  })

  it.each([
    ['goal', 'INVALID_GOAL'],
    ['heightCm', 'INVALID_HEIGHT'],
    ['weightKg', 'INVALID_WEIGHT'],
  ])('maps the body profile field %s from a 422', async (field, code) => {
    stubBackend({ 'PUT /clients/c1/body-profile': { status: 422, body: { detail: 'Out of range', field } } })

    await expect(clientsService.updateBodyProfile('c1', { goal: 'Fuerza', height: 170, weight: 75, restrictions: '' }))
      .rejects.toMatchObject({ code, message: expect.not.stringContaining('Out of range') })
  })

  it('maps blank body profile fields to a Spanish validation error', async () => {
    stubBackend({ 'PUT /clients/c1/body-profile': { status: 400, body: { detail: 'Bad request' } } })

    await expect(clientsService.updateBodyProfile('c1', { goal: '', height: 170, weight: 75, restrictions: '' }))
      .rejects.toMatchObject({ code: 'INVALID_BODY_PROFILE', message: expect.not.stringContaining('Bad request') })
  })

  it('deactivates a client', async () => {
    const requests = stubBackend({ 'POST /clients/c1/deactivations': {} })

    await clientsService.deactivate('c1')

    expect(requests[0]).toMatchObject({ method: 'POST', path: '/clients/c1/deactivations' })
  })
})
