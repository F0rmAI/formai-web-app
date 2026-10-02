/**
 * Service for the clients of a trainer.
 *
 * @author Melina
 * @packageDocumentation
 */

import type {
  ActivationCode,
  BodyProfile,
  ClientDetail,
  ClientStatus,
  ClientStatusFilter,
  ClientSummary,
  CurrentRoutine,
  RegisterClientInput,
  UpdateBodyProfileInput,
} from '@/types/client'
import { formatDate, formatDateTime } from '@/utils/format'
import { ApiError, apiClient } from './api-client'
import { throwServiceError } from './service-error'

/**
 * Codes reported by {@link clientsService}.
 *
 * @remarks
 * - `CLIENT_NOT_FOUND`: the client does not exist or belongs to another trainer.
 * - `INVALID_CLIENT_NAME`: the server rejected the full name.
 * - `INVALID_BODY_PROFILE`: the server rejected the profile values.
 * - `UNEXPECTED`: any other failure.
 */
export type ClientsErrorCode = 'CLIENT_NOT_FOUND' | 'INVALID_CLIENT_NAME' | 'INVALID_BODY_PROFILE' | 'UNEXPECTED'

/** Page size that fits the whole portfolio of a trainer in one request. */
const PAGE_SIZE = 100

/** Lifetime of an activation code in the backend, in milliseconds. */
const ACTIVATION_CODE_VALIDITY_MS = 72 * 60 * 60 * 1000

interface ClientResource {
  id: string
  fullName: string
  email: string | null
  status: string
  registeredAt: string
}

interface ClientPageResource {
  content: ClientResource[]
}

interface ClientOverviewResource {
  clientId: string
  fullName: string
  status: string
  activeRoutineName: string | null
  lastWorkoutOn: string | null
}

interface ClientOverviewPageResource {
  content: ClientOverviewResource[]
}

interface RegisteredClientResource {
  id: string
  fullName: string
  status: string
  activationCode: string
  activationCodeExpiresAt: string
}

interface ActivationCodeResource {
  clientId: string
  activationCode: string
  expiresAt: string
}

interface BodyProfileResource {
  goal: string
  heightCm: number
  weightKg: number
  restrictions: string | null
  weightHistory: { weightKg: number; recordedOn: string }[]
}

interface AssignmentResource {
  routineId: string
  routineName: string
  startDate: string
  current: boolean
}

interface RoutineVersionHolder {
  currentVersion: number
}

// The list endpoint does not return the expiration of the activation code. Expirations learned in
// this session (register or regenerate) are kept so a regenerated code is not shown as expired.
const invitationExpiresAt = new Map<string, number>()

/** Derives the client state, telling a valid invitation from an expired one. */
function toStatus(client: ClientResource): ClientStatus {
  if (client.status === 'ACTIVE' || client.status === 'INACTIVE') return client.status
  const registeredAt = new Date(client.registeredAt).getTime()
  const expiresAt = invitationExpiresAt.get(client.id) ?? registeredAt + ACTIVATION_CODE_VALIDITY_MS
  return expiresAt < Date.now() ? 'INVITATION_EXPIRED' : 'INVITED'
}

/** Stores the expiration of an activation code issued in this session. */
function rememberExpiration(clientId: string, expiresAt: string) {
  const time = new Date(expiresAt).getTime()
  if (!Number.isNaN(time)) invitationExpiresAt.set(clientId, time)
}

/** Builds the query string of the list endpoints. */
function toQuery(search: string, status: ClientStatusFilter): string {
  const params = new URLSearchParams({ page: '0', size: String(PAGE_SIZE) })
  if (search.trim()) params.set('search', search.trim())
  // The backend only knows INVITED; the expired state is derived here.
  if (status !== 'ALL') params.set('status', status === 'INVITATION_EXPIRED' ? 'INVITED' : status)
  return `?${params.toString()}`
}

function toSummary(client: ClientResource, overview?: ClientOverviewResource): ClientSummary {
  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    status: toStatus(client),
    currentRoutine: overview?.activeRoutineName ?? null,
    lastWorkout: formatDate(overview?.lastWorkoutOn, 'weekday') || null,
  }
}

function toBodyProfile(profile: BodyProfileResource | null): BodyProfile {
  const history = [...(profile?.weightHistory ?? [])].sort((a, b) => b.recordedOn.localeCompare(a.recordedOn))
  return {
    goal: profile?.goal ?? '',
    weight: Number(profile?.weightKg) || 0,
    height: Number(profile?.heightCm) || 0,
    restrictions: profile?.restrictions ?? '',
    updatedAt: formatDate(history[0]?.recordedOn, 'day'),
    weightHistory: history.map((entry) => ({
      date: formatDate(entry.recordedOn),
      weight: Number(entry.weightKg) || 0,
    })),
  }
}

/** Reads the body profile; a client without one is not an error. */
async function getBodyProfile(clientId: string, signal?: AbortSignal): Promise<BodyProfileResource | null> {
  try {
    return await apiClient.get<BodyProfileResource>(`/v1/clients/${clientId}/body-profile`, { signal })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** Reads the routine a client follows today, with its current version when available. */
async function getCurrentRoutine(clientId: string, signal?: AbortSignal): Promise<CurrentRoutine | null> {
  const assignments = await apiClient.get<AssignmentResource[]>(`/v1/clients/${clientId}/assignments`, { signal })
  const current = assignments.find((assignment) => assignment.current)
  if (!current) return null
  const routine = await apiClient
    .get<RoutineVersionHolder>(`/v1/routines/${current.routineId}`, { signal })
    .catch(() => null)
  return {
    id: current.routineId,
    name: current.routineName,
    assignedSince: formatDate(current.startDate, 'long'),
    version: routine?.currentVersion ?? null,
  }
}

const NOT_FOUND = { code: 'CLIENT_NOT_FOUND', message: 'No se encontró el cliente solicitado.' } as const
const INVALID_NAME = { code: 'INVALID_CLIENT_NAME', message: 'El nombre completo es obligatorio y debe tener como máximo 120 caracteres.' } as const
const UNEXPECTED = { code: 'UNEXPECTED', message: 'No pudimos completar la operación. Inténtalo de nuevo.' } as const

/**
 * Calls the client endpoints of the backend.
 */
export const clientsService = {
  /**
   * Fetches the clients of the trainer that match the search and the status.
   *
   * @param search - Text matched against the client name; empty to list everyone.
   * @param status - Status to keep; `ALL` disables the filter.
   * @param signal - Signal used to cancel the request.
   * @returns The matching clients; an empty array when there are none.
   * @throws {@link ServiceError} with a {@link ClientsErrorCode} when the request fails.
   */
  async list(search = '', status: ClientStatusFilter = 'ALL', signal?: AbortSignal): Promise<ClientSummary[]> {
    const query = toQuery(search, status)
    try {
      const [clients, overviews] = await Promise.all([
        apiClient.get<ClientPageResource>(`/v1/clients${query}`, { signal }),
        apiClient.get<ClientOverviewPageResource>(`/v1/client-overviews${query}`, { signal }),
      ])
      const overviewById = new Map(overviews.content.map((overview) => [overview.clientId, overview]))
      const summaries = clients.content.map((client) => toSummary(client, overviewById.get(client.id)))
      const derived = status === 'INVITED' || status === 'INVITATION_EXPIRED'
      return derived ? summaries.filter((client) => client.status === status) : summaries
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, {}, UNEXPECTED)
    }
  },

  /**
   * Fetches one client with its body profile and current routine.
   *
   * @param clientId - Identifier of the client.
   * @param signal - Signal used to cancel the request.
   * @returns The client detail.
   * @throws {@link ServiceError} with code `CLIENT_NOT_FOUND` when the client is not in the portfolio.
   */
  async getById(clientId: string, signal?: AbortSignal): Promise<ClientDetail> {
    try {
      const [client, profile, routine, overviews] = await Promise.all([
        apiClient.get<ClientResource>(`/v1/clients/${clientId}`, { signal }),
        getBodyProfile(clientId, signal),
        getCurrentRoutine(clientId, signal),
        apiClient.get<ClientOverviewPageResource>(`/v1/client-overviews?size=${PAGE_SIZE}`, { signal }),
      ])
      const overview = overviews.content.find((item) => item.clientId === clientId)
      return {
        ...toSummary(client, overview),
        activeSince: formatDate(client.registeredAt, 'long'),
        bodyProfile: toBodyProfile(profile),
        routine,
      }
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, { 403: NOT_FOUND, 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Registers a client and issues the activation code.
   *
   * @param input - Full name of the client.
   * @returns The activation code to share with the client.
   * @throws {@link ServiceError} with code `INVALID_CLIENT_NAME` when the name is invalid.
   */
  async register(input: RegisterClientInput): Promise<ActivationCode> {
    try {
      const created = await apiClient.post<RegisteredClientResource>('/v1/clients', input)
      rememberExpiration(created.id, created.activationCodeExpiresAt)
      return {
        clientId: created.id,
        clientName: created.fullName,
        code: created.activationCode,
        expiresAt: formatDateTime(created.activationCodeExpiresAt, 'long'),
      }
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, { 400: INVALID_NAME }, UNEXPECTED)
    }
  },

  /**
   * Replaces a client's full name.
   *
   * @param clientId - Identifier of the client.
   * @param fullName - New full name, at most 120 characters.
   * @returns The updated client resource.
   * @throws {@link ServiceError} with code `CLIENT_NOT_FOUND` or `INVALID_CLIENT_NAME`.
   */
  async rename(clientId: string, fullName: string): Promise<ClientResource> {
    try {
      return await apiClient.put<ClientResource>(`/v1/clients/${clientId}`, { fullName: fullName.trim() })
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, { 400: INVALID_NAME, 403: NOT_FOUND, 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Issues a new activation code and invalidates the previous one.
   *
   * @param clientId - Identifier of the client.
   * @returns The new activation code.
   * @throws {@link ServiceError} with code `CLIENT_NOT_FOUND` when the client is not in the portfolio.
   */
  async regenerateCode(clientId: string): Promise<ActivationCode> {
    try {
      const [code, client] = await Promise.all([
        apiClient.post<ActivationCodeResource>(`/v1/clients/${clientId}/activation-codes`),
        apiClient.get<ClientResource>(`/v1/clients/${clientId}`),
      ])
      rememberExpiration(code.clientId, code.expiresAt)
      return {
        clientId: code.clientId,
        clientName: client.fullName,
        code: code.activationCode,
        expiresAt: formatDateTime(code.expiresAt, 'long'),
      }
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, { 403: NOT_FOUND, 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Deactivates a client; the client can no longer sign in and the history is kept.
   *
   * @param clientId - Identifier of the client.
   * @throws {@link ServiceError} with code `CLIENT_NOT_FOUND` when the client is not in the portfolio.
   */
  async deactivate(clientId: string): Promise<void> {
    try {
      await apiClient.post(`/v1/clients/${clientId}/deactivations`)
    } catch (error) {
      throwServiceError<ClientsErrorCode>(error, { 403: NOT_FOUND, 404: NOT_FOUND }, UNEXPECTED)
    }
  },

  /**
   * Replaces the body profile of a client.
   *
   * @param clientId - Identifier of the client.
   * @param input - New profile values.
   * @throws {@link ServiceError} with code `INVALID_BODY_PROFILE` when a value is out of range.
   */
  async updateBodyProfile(clientId: string, input: UpdateBodyProfileInput): Promise<void> {
    try {
      await apiClient.put(`/v1/clients/${clientId}/body-profile`, {
        goal: input.goal,
        heightCm: input.height,
        weightKg: input.weight,
        restrictions: input.restrictions || null,
      })
    } catch (error) {
      throwServiceError<ClientsErrorCode>(
        error,
        {
          403: NOT_FOUND,
          404: NOT_FOUND,
          422: { code: 'INVALID_BODY_PROFILE', message: 'Los datos de la ficha física no son válidos.' },
        },
        UNEXPECTED,
      )
    }
  },
}
