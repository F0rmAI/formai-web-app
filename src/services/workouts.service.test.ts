/**
 * Tests for the workouts service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { stubBackend } from '@/test/backend'
import { workoutsService } from './workouts.service'

const older = {
  id: 's1',
  scheduledFor: '2026-09-14',
  dayLabel: 'Día C',
  routineVersion: 2,
  status: 'COMPLETED',
  totalVolumeKg: '5450.00',
  finishedAt: '2026-09-14T18:40:00',
  exercises: [{ exerciseId: 'e1', exerciseName: 'Remo', sets: [{ setNumber: 1, loadKg: '45.5', reps: 10 }] }],
}
const newer = { ...older, id: 's2', scheduledFor: '2026-09-16', dayLabel: 'Día D', status: 'UNKNOWN', finishedAt: null, exercises: [] }

describe('workoutsService', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('lists the sessions of a client newest first', async () => {
    stubBackend({ 'GET /clients/c1/workout-sessions': { content: [older, newer] } })

    const sessions = await workoutsService.list('c1')

    expect(sessions.map((session) => session.id)).toEqual(['s2', 's1'])
    expect(sessions[0]).toMatchObject({ status: 'PENDING', finishedAt: null })
    expect(sessions[1]).toMatchObject({ status: 'COMPLETED', totalVolumeKg: 5450 })
  })

  it('reads one session from the history of the client', async () => {
    stubBackend({ 'GET /clients/c1/workout-sessions': { content: [older, newer] } })

    const session = await workoutsService.getById('c1', 's1')

    expect(session).toMatchObject({ id: 's1', routineVersion: 2 })
    expect(session.exercises[0].sets[0]).toEqual({ setNumber: 1, loadKg: 45.5, reps: 10 })
  })

  it('reports a session that is not in the history', async () => {
    stubBackend({ 'GET /clients/c1/workout-sessions': { content: [older] } })

    await expect(workoutsService.getById('c1', 'zz')).rejects.toMatchObject({ code: 'SESSION_NOT_FOUND' })
  })

  it('reports a client of another trainer', async () => {
    stubBackend({ 'GET /': { status: 403 } })

    await expect(workoutsService.list('c9')).rejects.toMatchObject({ code: 'CLIENT_NOT_FOUND' })
  })

  it('fetches the progress report of a period', async () => {
    const requests = stubBackend({
      'GET /clients/c1/progress-reports': {
        adherencePercentage: '83.33',
        scheduled: 24,
        completed: 20,
        partial: 2,
        skipped: 2,
        hasData: true,
        exercises: [{ exerciseId: 'e1', exerciseName: 'Press', firstMaxLoadKg: '30', lastMaxLoadKg: '34', firstVolumeKg: '2980', lastVolumeKg: '3840' }],
      },
    })

    const report = await workoutsService.getProgressReport('c1', '2026-08-01', '2026-09-25')

    expect(requests[0].path).toBe('/clients/c1/progress-reports?from=2026-08-01&to=2026-09-25')
    expect(report).toMatchObject({ adherencePercentage: 83.33, scheduled: 24, hasData: true })
    expect(report.exercises[0]).toMatchObject({ firstMaxLoadKg: 30, lastVolumeKg: 3840 })
  })

  it('fetches the evolution of an exercise', async () => {
    const requests = stubBackend({
      'GET /clients/c1/progress-charts': { enoughData: true, points: [{ date: '2026-09-01', maxLoadKg: '30', volumeKg: '2980' }] },
    })

    const chart = await workoutsService.getProgressChart('c1', 'e1', 8)

    expect(requests[0].path).toBe('/clients/c1/progress-charts?exerciseId=e1&weeks=8')
    expect(chart).toEqual({ enoughData: true, points: [{ date: '2026-09-01', maxLoadKg: 30, volumeKg: 2980 }] })
  })

  it('preserves the backend hasData flag for an empty period', async () => {
    stubBackend({ 'GET /clients/c1/progress-reports': {
      hasData: false, adherencePercentage: 0, scheduled: 0, completed: 0, partial: 0, skipped: 0, exercises: [],
    } })

    await expect(workoutsService.getProgressReport('c1', '2026-09-01', '2026-09-30'))
      .resolves.toMatchObject({ hasData: false, exercises: [] })
  })

  it('reports a rejected period', async () => {
    stubBackend({ 'GET /': { status: 400 } })

    await expect(workoutsService.getProgressReport('c1', 'x', 'y')).rejects.toMatchObject({ code: 'INVALID_RANGE' })
  })
})
