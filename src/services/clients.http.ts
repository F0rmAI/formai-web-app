import { ApiError, apiClient } from './api-client'
import { ClientsServiceError, type ClientsService } from './clients.contract'
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

const PAGE_SIZE = 100

interface ClientResource {
  id: string
  fullName: string
  email: string
  status: string
  registeredAt: string
}

interface ClientPageResource {
  content: ClientResource[]
  page: number
  size: number
  totalElements: number
  totalPages: number
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
  email: string
  status: string
  activationCode: string
  activationCodeExpiresAt: string
}

interface ActivationCodeResource {
  clientId: string
  activationCode: string
  expiresAt: string
}

interface WeightHistoryResource {
  weightKg: number
  recordedOn: string
}

interface BodyProfileResource {
  goal: string
  heightCm: number
  weightKg: number
  restrictions: string | null
  weightHistory: WeightHistoryResource[]
}

interface AssignmentResource {
  clientId: string
  routineId: string
  routineName: string
  startDate: string
  endDate: string | null
  current: boolean
}

/** TTL del código de activación en formai-api (User.ACTIVATION_CODE_VALIDITY). */
const ACTIVATION_CODE_VALIDITY_MS = 72 * 60 * 60 * 1000

/**
 * Expiraciones conocidas en esta sesión (registro/regeneración).
 * El listado del API no expone activationCodeExpiresAt; sin esto, tras regenerar
 * un código el cliente seguiría viéndose vencido por registeredAt antiguo.
 */
const invitationExpiresAtByClientId = new Map<string, number>()

function toApiStatus(status: ClientStatusFilter): string | undefined {
  // INVITATION_EXPIRED se deriva en el cliente; pedimos INVITED al API.
  if (status === 'ALL') return undefined
  if (status === 'INVITATION_EXPIRED') return 'INVITED'
  return status
}

function mapStatus(status: string, registeredAt?: string, clientId?: string): ClientStatus {
  if (status === 'ACTIVE' || status === 'INACTIVE') return status
  if (status !== 'INVITED') return 'INVITED'

  const sessionExpiresAt = clientId ? invitationExpiresAtByClientId.get(clientId) : undefined
  if (sessionExpiresAt !== undefined) {
    return sessionExpiresAt > Date.now() ? 'INVITED' : 'INVITATION_EXPIRED'
  }

  if (registeredAt) {
    const registeredMs = new Date(registeredAt).getTime()
    if (!Number.isNaN(registeredMs) && registeredMs + ACTIVATION_CODE_VALIDITY_MS < Date.now()) {
      return 'INVITATION_EXPIRED'
    }
  }

  return 'INVITED'
}

function rememberInvitationExpiry(clientId: string, expiresAt: string) {
  const expiresMs = new Date(expiresAt).getTime()
  if (!Number.isNaN(expiresMs)) {
    invitationExpiresAtByClientId.set(clientId, expiresMs)
  }
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildListQuery(search: string, status: ClientStatusFilter): string {
  const params = new URLSearchParams()
  const trimmed = search.trim()
  if (trimmed) params.set('search', trimmed)
  const apiStatus = toApiStatus(status)
  if (apiStatus) params.set('status', apiStatus)
  params.set('page', '0')
  params.set('size', String(PAGE_SIZE))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

function mapBodyProfile(dto: BodyProfileResource | null): BodyProfile {
  if (!dto) {
    return {
      goal: '',
      weight: 0,
      height: 0,
      restrictions: '',
      updatedAt: '',
      weightHistory: [],
    }
  }

  const history = dto.weightHistory ?? []
  const latest = history.at(-1)

  return {
    goal: dto.goal ?? '',
    weight: Number(dto.weightKg) || 0,
    height: Number(dto.heightCm) || 0,
    restrictions: dto.restrictions ?? '',
    updatedAt: formatDate(latest?.recordedOn) ?? '',
    weightHistory: history.map((entry) => ({
      date: entry.recordedOn,
      weight: Number(entry.weightKg) || 0,
    })),
  }
}

function mapRoutine(assignments: AssignmentResource[]): CurrentRoutine | null {
  const current = assignments.find((item) => item.current)
  if (!current) return null
  return {
    name: current.routineName,
    assignedSince: formatDate(current.startDate) ?? current.startDate,
    version: 1,
  }
}

function mapSummary(client: ClientResource, overview?: ClientOverviewResource): ClientSummary {
  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email,
    status: mapStatus(client.status, client.registeredAt, client.id),
    currentRoutine: overview?.activeRoutineName ?? null,
    lastWorkout: formatDate(overview?.lastWorkoutOn ?? null),
  }
}

function mapDetail(
  client: ClientResource,
  profile: BodyProfileResource | null,
  assignments: AssignmentResource[],
  overview?: ClientOverviewResource,
): ClientDetail {
  const summary = mapSummary(client, overview)
  return {
    ...summary,
    activeSince: formatDate(client.registeredAt) ?? '',
    bodyProfile: mapBodyProfile(profile),
    routine: mapRoutine(assignments),
  }
}

function isTechnicalHttpMessage(message: string): boolean {
  return /^(GET|POST|PUT|PATCH|DELETE)\s+\S+\s*→\s*\d+/.test(message)
}

function userFacingMessage(error: ApiError, fallback: string): string {
  return isTechnicalHttpMessage(error.message) ? fallback : error.message
}

function mapApiError(error: unknown, fallbackCode: 'CLIENT_NOT_FOUND' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_BODY_PROFILE'): never {
  if (error instanceof ClientsServiceError) throw error
  if (error instanceof ApiError) {
    if (error.status === 409) {
      throw new ClientsServiceError(
        'EMAIL_ALREADY_EXISTS',
        userFacingMessage(error, 'Este correo ya pertenece a uno de tus clientes.'),
      )
    }
    if (error.status === 404) {
      throw new ClientsServiceError(
        'CLIENT_NOT_FOUND',
        userFacingMessage(error, 'No se encontró el cliente solicitado.'),
      )
    }
    if (error.status === 422) {
      throw new ClientsServiceError(
        'INVALID_BODY_PROFILE',
        userFacingMessage(error, 'Los datos de la ficha física no son válidos.'),
      )
    }
    throw new ClientsServiceError(fallbackCode, userFacingMessage(error, 'No pudimos completar la operación.'))
  }
  throw error instanceof Error ? error : new Error('Error inesperado al hablar con el servidor.')
}

async function getBodyProfileOrNull(clientId: string): Promise<BodyProfileResource | null> {
  try {
    return await apiClient.get<BodyProfileResource>(`/v1/clients/${clientId}/body-profile`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function createHttpClientsService(): ClientsService {
  return {
    async list(query = '', status: ClientStatusFilter = 'ALL') {
      const qs = buildListQuery(query, status)
      try {
        const [clientsPage, overviewsPage] = await Promise.all([
          apiClient.get<ClientPageResource>(`/v1/clients${qs}`),
          apiClient.get<ClientOverviewPageResource>(`/v1/client-overviews${qs}`),
        ])

        const overviewById = new Map(overviewsPage.content.map((item) => [item.clientId, item]))
        let summaries = clientsPage.content.map((client) => mapSummary(client, overviewById.get(client.id)))

        if (status === 'INVITATION_EXPIRED') {
          summaries = summaries.filter((client) => client.status === 'INVITATION_EXPIRED')
        } else if (status === 'INVITED') {
          summaries = summaries.filter((client) => client.status === 'INVITED')
        }

        return summaries
      } catch (error) {
        mapApiError(error, 'CLIENT_NOT_FOUND')
      }
    },

    async getById(clientId: string) {
      try {
        const [client, profile, assignments, overviewsPage] = await Promise.all([
          apiClient.get<ClientResource>(`/v1/clients/${clientId}`),
          getBodyProfileOrNull(clientId),
          apiClient.get<AssignmentResource[]>(`/v1/clients/${clientId}/assignments`),
          apiClient.get<ClientOverviewPageResource>(`/v1/client-overviews?size=${PAGE_SIZE}`),
        ])
        const overview = overviewsPage.content.find((item) => item.clientId === clientId)
        return mapDetail(client, profile, assignments, overview)
      } catch (error) {
        mapApiError(error, 'CLIENT_NOT_FOUND')
      }
    },

    async register(input: RegisterClientInput) {
      try {
        const created = await apiClient.post<RegisteredClientResource>('/v1/clients', {
          fullName: input.fullName,
          email: input.email,
        })
        rememberInvitationExpiry(created.id, created.activationCodeExpiresAt)
        return {
          clientId: created.id,
          clientName: created.fullName,
          code: created.activationCode,
          expiresAt: created.activationCodeExpiresAt,
        } satisfies ActivationCode
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          // Intentar enriquecer con el nombre del cliente ya registrado en la cartera.
          try {
            const existing = await apiClient.get<ClientPageResource>(
              `/v1/clients?search=${encodeURIComponent(input.email)}&size=20`,
            )
            const match = existing.content.find(
              (client) => client.email.toLocaleLowerCase('es') === input.email.trim().toLocaleLowerCase('es'),
            )
            if (match) {
              throw new ClientsServiceError(
                'EMAIL_ALREADY_EXISTS',
                `Este correo ya pertenece a uno de tus clientes (${match.fullName}).`,
              )
            }
          } catch (lookupError) {
            if (lookupError instanceof ClientsServiceError) throw lookupError
          }
          throw new ClientsServiceError(
            'EMAIL_ALREADY_EXISTS',
            userFacingMessage(
              error,
              'Este correo ya pertenece a uno de tus clientes.',
            ),
          )
        }
        mapApiError(error, 'EMAIL_ALREADY_EXISTS')
      }
    },

    async regenerateCode(clientId: string) {
      try {
        const [code, client] = await Promise.all([
          apiClient.post<ActivationCodeResource>(`/v1/clients/${clientId}/activation-codes`),
          apiClient.get<ClientResource>(`/v1/clients/${clientId}`),
        ])
        rememberInvitationExpiry(code.clientId, code.expiresAt)
        return {
          clientId: code.clientId,
          clientName: client.fullName,
          code: code.activationCode,
          expiresAt: code.expiresAt,
        } satisfies ActivationCode
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          throw new ClientsServiceError('CLIENT_NOT_FOUND', error.message)
        }
        mapApiError(error, 'CLIENT_NOT_FOUND')
      }
    },

    async deactivate(clientId: string) {
      try {
        await apiClient.post<ClientResource>(`/v1/clients/${clientId}/deactivations`)
        return await this.getById(clientId)
      } catch (error) {
        mapApiError(error, 'CLIENT_NOT_FOUND')
      }
    },

    async updateBodyProfile(clientId: string, input: UpdateBodyProfileInput) {
      try {
        await apiClient.put<BodyProfileResource>(`/v1/clients/${clientId}/body-profile`, {
          goal: input.goal,
          heightCm: input.height,
          weightKg: input.weight,
          restrictions: input.restrictions || null,
        })
        return await this.getById(clientId)
      } catch (error) {
        mapApiError(error, 'INVALID_BODY_PROFILE')
      }
    },
  }
}
