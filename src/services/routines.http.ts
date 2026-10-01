import type {
  AssignRoutineInput,
  DuplicateRoutineInput,
  PrescribedExercise,
  Routine,
  RoutineAssignment,
  RoutineSession,
  RoutineStatus,
  RoutineVersion,
  SaveRoutineInput,
} from '@/types/routine'
import { ApiError, apiClient } from './api-client'
import {
  RoutinesServiceError,
  type ListRoutinesParams,
  type RoutinesService,
  type RoutinesServiceErrorCode,
} from './routines.contract'

interface PrescribedExerciseResource {
  exerciseId: string
  exerciseName: string
  sets: number
  reps: number
  targetLoadKg: number
  restSeconds: number
}

interface RoutineSessionResource {
  order: number
  label: string
  exercises: PrescribedExerciseResource[]
}

interface RoutineResource {
  id: string
  name: string
  status: string
  currentVersion: number
  sessions: RoutineSessionResource[]
  createdAt: string
}

interface RoutinePageResource {
  content: RoutineResource[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

interface RoutineVersionResource {
  number: number
  changedAt: string
  author: string
  sessions: RoutineSessionResource[]
}

interface AssignmentResource {
  clientId: string
  routineId: string
  routineName: string
  startDate: string
  endDate: string | null
  current: boolean
}

const PAGE_SIZE = 100

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function mapStatus(status: string): RoutineStatus {
  if (status === 'ACTIVE' || status === 'CLOSED') return status
  return 'DRAFT'
}

function mapPrescribedExercise(dto: PrescribedExerciseResource): PrescribedExercise {
  return {
    exerciseId: String(dto.exerciseId),
    exerciseName: dto.exerciseName,
    sets: dto.sets,
    reps: dto.reps,
    targetLoadKg: Number(dto.targetLoadKg),
    restSeconds: dto.restSeconds,
  }
}

function mapSession(dto: RoutineSessionResource): RoutineSession {
  return {
    order: dto.order,
    label: dto.label,
    exercises: (dto.exercises ?? []).map(mapPrescribedExercise),
  }
}

function mapRoutine(dto: RoutineResource): Routine {
  return {
    id: String(dto.id),
    name: dto.name,
    status: mapStatus(dto.status),
    currentVersion: dto.currentVersion,
    sessions: (dto.sessions ?? []).map(mapSession),
    createdAt: dto.createdAt,
    createdAtLabel: formatDate(dto.createdAt),
  }
}

function mapVersion(dto: RoutineVersionResource): RoutineVersion {
  return {
    number: dto.number,
    changedAt: dto.changedAt,
    changedAtLabel: formatDate(dto.changedAt),
    author: dto.author,
    sessions: (dto.sessions ?? []).map(mapSession),
  }
}

function mapAssignment(dto: AssignmentResource): RoutineAssignment {
  return {
    clientId: String(dto.clientId),
    routineId: String(dto.routineId),
    routineName: dto.routineName,
    startDate: dto.startDate,
    endDate: dto.endDate,
    current: dto.current,
  }
}

function toRequestBody(input: SaveRoutineInput) {
  return {
    name: input.name.trim(),
    sessions: input.sessions.map((session) => ({
      label: session.label.trim(),
      exercises: session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        targetLoadKg: exercise.targetLoadKg,
        restSeconds: exercise.restSeconds,
      })),
    })),
  }
}

function userFacingMessage(error: ApiError, fallback: string): string {
  return error.message.trim() || fallback
}

function mapApiError(error: unknown, fallbackCode: RoutinesServiceErrorCode): never {
  if (error instanceof RoutinesServiceError) throw error
  if (error instanceof ApiError) {
    if (error.status === 404) {
      throw new RoutinesServiceError('ROUTINE_NOT_FOUND', userFacingMessage(error, 'No encontramos esa rutina.'))
    }
    if (error.status === 422) {
      const message = userFacingMessage(error, 'Revisa los datos de la rutina e inténtalo de nuevo.')
      const code = message.toLowerCase().includes('archiv') ? 'EXERCISE_ARCHIVED' : 'VALIDATION'
      throw new RoutinesServiceError(code, message)
    }
    throw new RoutinesServiceError(
      fallbackCode,
      userFacingMessage(error, 'No pudimos completar la operación. Inténtalo de nuevo.'),
    )
  }
  throw new RoutinesServiceError(fallbackCode, 'No pudimos completar la operación. Inténtalo de nuevo.')
}

async function fetchAllRoutines(): Promise<Routine[]> {
  const routines: Routine[] = []
  let page = 0
  let totalPages = 1

  while (page < totalPages) {
    const result = await apiClient.get<RoutinePageResource>(`/v1/routines?page=${page}&size=${PAGE_SIZE}`)
    totalPages = Math.max(result.totalPages, 1)
    routines.push(...result.content.map(mapRoutine))
    page += 1
  }

  return routines
}

export function createHttpRoutinesService(): RoutinesService {
  return {
    async list(params: ListRoutinesParams = {}) {
      const page = params.page ?? 0
      const size = params.size ?? PAGE_SIZE
      try {
        if (params.page !== undefined || params.size !== undefined) {
          const result = await apiClient.get<RoutinePageResource>(`/v1/routines?page=${page}&size=${size}`)
          return result.content.map(mapRoutine)
        }
        return await fetchAllRoutines()
      } catch (error) {
        mapApiError(error, 'UNEXPECTED')
      }
    },

    async getById(routineId: string) {
      try {
        const routine = await apiClient.get<RoutineResource>(`/v1/routines/${routineId}`)
        return mapRoutine(routine)
      } catch (error) {
        mapApiError(error, 'ROUTINE_NOT_FOUND')
      }
    },

    async create(input: SaveRoutineInput) {
      try {
        const created = await apiClient.post<RoutineResource>('/v1/routines', toRequestBody(input))
        return mapRoutine(created)
      } catch (error) {
        mapApiError(error, 'VALIDATION')
      }
    },

    async update(routineId: string, input: SaveRoutineInput) {
      try {
        const updated = await apiClient.put<RoutineResource>(`/v1/routines/${routineId}`, toRequestBody(input))
        return mapRoutine(updated)
      } catch (error) {
        mapApiError(error, 'VALIDATION')
      }
    },

    async getVersions(routineId: string) {
      try {
        const versions = await apiClient.get<RoutineVersionResource[]>(`/v1/routines/${routineId}/versions`)
        return versions.map(mapVersion)
      } catch (error) {
        mapApiError(error, 'ROUTINE_NOT_FOUND')
      }
    },

    async duplicate(routineId: string, input: DuplicateRoutineInput) {
      try {
        const duplicated = await apiClient.post<RoutineResource>(`/v1/routines/${routineId}/duplicates`, {
          name: input.name.trim(),
        })
        return mapRoutine(duplicated)
      } catch (error) {
        mapApiError(error, 'ROUTINE_NOT_FOUND')
      }
    },

    async assign(routineId: string, input: AssignRoutineInput) {
      try {
        const assignments = await apiClient.post<AssignmentResource[]>(`/v1/routines/${routineId}/assignments`, {
          clientIds: input.clientIds,
          startDate: input.startDate,
        })
        return assignments.map(mapAssignment)
      } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
          throw new RoutinesServiceError(
            'CLIENT_NOT_ASSIGNABLE',
            userFacingMessage(error, 'Uno o más clientes no se pueden asignar.'),
          )
        }
        mapApiError(error, 'UNEXPECTED')
      }
    },
  }
}
