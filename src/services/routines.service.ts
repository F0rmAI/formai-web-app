import { createHttpRoutinesService } from './routines.http'

export { RoutinesServiceError } from './routines.contract'
export const routinesService = createHttpRoutinesService()
