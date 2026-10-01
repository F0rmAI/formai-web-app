/**
 * HTTP client shared by every service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { API_URL } from './config'

/**
 * Error thrown when the backend responds with a non-success status.
 */
export class ApiError extends Error {
  /** HTTP status code of the response. */
  readonly status: number
  /** Parsed response body, when the server sent JSON. */
  readonly body: unknown

  /**
   * @param status - HTTP status code of the response.
   * @param message - Human-readable description, used for logging.
   * @param body - Parsed response body, when available.
   */
  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** Options accepted by every request. */
interface RequestOptions {
  /** Value serialized as the JSON body. */
  body?: unknown
  /** Headers added to the default ones. */
  headers?: Record<string, string>
  /** Signal used to cancel the request. */
  signal?: AbortSignal
}

/**
 * Sends a JSON request to the backend and parses the response.
 *
 * @typeParam T - Shape of the response body.
 * @param method - HTTP method.
 * @param path - Path appended to the base URL, starting with `/`.
 * @param options - Body, extra headers and abort signal.
 * @returns The parsed response body, or `undefined` when the response is not JSON.
 * @throws {@link ApiError} when the response status is not in the 2xx range.
 */
async function request<T>(method: HttpMethod, path: string, { body, headers, signal }: RequestOptions = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data: unknown = isJson ? await response.json() : undefined

  if (!response.ok) {
    throw new ApiError(response.status, `${method} ${path} → ${response.status}`, data)
  }

  return data as T
}

/**
 * Typed HTTP client. Every service reaches the backend through it.
 */
export const apiClient = {
  /**
   * Sends a `GET` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),

  /**
   * Sends a `POST` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('POST', path, { ...options, body }),

  /**
   * Sends a `PUT` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>('PUT', path, { ...options, body }),

  /**
   * Sends a `PATCH` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param body - Value serialized as the JSON body.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),

  /**
   * Sends a `DELETE` request.
   *
   * @typeParam T - Shape of the response body.
   * @param path - Path appended to the base URL.
   * @param options - Extra headers and abort signal.
   * @returns The parsed response body.
   * @throws {@link ApiError} when the response status is not in the 2xx range.
   */
  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('DELETE', path, options),
}
