import type {
  ActivationCode,
  ClientDetail,
  ClientStatusFilter,
  ClientSummary,
  RegisterClientInput,
  UpdateBodyProfileInput,
} from '@/types/client'

export type ClientsServiceErrorCode =
  | 'EMAIL_ALREADY_EXISTS'
  | 'CLIENT_NOT_FOUND'
  | 'INVALID_BODY_PROFILE'

/**
 * Error estable de la capa de clientes.
 *
 * Tanto el adaptador mock como el futuro adaptador HTTP deben traducir sus
 * errores a estos códigos para que los componentes no dependan del backend.
 */
export class ClientsServiceError extends Error {
  readonly code: ClientsServiceErrorCode

  constructor(code: ClientsServiceErrorCode, message: string) {
    super(message)
    this.name = 'ClientsServiceError'
    this.code = code
  }
}

/** Contrato que consumen los hooks, independientemente del origen de datos. */
export interface ClientsService {
  list(query?: string, status?: ClientStatusFilter): Promise<ClientSummary[]>
  getById(clientId: string): Promise<ClientDetail>
  register(input: RegisterClientInput): Promise<ActivationCode>
  regenerateCode(clientId: string): Promise<ActivationCode>
  deactivate(clientId: string): Promise<ClientDetail>
  updateBodyProfile(clientId: string, input: UpdateBodyProfileInput): Promise<ClientDetail>
}
