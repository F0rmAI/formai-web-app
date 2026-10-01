/**
 * HTTP client shared by every service.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */

import { API_URL } from './config'

/**
 * Picks the most useful message from an error body in problem-detail format.
 *
 * @param body - Parsed response body.
 * @param fallback - Message used when the body carries none.
 * @returns The first non-empty value among `detail`, `message` and `title`, or the fallback.
 */
function problemDetailMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>
    for (const key of ['detail', 'message', 'title'] as const) {
      const value = record[key]
      if (typeof value === 'string' && value.trim().length > 0) return value.trim()
    }
  }
  return fallback
}

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
  /** When `true`, a `401` response does not run the unauthorized handler (public auth routes). */
  skipUnauthorizedHandler?: boolean
}

/** Callback run when a request is rejected because the session is no longer valid. */
type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

/**
 * Registers the callback run when the backend answers `401`.
 *
 * @param handler - Callback to run, or `null` to remove the current one.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

/**
 * Sends a JSON request to the backend and parses the response.
 *
 * @typeParam T - Shape of the response body.
 * @param method - HTTP method.
 * @param path - Path appended to the base URL, starting with `/`.
 * @param options - Body, extra headers, abort signal and unauthorized handling.
 * @returns The parsed response body, or `undefined` when the response is not JSON.
 * @throws {@link ApiError} when the response status is not in the 2xx range.
 */
async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}) {
  const { body, headers, signal, skipUnauthorizedHandler } = options

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    credentials: 'include',
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
    if (response.status === 401 && !skipUnauthorizedHandler) {
      onUnauthorized?.()
    }
    throw new ApiError(
      response.status,
      problemDetailMessage(data, `${method} ${path} → ${response.status}`),
      data,
    )
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
