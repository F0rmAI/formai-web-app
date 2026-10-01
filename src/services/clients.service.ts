import { createHttpClientsService } from './clients.http'

export { ClientsServiceError } from './clients.contract'
export type { ClientsService, ClientsServiceErrorCode } from './clients.contract'

/**
 * Punto único de composición para clientes.
 *
 * Los datos de demostración viven en `src/mocks/` por si se necesita un
 * adaptador local; el runtime usa el adaptador HTTP de formai-api.
 */
export const clientsService = createHttpClientsService()
