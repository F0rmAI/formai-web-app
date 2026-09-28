import { createMockClientsService } from '@/mocks/clients.mock-service'
import type { ClientsService } from './clients.contract'

export { ClientsServiceError } from './clients.contract'
export type { ClientsService, ClientsServiceErrorCode } from './clients.contract'

/**
 * Punto único de composición para clientes.
 *
 * Durante el desarrollo usa el adaptador mock. Al integrar el backend se
 * sustituye únicamente esta construcción por el adaptador HTTP; los hooks y
 * componentes seguirán consumiendo el mismo contrato.
 */
export const clientsService: ClientsService = createMockClientsService()
