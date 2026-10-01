/**
 * Error shared by the resource services, with a stable code for the hooks.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { ApiError } from './api-client'

/**
 * Error thrown by a resource service when a request fails.
 *
 * @remarks
 * Services translate HTTP failures into a `code` of their domain and a message ready to show, so
 * hooks never depend on status codes. The detail sent by the backend is written in English for
 * developers and is never shown.
 *
 * @typeParam TCode - Union of the codes the service can report.
 */
export class ServiceError<TCode extends string = string> extends Error {
  /** Domain code that identifies the failure. */
  readonly code: TCode

  /**
   * @param code - Domain code that identifies the failure.
   * @param message - Text ready to show to the user, in the language of the product.
   */
  constructor(code: TCode, message: string) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}

/**
 * Describes how a service maps an HTTP status to a domain failure.
 *
 * @typeParam TCode - Union of the codes the service can report.
 */
export interface ErrorMapping<TCode extends string> {
  /** Domain code reported for the status. */
  code: TCode
  /** Text shown to the user, in the language of the product. */
  message: string
}

/**
 * Converts any failure into a {@link ServiceError} and throws it.
 *
 * @typeParam TCode - Union of the codes the service can report.
 * @param error - Value caught by the service.
 * @param byStatus - Mapping from HTTP status to domain failure.
 * @param otherwise - Failure reported for any status that is not mapped and for network errors.
 * @throws {@link ServiceError} always.
 */
export function throwServiceError<TCode extends string>(
  error: unknown,
  byStatus: Partial<Record<number, ErrorMapping<TCode>>>,
  otherwise: ErrorMapping<TCode>,
): never {
  if (error instanceof ServiceError) throw error
  if (error instanceof ApiError) {
    const mapping = byStatus[error.status] ?? otherwise
    throw new ServiceError(mapping.code, mapping.message)
  }
  throw new ServiceError(otherwise.code, otherwise.message)
}
