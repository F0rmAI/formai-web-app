import {
  CLIENTS_MOCK_CODES,
  CLIENTS_MOCK_DATA,
  CLIENTS_MOCK_EXPIRATION,
  CLIENTS_MOCK_LATENCY_MS,
} from './clients.mock-data'
import { ClientsServiceError, type ClientsService } from '@/services/clients.contract'
import type {
  ActivationCode,
  ClientDetail,
  ClientStatusFilter,
  ClientSummary,
  RegisterClientInput,
  UpdateBodyProfileInput,
} from '@/types/client'

const wait = () => new Promise((resolve) => window.setTimeout(resolve, CLIENTS_MOCK_LATENCY_MS))

function toSummary(client: ClientDetail): ClientSummary {
  const { bodyProfile: _bodyProfile, routine: _routine, activeSince: _activeSince, ...summary } = client
  return summary
}

function activationCode(clientId: string, clientName: string, code: string): ActivationCode {
  return {
    clientId,
    clientName,
    code,
    expiresAt: CLIENTS_MOCK_EXPIRATION,
  }
}

/**
 * Crea una instancia aislada del adaptador mock.
 * El estado mutable vive dentro de la fábrica y nunca en los componentes.
 */
export function createMockClientsService(): ClientsService {
  let clients = structuredClone(CLIENTS_MOCK_DATA)

  return {
    async list(query = '', status: ClientStatusFilter = 'ALL') {
      await wait()
      const normalizedQuery = query.trim().toLocaleLowerCase('es')
      return clients
        .filter((client) => status === 'ALL' || client.status === status)
        .filter((client) => !normalizedQuery || client.fullName.toLocaleLowerCase('es').includes(normalizedQuery))
        .map(toSummary)
    },

    async getById(clientId: string) {
      await wait()
      const client = clients.find(({ id }) => id === clientId)
      if (!client) throw new ClientsServiceError('CLIENT_NOT_FOUND', 'No se encontró el cliente solicitado.')
      return structuredClone(client)
    },

    async register(input: RegisterClientInput) {
      await wait()
      const existingClient = clients.find(
        ({ email }) => email.toLocaleLowerCase('es') === input.email.toLocaleLowerCase('es'),
      )
      if (existingClient) {
        throw new ClientsServiceError(
          'EMAIL_ALREADY_EXISTS',
          `Este correo ya pertenece a uno de tus clientes (${existingClient.fullName}).`,
        )
      }

      const id = input.fullName.toLocaleLowerCase('es').replaceAll(' ', '-')
      const client: ClientDetail = {
        id,
        fullName: input.fullName,
        email: input.email,
        status: 'INVITED',
        currentRoutine: null,
        lastWorkout: null,
        activeSince: '',
        bodyProfile: {
          goal: '',
          weight: 0,
          height: 0,
          restrictions: '',
          updatedAt: '',
          weightHistory: [],
        },
        routine: null,
      }
      clients = [...clients, client]
      return activationCode(client.id, client.fullName, CLIENTS_MOCK_CODES.registration)
    },

    async regenerateCode(clientId: string) {
      await wait()
      const client = clients.find(({ id }) => id === clientId)
      if (!client) throw new ClientsServiceError('CLIENT_NOT_FOUND', 'No se encontró el cliente solicitado.')
      clients = clients.map((item) => (item.id === clientId ? { ...item, status: 'INVITED' } : item))
      return activationCode(client.id, client.fullName, CLIENTS_MOCK_CODES.regeneration)
    },

    async updateBodyProfile(clientId: string, input: UpdateBodyProfileInput) {
      await wait()
      if (input.weight <= 0 || input.height < 100 || input.height > 250) {
        throw new ClientsServiceError('INVALID_BODY_PROFILE', 'Los datos de la ficha física no son válidos.')
      }

      const client = clients.find(({ id }) => id === clientId)
      if (!client) throw new ClientsServiceError('CLIENT_NOT_FOUND', 'No se encontró el cliente solicitado.')

      const updatedClient: ClientDetail = {
        ...client,
        bodyProfile: {
          ...input,
          updatedAt: 'Hoy',
          weightHistory: [{ date: 'Hoy', weight: input.weight }, ...client.bodyProfile.weightHistory],
        },
      }
      clients = clients.map((item) => (item.id === clientId ? updatedClient : item))
      return structuredClone(updatedClient)
    },
  }
}
