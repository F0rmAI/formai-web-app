/**
 * Service for the routines of a trainer.
 *
 * @author Johan Quiñones
 * @packageDocumentation
 */

import type {
  AssignRoutineInput,
  Routine,
  RoutineSession,
  RoutineStatus,
  RoutineVersion,
  SaveRoutineInput,
} from '@/types/routine'
import { formatDate, formatDateTime } from '@/utils/format'
import { apiClient } from './api-client'
import { type ErrorMapping, throwServiceError } from './service-error'

/**
 * Codes reported by {@link routinesService}.
 *
 * @remarks
 * - `ROUTINE_NOT_FOUND`: the routine does not exist or belongs to another trainer.
 * - `VALIDATION`: the server rejected the routine data.
 * - `CLIENT_NOT_ASSIGNABLE`: a selected client is not active and cannot receive routines.
 * - `UNEXPECTED`: any other failure.
 */
export type RoutinesErrorCode = 'ROUTINE_NOT_FOUND' | 'VALIDATION' | 'CLIENT_NOT_ASSIGNABLE' | 'UNEXPECTED'

/** Page size that fits the routines of a trainer in few requests. */
const PAGE_SIZE = 100

interface RoutineSessionResource {
  order: number
  label: string
  exercises: {
    exerciseId: string
    exerciseName: string
    sets: number
    reps: number
    targetLoadKg: number
    restSeconds: number
  }[]
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
  totalPages: number
}

interface RoutineVersionResource {
  number: number
  changedAt: string
  author: string
  sessions: RoutineSessionResource[]
}

interface ClientPageResource {
  content: { id: string; fullName: string; status: string }[]
}

interface AssignmentResource {
  routineId: string
  current: boolean
}

function toStatus(status: string): RoutineStatus {
  return status === 'ACTIVE' || status === 'CLOSED' ? status : 'DRAFT'
}

function toSession(resource: RoutineSessionResource): RoutineSession {
  return {
    order: resource.order,
    label: resource.label,
    exercises: (resource.exercises ?? []).map((exercise) => ({
      ...exercise,
      targetLoadKg: Number(exercise.targetLoadKg) || 0,
    })),
  }
}

function toRoutine(resource: RoutineResource, clientsByRoutine = new Map<string, string[]>()): Routine {
  return {
    id: resource.id,
    name: resource.name,
    status: toStatus(resource.status),
    currentVersion: resource.currentVersion,
    sessions: (resource.sessions ?? []).map(toSession),
    createdAtLabel: formatDate(resource.createdAt),
    assignedClients: clientsByRoutine.get(resource.id) ?? [],
  }
}

// The routine resource does not list its clients. They are read from the current assignment of
// every active client of the trainer, keyed by routine id.
async function getClientsByRoutine(signal?: AbortSignal): Promise<Map<string, string[]>> {
  const byRoutine = new Map<string, string[]>()
  try {
    const clients = await apiClient.get<ClientPageResource>(`/clients?status=ACTIVE&size=${PAGE_SIZE}`, { signal })
    await Promise.all(
      clients.content.map(async (client) => {
        const assignments = await apiClient.get<AssignmentResource[]>(`/clients/${client.id}/assignments`, {
          signal,
        })
        const current = assignments.find((assignment) => assignment.current)
        if (current) byRoutine.set(current.routineId, [...(byRoutine.get(current.routineId) ?? []), client.fullName])
      }),
    )
  } catch {
    // The clients are complementary data: the routines are still shown without them.
  }
  return byRoutine
}

const NOT_FOUND: ErrorMapping<RoutinesErrorCode> = { code: 'ROUTINE_NOT_FOUND', message: 'No encontramos esa rutina.' }
const INVALID: ErrorMapping<RoutinesErrorCode> = {
  code: 'VALIDATION',
  message: 'Revisa los datos de la rutina e inténtalo de nuevo.',
}
const UNEXPECTED: ErrorMapping<RoutinesErrorCode> = {
  code: 'UNEXPECTED',
  message: 'No pudimos completar la operación. Inténtalo de nuevo.',
}

/**
 * Calls the routine endpoints of the backend.
 */
export const routinesService = {
  /**
   * Fetches every routine of the trainer, with the clients that follow each one.
   *
   * @param signal - Signal used to cancel the request.
   * @returns The routines; an empty array when there are none.
   * @throws {@link ServiceError} with a {@link RoutinesErrorCode} when the request fails.
   */
  async list(signal?: AbortSignal): Promise<Routine[]> {
    try {
      const clients = getClientsByRoutine(signal)
      const resources: RoutineResource[] = []
      let totalPages = 1
      for (let page = 0; page < totalPages; page += 1) {
        const result = await apiClient.get<RoutinePageResource>(`/routines?page=${page}&size=${PAGE_SIZE}`, {
          signal,
        })
        totalPages = Math.max(result.totalPages, 1)
        resources.push(...result.content)
      }
      const clientsByRoutine = await clients
      return resources.map((resource) => toRoutine(resource, clientsByRoutine))
    } catch (error) {
      throwServiceError(error, {}, UNEXPECTED)
    }
  },

  /**
   * Fetches one routine with its current version.
   *
   * @param routineId - Identifier of the routine.
   * @param signal - Signal used to cancel the request.
   * @returns The routine.
   * @throws {@link ServiceError} with code `ROUTINE_NOT_FOUND` when the routine is not available.
   */
  async getById(routineId: string, signal?: AbortSignal): Promise<Routine> {
    try {
      const [resource, clientsByRoutine] = await Promise.all([
        apiClient.get<RoutineResource>(`/routines/${routineId}`, { signal }),
        getClientsByRoutine(signal),
      ])
      return toRoutine(resource, clientsByRoutine)
    } catch (error) {
      throwServiceError(error, { 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Creates a routine as a draft.
   *
   * @param input - Name and sessions of the routine.
   * @returns The routine as stored by the server.
   * @throws {@link ServiceError} with code `VALIDATION` when the server rejects the data.
   */
  async create(input: SaveRoutineInput): Promise<Routine> {
    try {
      return toRoutine(await apiClient.post<RoutineResource>('/routines', input))
    } catch (error) {
      throwServiceError(error, { 400: INVALID, 404: INVALID, 422: INVALID }, UNEXPECTED)
    }
  },

  /**
   * Saves changes to a routine, which creates a new version.
   *
   * @param routineId - Identifier of the routine.
   * @param input - Name and sessions of the routine.
   * @returns The routine with its new current version.
   * @throws {@link ServiceError} with code `VALIDATION` when the server rejects the data.
   */
  async update(routineId: string, input: SaveRoutineInput): Promise<Routine> {
    try {
      const [resource, clientsByRoutine] = await Promise.all([
        apiClient.put<RoutineResource>(`/routines/${routineId}`, input),
        getClientsByRoutine(),
      ])
      return toRoutine(resource, clientsByRoutine)
    } catch (error) {
      throwServiceError(error, { 400: INVALID, 404: NOT_FOUND, 422: INVALID }, UNEXPECTED)
    }
  },

  /**
   * Fetches the saved versions of a routine.
   *
   * @param routineId - Identifier of the routine.
   * @param signal - Signal used to cancel the request.
   * @returns The versions, newest first.
   * @throws {@link ServiceError} with code `ROUTINE_NOT_FOUND` when the routine is not available.
   */
  async getVersions(routineId: string, signal?: AbortSignal): Promise<RoutineVersion[]> {
    try {
      const versions = await apiClient.get<RoutineVersionResource[]>(`/routines/${routineId}/versions`, {
        signal,
      })
      return versions
        .map((version) => ({
          number: version.number,
          changedAtLabel: formatDateTime(version.changedAt),
          author: version.author,
          sessions: (version.sessions ?? []).map(toSession),
        }))
        .sort((a, b) => b.number - a.number)
    } catch (error) {
      throwServiceError(error, { 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Copies a routine into a new draft without clients.
   *
   * @param routineId - Identifier of the routine to copy.
   * @param name - Name of the copy.
   * @returns The new routine.
   * @throws {@link ServiceError} with code `ROUTINE_NOT_FOUND` when the routine is not available.
   */
  async duplicate(routineId: string, name: string): Promise<Routine> {
    try {
      return toRoutine(
        await apiClient.post<RoutineResource>(`/routines/${routineId}/duplicates`, { name: name.trim() }),
      )
    } catch (error) {
      throwServiceError(error, { 400: INVALID, 404: NOT_FOUND, 422: INVALID }, UNEXPECTED)
    }
  },

  /**
   * Assigns a routine to clients; the routine each one was following is closed.
   *
   * @param routineId - Identifier of the routine.
   * @param input - Clients and first day of the assignment.
   * @throws {@link ServiceError} with code `CLIENT_NOT_ASSIGNABLE` when a client is not active.
   */
  async assign(routineId: string, input: AssignRoutineInput): Promise<void> {
    try {
      await apiClient.post(`/routines/${routineId}/assignments`, input)
    } catch (error) {
      throwServiceError<RoutinesErrorCode>(
        error,
        {
          400: { code: 'VALIDATION', message: 'Revisa los clientes, la fecha y los días elegidos. La asignación podría haberse aplicado solo a algunos clientes.' },
          403: { code: 'ROUTINE_NOT_FOUND', message: 'No tienes acceso a esta rutina. La asignación podría haberse aplicado solo a algunos clientes.' },
          404: { code: 'ROUTINE_NOT_FOUND', message: 'No encontramos esta rutina. La asignación podría haberse aplicado solo a algunos clientes.' },
          422: { code: 'CLIENT_NOT_ASSIGNABLE', message: 'Uno o más clientes no están activos. La asignación podría haberse aplicado solo a algunos clientes.' },
        },
        { code: 'UNEXPECTED', message: 'No pudimos completar la asignación. Podría haberse aplicado solo a algunos clientes.' },
      )
    }
  },
}
