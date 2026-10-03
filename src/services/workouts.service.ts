/**
 * Service for the workouts and the progress of a client, as seen by the trainer.
 *
 * @author Christian Matos
 * @packageDocumentation
 */

import type {
  ProgressChart,
  ProgressReport,
  ProgressWeeks,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutSessionSummary,
} from '@/types/workout'
import { apiClient } from './api-client'
import { type ErrorMapping, ServiceError, throwServiceError } from './service-error'

/**
 * Codes reported by {@link workoutsService}.
 *
 * @remarks
 * - `SESSION_NOT_FOUND`: the workout does not exist.
 * - `CLIENT_NOT_FOUND`: the client does not exist or belongs to another trainer.
 * - `INVALID_RANGE`: the server rejected the period.
 * - `UNEXPECTED`: any other failure.
 */
export type WorkoutsErrorCode = 'SESSION_NOT_FOUND' | 'CLIENT_NOT_FOUND' | 'INVALID_RANGE' | 'UNEXPECTED'

/** Largest page the backend serves; it holds the recent history of a client. */
const PAGE_SIZE = 100

interface WorkoutSessionResource {
  id: string
  scheduledFor: string
  dayLabel: string
  routineVersion: number
  status: string
  totalVolumeKg: number
  finishedAt: string | null
  exercises: {
    exerciseId: string
    exerciseName: string
    sets: { setNumber: number; loadKg: number; reps: number }[]
  }[]
}

interface WorkoutSessionPageResource {
  content: WorkoutSessionResource[]
}

interface ProgressReportResource {
  hasData: boolean
  adherencePercentage: number
  scheduled: number
  completed: number
  partial: number
  skipped: number
  exercises: {
    exerciseId: string
    exerciseName: string
    firstMaxLoadKg: number
    lastMaxLoadKg: number
    firstVolumeKg: number
    lastVolumeKg: number
  }[]
}

interface ProgressChartResource {
  enoughData: boolean
  points: { date: string; maxLoadKg: number; volumeKg: number }[]
}

const STATUSES: WorkoutSessionStatus[] = ['PENDING', 'COMPLETED', 'PARTIAL', 'SKIPPED']

function toStatus(status: string): WorkoutSessionStatus {
  return STATUSES.find((known) => known === status) ?? 'PENDING'
}

function toSummary(resource: WorkoutSessionResource): WorkoutSessionSummary {
  return {
    id: resource.id,
    scheduledFor: resource.scheduledFor,
    dayLabel: resource.dayLabel,
    status: toStatus(resource.status),
    totalVolumeKg: Number(resource.totalVolumeKg) || 0,
    finishedAt: resource.finishedAt,
  }
}

function toSession(resource: WorkoutSessionResource): WorkoutSession {
  return {
    ...toSummary(resource),
    routineVersion: resource.routineVersion,
    exercises: (resource.exercises ?? []).map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      sets: (exercise.sets ?? []).map((set) => ({
        setNumber: set.setNumber,
        loadKg: Number(set.loadKg) || 0,
        reps: set.reps,
      })),
    })),
  }
}

const CLIENT_NOT_FOUND: ErrorMapping<WorkoutsErrorCode> = {
  code: 'CLIENT_NOT_FOUND',
  message: 'No tienes acceso a este cliente.',
}
const SESSION_NOT_FOUND: ErrorMapping<WorkoutsErrorCode> = {
  code: 'SESSION_NOT_FOUND',
  message: 'No se encontró el entrenamiento solicitado.',
}
const INVALID_RANGE: ErrorMapping<WorkoutsErrorCode> = {
  code: 'INVALID_RANGE',
  message: 'El periodo solicitado no es válido.',
}
const UNEXPECTED: ErrorMapping<WorkoutsErrorCode> = {
  code: 'UNEXPECTED',
  message: 'No pudimos completar la operación. Inténtalo de nuevo.',
}

/**
 * Calls the tracking endpoints of the backend for one client.
 */
export const workoutsService = {
  /**
   * Fetches the workout sessions of a client.
   *
   * @param clientId - Identifier of the client.
   * @param signal - Signal used to cancel the request.
   * @returns The sessions, newest first; an empty array when there are none.
   * @throws {@link ServiceError} with code `CLIENT_NOT_FOUND` when the client is not in the portfolio.
   */
  async list(clientId: string, signal?: AbortSignal): Promise<WorkoutSessionSummary[]> {
    try {
      const page = await apiClient.get<WorkoutSessionPageResource>(
        `/clients/${clientId}/workout-sessions?page=0&size=${PAGE_SIZE}`,
        { signal },
      )
      return page.content.map(toSummary).sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor))
    } catch (error) {
      throwServiceError(error, { 403: CLIENT_NOT_FOUND, 404: CLIENT_NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Fetches one workout session of a client with its exercises and recorded sets.
   *
   * @remarks
   * The backend has no trainer endpoint for a single session; the session is read from the
   * history of the client, which already carries the exercises.
   *
   * @param clientId - Identifier of the client.
   * @param sessionId - Identifier of the session.
   * @param signal - Signal used to cancel the request.
   * @returns The session.
   * @throws {@link ServiceError} with code `SESSION_NOT_FOUND` when the session is not in the history.
   */
  async getById(clientId: string, sessionId: string, signal?: AbortSignal): Promise<WorkoutSession> {
    try {
      const page = await apiClient.get<WorkoutSessionPageResource>(
        `/clients/${clientId}/workout-sessions?page=0&size=${PAGE_SIZE}`,
        { signal },
      )
      const resource = page.content.find((session) => session.id === sessionId)
      if (!resource) throw new ServiceError<WorkoutsErrorCode>(SESSION_NOT_FOUND.code, SESSION_NOT_FOUND.message)
      return toSession(resource)
    } catch (error) {
      throwServiceError(error, { 403: CLIENT_NOT_FOUND, 404: CLIENT_NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Fetches the adherence of a client and the change per exercise in a period.
   *
   * @param clientId - Identifier of the client.
   * @param from - First day of the period, in `YYYY-MM-DD` format.
   * @param to - Last day of the period, in `YYYY-MM-DD` format.
   * @param signal - Signal used to cancel the request.
   * @returns The progress report of the period.
   * @throws {@link ServiceError} with code `INVALID_RANGE` when the server rejects the period.
   */
  async getProgressReport(clientId: string, from: string, to: string, signal?: AbortSignal): Promise<ProgressReport> {
    try {
      const report = await apiClient.get<ProgressReportResource>(
        `/clients/${clientId}/progress-reports?from=${from}&to=${to}`,
        { signal },
      )
      return {
        hasData: report.hasData,
        adherencePercentage: Number(report.adherencePercentage) || 0,
        scheduled: report.scheduled,
        completed: report.completed,
        partial: report.partial,
        skipped: report.skipped,
        exercises: (report.exercises ?? []).map((metric) => ({
          exerciseId: metric.exerciseId,
          exerciseName: metric.exerciseName,
          firstMaxLoadKg: Number(metric.firstMaxLoadKg) || 0,
          lastMaxLoadKg: Number(metric.lastMaxLoadKg) || 0,
          firstVolumeKg: Number(metric.firstVolumeKg) || 0,
          lastVolumeKg: Number(metric.lastVolumeKg) || 0,
        })),
      }
    } catch (error) {
      throwServiceError(error, { 400: INVALID_RANGE, 403: CLIENT_NOT_FOUND, 404: CLIENT_NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Fetches the evolution of one exercise over the last weeks.
   *
   * @param clientId - Identifier of the client.
   * @param exerciseId - Identifier of the exercise.
   * @param weeks - Length of the period, in weeks.
   * @param signal - Signal used to cancel the request.
   * @returns The sessions of the exercise in the period, oldest first.
   * @throws {@link ServiceError} with code `INVALID_RANGE` when the server rejects the period.
   */
  async getProgressChart(
    clientId: string,
    exerciseId: string,
    weeks: ProgressWeeks,
    signal?: AbortSignal,
  ): Promise<ProgressChart> {
    try {
      const chart = await apiClient.get<ProgressChartResource>(
        `/clients/${clientId}/progress-charts?exerciseId=${exerciseId}&weeks=${weeks}`,
        { signal },
      )
      return {
        enoughData: chart.enoughData,
        points: (chart.points ?? []).map((point) => ({
          date: point.date,
          maxLoadKg: Number(point.maxLoadKg) || 0,
          volumeKg: Number(point.volumeKg) || 0,
        })),
      }
    } catch (error) {
      throwServiceError(error, { 400: INVALID_RANGE, 403: CLIENT_NOT_FOUND, 404: CLIENT_NOT_FOUND }, UNEXPECTED)
    }
  },
}
