import { ApiError, apiClient } from './api-client'
import { WorkoutsServiceError, type WorkoutsService } from './workouts.contract'
import type {
  ProgressChart,
  ProgressReport,
  ProgressWeeks,
  RecordSetInput,
  WorkoutExercise,
  WorkoutSession,
  WorkoutSessionStatus,
  WorkoutSessionSummary,
  WorkoutSet,
} from '@/types/workout'

interface SetEntryResource {
  setNumber: number
  loadKg: number
  reps: number
  recordedAt: string | null
}

interface SessionExerciseResource {
  exerciseId: string
  exerciseName: string
  targetSets: number
  targetReps: number
  targetLoadKg: number
  sets: SetEntryResource[]
}

interface WorkoutSessionResource {
  id: string
  scheduledFor: string
  dayLabel: string
  routineVersion: number
  status: string
  totalVolumeKg: number
  finishedAt: string | null
  exercises: SessionExerciseResource[]
}

interface WorkoutSessionPageResource {
  content: WorkoutSessionResource[]
}

interface ExerciseMetricResource {
  exerciseId: string
  exerciseName: string
  firstMaxLoadKg: number
  lastMaxLoadKg: number
  firstVolumeKg: number
  lastVolumeKg: number
}

interface ProgressReportResource {
  clientId: string
  from: string
  to: string
  adherencePercentage: number
  scheduled: number
  completed: number
  partial: number
  skipped: number
  exercises: ExerciseMetricResource[]
  hasData: boolean
}

interface ProgressPointResource {
  date: string
  maxLoadKg: number
  volumeKg: number
}

interface ProgressChartResource {
  exerciseId: string
  weeks: number
  enoughData: boolean
  points: ProgressPointResource[]
}

function mapStatus(status: string): WorkoutSessionStatus {
  if (status === 'PENDING' || status === 'COMPLETED' || status === 'PARTIAL' || status === 'SKIPPED') {
    return status
  }
  return 'PENDING'
}

function mapSet(dto: SetEntryResource): WorkoutSet {
  return {
    setNumber: dto.setNumber,
    loadKg: Number(dto.loadKg) || 0,
    reps: dto.reps,
    recordedAt: dto.recordedAt,
  }
}

function mapExercise(dto: SessionExerciseResource): WorkoutExercise {
  return {
    exerciseId: dto.exerciseId,
    exerciseName: dto.exerciseName,
    targetSets: dto.targetSets,
    targetReps: dto.targetReps,
    targetLoadKg: Number(dto.targetLoadKg) || 0,
    sets: (dto.sets ?? []).map(mapSet),
  }
}

function mapSession(dto: WorkoutSessionResource, clientId: string): WorkoutSession {
  return {
    id: dto.id,
    clientId,
    scheduledFor: dto.scheduledFor,
    dayLabel: dto.dayLabel,
    routineVersion: dto.routineVersion,
    status: mapStatus(dto.status),
    totalVolumeKg: Number(dto.totalVolumeKg) || 0,
    finishedAt: dto.finishedAt,
    exercises: (dto.exercises ?? []).map(mapExercise),
  }
}

function toSummary(session: WorkoutSession): WorkoutSessionSummary {
  return {
    id: session.id,
    scheduledFor: session.scheduledFor,
    dayLabel: session.dayLabel,
    status: session.status,
    totalVolumeKg: session.totalVolumeKg,
  }
}

function sortByDateDesc(a: WorkoutSessionSummary, b: WorkoutSessionSummary) {
  return b.scheduledFor.localeCompare(a.scheduledFor)
}

function sessionPath(clientId: string, sessionId: string) {
  return `/v1/clients/${clientId}/workout-sessions/${sessionId}`
}

function mapApiError(error: unknown, fallback: WorkoutsServiceError['code']): never {
  if (error instanceof WorkoutsServiceError) throw error
  if (error instanceof ApiError) {
    if (error.status === 404) {
      throw new WorkoutsServiceError('SESSION_NOT_FOUND', 'No se encontró el entrenamiento solicitado.')
    }
    if (error.status === 403) {
      throw new WorkoutsServiceError('CLIENT_NOT_FOUND', 'No tienes acceso a este cliente.')
    }
    if (error.status === 409) {
      throw new WorkoutsServiceError(
        'SESSION_CONFLICT',
        error.message || 'La sesión ya está cerrada o faltan series por confirmar.',
      )
    }
    if (error.status === 422) {
      throw new WorkoutsServiceError('INVALID_SET', error.message || 'Los datos de la serie no son válidos.')
    }
    if (error.status === 400) {
      throw new WorkoutsServiceError('INVALID_RANGE', error.message || 'La solicitud no es válida.')
    }
    throw new WorkoutsServiceError(fallback, error.message || 'No pudimos completar la operación.')
  }
  throw error instanceof Error ? error : new Error('Error inesperado al hablar con el servidor.')
}

async function writeSet(
  clientId: string,
  sessionId: string,
  input: RecordSetInput,
  kind: 'sets' | 'corrections',
): Promise<WorkoutSession> {
  try {
    const updated = await apiClient.post<WorkoutSessionResource>(`${sessionPath(clientId, sessionId)}/${kind}`, {
      exerciseId: input.exerciseId,
      setNumber: input.setNumber,
      loadKg: input.loadKg,
      reps: input.reps,
    })
    return mapSession(updated, clientId)
  } catch (error) {
    mapApiError(error, 'INVALID_SET')
  }
}

export function createHttpWorkoutsService(): WorkoutsService {
  return {
    async list(clientId: string) {
      try {
        const page = await apiClient.get<WorkoutSessionPageResource>(
          `/v1/clients/${clientId}/workout-sessions?page=0&size=100`,
        )
        return page.content
          .map((item) => toSummary(mapSession(item, clientId)))
          .sort(sortByDateDesc)
      } catch (error) {
        mapApiError(error, 'CLIENT_NOT_FOUND')
      }
    },

    async getById(clientId: string, sessionId: string) {
      try {
        const session = await apiClient.get<WorkoutSessionResource>(sessionPath(clientId, sessionId))
        return mapSession(session, clientId)
      } catch (error) {
        mapApiError(error, 'SESSION_NOT_FOUND')
      }
    },

    async recordSet(clientId, sessionId, input) {
      return writeSet(clientId, sessionId, input, 'sets')
    },

    async correctSet(clientId, sessionId, input) {
      return writeSet(clientId, sessionId, input, 'corrections')
    },

    async finishSession(clientId, sessionId, confirmPartial) {
      try {
        const updated = await apiClient.post<WorkoutSessionResource>(
          `${sessionPath(clientId, sessionId)}/completions`,
          { confirmPartial },
        )
        return mapSession(updated, clientId)
      } catch (error) {
        mapApiError(error, 'SESSION_CONFLICT')
      }
    },

    async getProgressReport(clientId: string, from: string, to: string) {
      try {
        const report = await apiClient.get<ProgressReportResource>(
          `/v1/clients/${clientId}/progress-reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        )
        return {
          clientId: report.clientId,
          from: report.from,
          to: report.to,
          adherencePercentage: Number(report.adherencePercentage) || 0,
          scheduled: report.scheduled,
          completed: report.completed,
          partial: report.partial,
          skipped: report.skipped,
          hasData: report.hasData,
          exercises: (report.exercises ?? []).map((item) => ({
            exerciseId: item.exerciseId,
            exerciseName: item.exerciseName,
            firstMaxLoadKg: Number(item.firstMaxLoadKg) || 0,
            lastMaxLoadKg: Number(item.lastMaxLoadKg) || 0,
            firstVolumeKg: Number(item.firstVolumeKg) || 0,
            lastVolumeKg: Number(item.lastVolumeKg) || 0,
          })),
        } satisfies ProgressReport
      } catch (error) {
        mapApiError(error, 'INVALID_RANGE')
      }
    },

    async getProgressChart(clientId: string, exerciseId: string, weeks: ProgressWeeks) {
      try {
        const chart = await apiClient.get<ProgressChartResource>(
          `/v1/clients/${clientId}/progress-charts?exerciseId=${encodeURIComponent(exerciseId)}&weeks=${weeks}`,
        )
        return {
          exerciseId: chart.exerciseId,
          weeks: (chart.weeks === 8 || chart.weeks === 12 ? chart.weeks : 4) as ProgressWeeks,
          enoughData: chart.enoughData,
          points: (chart.points ?? []).map((point) => ({
            date: point.date,
            maxLoadKg: Number(point.maxLoadKg) || 0,
            volumeKg: Number(point.volumeKg) || 0,
          })),
        } satisfies ProgressChart
      } catch (error) {
        mapApiError(error, 'INVALID_RANGE')
      }
    },
  }
}
